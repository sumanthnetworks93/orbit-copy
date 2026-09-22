import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
  titleTestID?: string;
  subtitleTestID?: string;
  onBack?: () => void;
  backTestID?: string;
};

export function PageHeader({ kicker, title, subtitle, titleTestID, subtitleTestID, onBack, backTestID }: Props) {
  return (
    <View>
      {onBack ? (
        <Pressable testID={backTestID} onPress={onBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      ) : null}
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title} testID={titleTestID}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} testID={subtitleTestID}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { paddingBottom: 12 },
  backText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  kicker: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.label,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    letterSpacing: -1.1,
    color: colors.ink,
    lineHeight: 46,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    marginTop: 8,
  },
});
