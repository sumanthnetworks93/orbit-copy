import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  style?: ViewStyle;
};

const SIZES = {
  sm: { ring: 22, stroke: 1.5, dot: 4, gap: 8, fontSize: 10, letterSpacing: 2.4 },
  md: { ring: 28, stroke: 1.5, dot: 6, gap: 10, fontSize: 11, letterSpacing: 3 },
  lg: { ring: 36, stroke: 1.75, dot: 7, gap: 12, fontSize: 12, letterSpacing: 3.2 },
};

export function OrbitLogo({ size = 'md', showWordmark = true, style }: Props) {
  const spec = SIZES[size];
  const radius = spec.ring / 2;

  return (
    <View style={[styles.wrap, { gap: spec.gap }, style]}>
      <Svg width={spec.ring} height={spec.ring} viewBox={`0 0 ${spec.ring} ${spec.ring}`}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius - spec.stroke}
          stroke={colors.ink}
          strokeWidth={spec.stroke}
          fill="none"
        />
        <Circle cx={radius} cy={radius} r={spec.dot / 2} fill={colors.ink} />
      </Svg>
      {showWordmark ? (
        <Text
          style={[
            styles.wordmark,
            { fontSize: spec.fontSize, letterSpacing: spec.letterSpacing },
          ]}
        >
          ORBIT
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: fonts.medium,
    color: colors.muted,
  },
});
