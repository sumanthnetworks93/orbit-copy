import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  onPress: () => void;
  testID?: string;
};

export function ViewMark({ onPress, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="View job"
      style={({ pressed }) => [styles.box, pressed && styles.pressed]}
    >
      <MaterialIcons name="visibility" size={20} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.88 },
});
