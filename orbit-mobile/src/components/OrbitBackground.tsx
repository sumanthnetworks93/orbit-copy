import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import type { BackgroundTheme } from '../theme/colors';

type Props = {
  theme: BackgroundTheme;
};

const EMOJI_POSITIONS = [
  { e: '🚀', top: 110, left: 36, size: 28 },
  { e: '✨', top: 200, left: 310, size: 22 },
  { e: '🌱', top: 340, left: 52, size: 24 },
  { e: '📈', top: 520, left: 300, size: 26 },
  { e: '💰', top: 680, left: 72, size: 24 },
];

export const OrbitBackground = memo(function OrbitBackground({ theme }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme === 'blobs' && <BlobsBackground />}
      {theme === 'emoji' && <EmojiBackground />}
      {theme === 'dots' && <DotsBackground />}
      {theme === 'doodle' && <DoodleBackground />}
      {theme === 'rings' && <RingsBackground />}
    </View>
  );
});

function BlobsBackground() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="blob1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E8E4FF" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#F7F4EC" stopOpacity="0.1" />
        </LinearGradient>
        <LinearGradient id="blob2" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F2E6D4" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#F7F4EC" stopOpacity="0.08" />
        </LinearGradient>
      </Defs>
      <Circle cx="80" cy="120" r="120" fill="url(#blob1)" />
      <Circle cx="340" cy="280" r="150" fill="url(#blob2)" />
      <Circle cx="300" cy="640" r="110" fill="#E8E4FF" opacity={0.22} />
    </Svg>
  );
}

function EmojiBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {EMOJI_POSITIONS.map((item) => (
        <Text
          key={`${item.e}-${item.top}`}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            fontSize: item.size,
            opacity: 0.08,
          }}
        >
          {item.e}
        </Text>
      ))}
    </View>
  );
}

function DotsBackground() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="orbitDots" patternUnits="userSpaceOnUse" width="24" height="24">
          <Circle cx="12" cy="12" r="1.2" fill="#C8C2B8" opacity={0.35} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#orbitDots)" />
    </Svg>
  );
}

function DoodleBackground() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Path d="M40 180 Q120 120 200 180 T360 160" stroke="#CFC7BA" strokeWidth={1.5} fill="none" opacity={0.35} />
      <Path d="M60 420 C120 360 180 480 260 420" stroke="#CFC7BA" strokeWidth={1.5} fill="none" opacity={0.3} />
      <Path d="M280 560 Q320 520 360 580" stroke="#CFC7BA" strokeWidth={1.5} fill="none" opacity={0.28} />
      <Circle cx="320" cy="240" r="18" stroke="#CFC7BA" strokeWidth={1.5} fill="none" opacity={0.25} />
    </Svg>
  );
}

function RingsBackground() {
  const rings = [60, 100, 140, 180, 220, 260];
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      {rings.map((r) => (
        <Circle
          key={r}
          cx="200"
          cy="420"
          r={r}
          stroke="#D4CFC6"
          strokeWidth={1}
          fill="none"
          opacity={0.22}
        />
      ))}
    </Svg>
  );
}
