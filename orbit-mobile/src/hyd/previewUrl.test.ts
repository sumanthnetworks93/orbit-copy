import { describe, expect, it } from 'vitest';
import {
  expoGoUrlFromPreview,
  isLoopbackHost,
  isTunnelHost,
  nativeApiBaseUrl,
  phonePreviewFromLocation,
  qrImageSrc,
  resolvePhonePreviewUrl,
  rewriteHost,
  shareUrlFromPreview,
} from './previewUrl';

describe('phone preview URL', () => {
  it('does not QR localhost — a phone cannot open that', () => {
    expect(isLoopbackHost('localhost')).toBe(true);
    expect(phonePreviewFromLocation('localhost', '8081')).toBeNull();
  });

  it('uses the current LAN host when the page is already on Wi-Fi', () => {
    expect(phonePreviewFromLocation('172.16.225.77', '8081')).toBe('http://172.16.225.77:8081/');
  });

  it('rewrites a stale API host to the phone page host', () => {
    expect(rewriteHost('http://192.168.1.68:5189', '172.16.225.77')).toBe('http://172.16.225.77:5189');
  });

  it('builds a QR image for the live URL', () => {
    expect(qrImageSrc('http://172.16.225.77:8081/')).toContain('172.16.225.77');
  });

  it('turns the LAN preview into an Expo Go deep link', () => {
    expect(expoGoUrlFromPreview('http://172.16.225.77:8081/')).toBe('exp://172.16.225.77:8081');
    expect(expoGoUrlFromPreview('http://172.16.225.77:8081')).toBe('exp://172.16.225.77:8081');
  });

  it('prefers a public ngrok URL when the API reports one', async () => {
    const url = await resolvePhonePreviewUrl({
      hostname: 'localhost',
      port: '8081',
      apiBaseUrl: 'http://127.0.0.1:5189',
      fetchJson: async () => ({
        ip: '192.168.1.98',
        port: 8081,
        url: 'http://192.168.1.98:8081/',
        publicUrl: 'https://orbit-demo.ngrok-free.app/',
      }),
    });
    expect(url).toBe('https://orbit-demo.ngrok-free.app/');
    expect(shareUrlFromPreview(url)).toEqual({
      url: 'https://orbit-demo.ngrok-free.app/',
      kind: 'browser',
    });
    expect(isTunnelHost('orbit-demo.ngrok-free.app')).toBe(true);
  });

  it('asks the API for a LAN URL when the desktop is on localhost', async () => {
    const url = await resolvePhonePreviewUrl({
      hostname: 'localhost',
      port: '8081',
      apiBaseUrl: 'http://192.168.1.68:5189',
      fetchJson: async (requestUrl) => {
        if (requestUrl.includes('127.0.0.1:5189')) {
          return { ip: '172.16.225.77', port: 8081, url: 'http://172.16.225.77:8081/' };
        }
        throw new Error('stale API host');
      },
    });
    expect(url).toBe('http://172.16.225.77:8081/');
  });

  it('rewrites the API to the Metro LAN host on a phone', () => {
    expect(nativeApiBaseUrl('http://localhost:5189', '192.168.1.97:8081')).toBe('http://192.168.1.97:5189');
    expect(nativeApiBaseUrl('http://10.0.2.2:5189', 'localhost:8081')).toBe('http://10.0.2.2:5189');
  });
});
