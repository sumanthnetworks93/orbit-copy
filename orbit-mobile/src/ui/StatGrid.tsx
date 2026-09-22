import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

export type DeskStat = {
  label: string;
  value: string | number;
  testID?: string;
  onPress?: () => void;
};

export function StatGrid({ items }: { items: DeskStat[] }) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const inner = (
          <>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </>
        );
        if (item.onPress) {
          return (
            <Pressable
              key={item.label}
              testID={item.testID}
              onPress={item.onPress}
              style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
            >
              {inner}
            </Pressable>
          );
        }
        return (
          <View key={item.label} testID={item.testID} style={styles.stat}>
            {inner}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.white,
    ...elevation.card,
  },
  value: { fontFamily: fonts.semiBold, fontSize: 22, color: colors.ink },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
  pressed: { opacity: 0.88 },
});
