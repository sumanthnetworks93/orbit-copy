import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  title?: string;
  hint?: string;
  children?: ReactNode;
};

export function Section({ title, hint, children }: Props) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.ink,
    marginBottom: 8,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginBottom: 12,
  },
});
