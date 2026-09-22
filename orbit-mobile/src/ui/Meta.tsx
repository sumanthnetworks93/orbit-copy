import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function CardTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardMeta({ children, testID }: { children: string; testID?: string }) {
  return (
    <Text style={styles.meta} testID={testID}>
      {children}
    </Text>
  );
}

export function CardNote({ children }: { children: string }) {
  return <Text style={styles.note}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  note: { fontFamily: fonts.regular, fontSize: 13, color: colors.label, marginTop: 8 },
});
