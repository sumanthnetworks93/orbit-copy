import { StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  testID?: string;
};

export function SearchField({ value, onChange, placeholder, testID }: Props) {
  return (
    <TextInput
      testID={testID}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.label}
      autoCorrect={false}
      style={styles.search}
    />
  );
}

const styles = StyleSheet.create({
  search: {
    marginTop: 18,
    marginBottom: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
});
