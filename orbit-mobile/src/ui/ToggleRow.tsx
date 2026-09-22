import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  helper: string;
  on: boolean;
  onPress: () => void;
  testID?: string;
};

export function ToggleRow({ label, helper, on, onPress, testID }: Props) {
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>
      <View style={[styles.pill, on && styles.pillOn]}>
        <Text style={[styles.pillText, on && styles.pillTextOn]}>{on ? 'On' : 'Off'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1, gap: 4 },
  label: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
  helper: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  pill: {
    minWidth: 54,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  pillOn: { backgroundColor: colors.black, borderColor: colors.black },
  pillText: { fontFamily: fonts.medium, fontSize: 12, color: colors.ink },
  pillTextOn: { color: colors.white },
  pressed: { opacity: 0.88 },
});
