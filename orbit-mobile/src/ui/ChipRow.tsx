import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

type Chip<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  value: T;
  chips: Chip<T>[];
  onChange: (id: T) => void;
  testIDPrefix: string;
};

export function ChipRow<T extends string>({ value, chips, onChange, testIDPrefix }: Props<T>) {
  return (
    <View style={styles.row}>
      {chips.map((chip) => {
        const on = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            testID={`${testIDPrefix}-${chip.id}`}
            onPress={() => onChange(chip.id)}
            style={[styles.chip, on && styles.on]}
          >
            <Text style={[styles.text, on && styles.textOn]}>{chip.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.sand,
  },
  on: { backgroundColor: colors.white, ...elevation.card },
  text: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  textOn: { color: colors.ink },
});
