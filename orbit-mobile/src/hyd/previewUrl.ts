const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export type PreviewPayload = {
  ip?: string;
  port?: number;
  url?: string;
  publicUrl?: string;
  addresses?: string[];
};

export function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK.has(hostname.trim().toLowerCase());
}

export function isTunnelHost(hostname: string): boolean {
  return /ngrok|exp\.direct|trycloudflare|loca\.lt|cloudflare/i.test(hostname);
}

export function rewriteHost(url: string, hostname: string): string {
  const next = new URL(url);
  next.hostname = hostname;
  return next.toString().replace(/\/$/, '');
}

export function hostFromMetroUri(hostUri?: string | null): string | null {
  const host = hostUri?.split(':')[0]?.trim() ?? '';
  if (!host || isLoopbackHost(host)) return null;
  return host;
}

export function nativeApiBaseUrl(configured: string, metroHostUri?: string | null): string {
  const host = hostFromMetroUri(metroHostUri);
  if (!host) return configured;
  try {
    return rewriteHost(configured, host);
  } catch {
    return `http://${host}:5189`;
  }
}

export function phonePreviewFromLocation(hostname: string, port: string, protocol = 'http:'): string | null {
  if (!hostname || isLoopbackHost(hostname)) return null;
  const suffix = port ? `:${port}` : '';
  return `${protocol}//${hostname}${suffix}/`;
}

export function qrImageSrc(url: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(url)}`;
}

export function expoGoUrlFromPreview(url: string): string {
  const parsed = new URL(url);
  const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
  return `exp://${parsed.hostname}:${port}`;
}

export function shareUrlFromPreview(url: string): { url: string; kind: 'expo-go' | 'browser' } {
  const parsed = new URL(url);
  if (parsed.protocol === 'https:' || isTunnelHost(parsed.hostname)) {
    return { url: normalizePreviewUrl(url), kind: 'browser' };
  }
  return { url: expoGoUrlFromPreview(url), kind: 'expo-go' };
}

export function normalizePreviewUrl(url: string): string {
  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  const href = parsed.toString();
  return href.endsWith('/') ? href : `${href}/`;
}

export async function resolvePhonePreviewUrl(opts: {
  hostname: string;
  port: string;
  protocol?: string;
  apiBaseUrl: string;
  fetchJson?: (url: string) => Promise<PreviewPayload>;
}): Promise<string> {
  const fromLocation = phonePreviewFromLocation(opts.hostname, opts.port, opts.protocol ?? 'http:');
  if (fromLocation) return normalizePreviewUrl(fromLocation);

  const pagePort = Number(opts.port) || 8081;
  const candidates = [
    `${opts.apiBaseUrl.replace(/\/$/, '')}/preview?port=${pagePort}`,
    `http://127.0.0.1:5189/preview?port=${pagePort}`,
    `http://localhost:5189/preview?port=${pagePort}`,
  ];

  const fetchJson = opts.fetchJson ?? (async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`preview ${response.status}`);
    return (await response.json()) as PreviewPayload;
  });

  for (const candidate of [...new Set(candidates)]) {
    try {
      const body = await fetchJson(candidate);
      const publicUrl = body.publicUrl?.trim();
      if (publicUrl) {
        const publicHost = new URL(publicUrl).hostname;
        if (!isLoopbackHost(publicHost)) return normalizePreviewUrl(publicUrl);
      }
      if (!body.url) continue;
      const host = new URL(body.url).hostname;
      if (isLoopbackHost(host)) continue;
      return normalizePreviewUrl(body.url);
    } catch {
      // Try the next preview origin.
    }
  }

  throw new Error('Could not detect a Wi-Fi address for phone preview.');
}
