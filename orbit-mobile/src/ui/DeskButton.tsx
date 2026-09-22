import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Variant = 'lilac' | 'ink' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  testID?: string;
  variant?: Variant;
  disabled?: boolean;
};

export function DeskButton({ label, onPress, testID, variant = 'ink', disabled }: Props) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'lilac' && styles.lilac,
        variant === 'ink' && styles.ink,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, variant === 'ink' && styles.textOnInk]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexGrow: 1,
    minWidth: 110,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  lilac: { backgroundColor: colors.lilac },
  ink: { backgroundColor: colors.black },
  ghost: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  textOnInk: { color: colors.white },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.5 },
});
