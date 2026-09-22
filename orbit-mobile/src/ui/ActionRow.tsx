import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export function ActionRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
});
