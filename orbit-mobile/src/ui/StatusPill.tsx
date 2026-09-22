import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export type StatusTone = 'live' | 'pending' | 'frozen' | 'hidden' | 'verified' | 'suspended' | 'off';

const LABELS: Record<StatusTone, string> = {
  live: 'Live',
  pending: 'Pending',
  frozen: 'Frozen',
  hidden: 'Hidden from seekers',
  verified: 'Verified profile',
  suspended: 'Suspended',
  off: 'Off',
};

export function StatusPill({ tone, label }: { tone: StatusTone; label?: string }) {
  return (
    <View style={[styles.pill, tone === 'live' || tone === 'verified' ? styles.on : null]}>
      <Text style={[styles.text, tone === 'live' || tone === 'verified' ? styles.textOn : null]}>
        {label ?? LABELS[tone]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.sand,
    marginBottom: 8,
  },
  on: { backgroundColor: colors.lilac },
  text: { fontFamily: fonts.medium, fontSize: 12, color: colors.ink },
  textOn: { color: colors.ink },
});
