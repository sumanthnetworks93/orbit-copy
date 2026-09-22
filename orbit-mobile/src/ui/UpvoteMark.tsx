import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  count: number;
  voted: boolean;
  onPress: () => void;
  testID?: string;
};

export function UpvoteMark({ count, voted, onPress, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={voted ? 'Remove upvote' : 'Upvote'}
      style={({ pressed }) => [styles.box, voted && styles.voted, pressed && styles.pressed]}
    >
      <MaterialIcons name="keyboard-arrow-up" size={22} color={voted ? colors.hunt : colors.ink} />
      <Text style={[styles.count, voted && styles.countVoted]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 52,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 8,
  },
  voted: {
    borderColor: colors.hunt,
    backgroundColor: colors.white,
  },
  count: {
    marginTop: -4,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ink,
  },
  countVoted: { color: colors.hunt },
  pressed: { opacity: 0.8 },
});
