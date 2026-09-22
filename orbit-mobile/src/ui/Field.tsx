import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testID?: string;
  helper?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  keyboardType?: 'default' | 'email-address';
  editable?: boolean;
};

export function Field({
  label,
  value,
  onChange,
  placeholder,
  testID,
  helper,
  autoCapitalize,
  keyboardType,
  editable = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        editable={editable}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.label}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        style={[styles.input, !editable && styles.locked]}
      />
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink, marginBottom: 6 },
  input: {
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
  locked: { color: colors.muted },
  helper: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 6 },
});
