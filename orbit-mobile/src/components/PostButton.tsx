import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  onPress?: () => void;
};

export function PostButton({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.plus}>+</Text>
      <Text style={styles.label}>Post</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lilac,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  plus: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.88,
  },
});
