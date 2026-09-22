import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function EmptyState({ text }: { text: string }) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, marginTop: 4 },
});
