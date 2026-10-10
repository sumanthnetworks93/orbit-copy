import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { qrImageSrc, resolvePhonePreviewUrl, shareUrlFromPreview } from '../hyd/previewUrl';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

function pageLocation(): { hostname: string; port: string; protocol: string } {
  if (typeof window === 'undefined') {
    return { hostname: 'localhost', port: '8081', protocol: 'http:' };
  }
  return {
    hostname: window.location.hostname,
    port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
    protocol: window.location.protocol,
  };
}

export function MobileQr() {
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<'expo-go' | 'browser'>('expo-go');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { hostname, port, protocol } = pageLocation();
    void resolvePhonePreviewUrl({ hostname, port, protocol, apiBaseUrl: API_BASE_URL })
      .then((next) => {
        if (cancelled) return;
        const share = shareUrlFromPreview(next);
        setUrl(share.url);
        setKind(share.kind);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Could not build a phone URL.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyUrl() {
    if (!url || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <View style={styles.qrBox} testID="mobile-qr">
      <Text style={styles.qrTitle}>{kind === 'browser' ? 'Share with a friend' : 'Open in Expo Go'}</Text>
      <Text style={styles.qrHint}>
        {kind === 'browser'
          ? 'Anyone can open this HTTPS link in Chrome or Safari. No same Wi‑Fi and no Expo Go required.'
          : 'Install Expo Go, join the same Wi‑Fi as this computer, then scan. The camera app or Expo Go both work.'}
      </Text>
      {url ? (
        <>
          <Image
            testID="mobile-qr-image"
            accessibilityLabel={kind === 'browser' ? 'QR code to share Orbit' : 'QR code for Expo Go'}
            source={{ uri: qrImageSrc(url, 280) }}
            style={styles.qr}
          />
          <Pressable accessibilityRole="button" onPress={() => void copyUrl()} testID="mobile-qr-url">
            <Text style={styles.qrUrl}>{url}</Text>
          </Pressable>
          <Text style={styles.qrHint}>{copied ? 'Copied. Paste it on your phone.' : 'Tap the URL to copy'}</Text>
        </>
      ) : (
        <Text style={styles.qrHint} testID="mobile-qr-status">
          {error ?? 'Finding this computer’s Wi‑Fi address…'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  qrBox: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    marginTop: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    gap: 8,
  },
  qrTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink },
  qrHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center' },
  qr: { width: 200, height: 200 },
  qrUrl: { fontFamily: fonts.medium, fontSize: 12, color: colors.ink, textAlign: 'center' },
});
