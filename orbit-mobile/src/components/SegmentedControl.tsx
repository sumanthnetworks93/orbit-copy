import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsCompact } from '../hyd/useIsCompact';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

export type FeedMode = 'startups' | 'jobs' | 'freelance';

type Props = {
  value: FeedMode;
  onChange: (value: FeedMode) => void;
};

export function SegmentedControl({ value, onChange }: Props) {
  const compact = useIsCompact(600);
  return (
    <View style={styles.track}>
      <Pressable
        testID="segment-startups"
        onPress={() => onChange('startups')}
        style={[styles.segment, compact && styles.segmentCompact, value === 'startups' && styles.segmentActive]}
      >
        <Text style={[styles.label, compact && styles.labelCompact, value === 'startups' && styles.labelActive]} numberOfLines={1}>
          Startups
        </Text>
      </Pressable>
      <Pressable
        testID="segment-jobs"
        onPress={() => onChange('jobs')}
        style={[styles.segment, compact && styles.segmentCompact, value === 'jobs' && styles.segmentActive]}
      >
        <Text style={[styles.label, compact && styles.labelCompact, value === 'jobs' && styles.labelActive]} numberOfLines={1}>
          Jobs
        </Text>
      </Pressable>
      <Pressable
        testID="segment-freelance"
        onPress={() => onChange('freelance')}
        style={[styles.segment, compact && styles.segmentCompact, value === 'freelance' && styles.segmentActive]}
      >
        <Text style={[styles.label, compact && styles.labelCompact, value === 'freelance' && styles.labelActive]} numberOfLines={1}>
          Freelance
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderRadius: 999,
    padding: 4,
    backgroundColor: colors.sand,
    marginTop: 20,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  segmentCompact: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  segmentActive: {
    backgroundColor: colors.white,
    ...elevation.card,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  labelCompact: {
    fontSize: 13,
  },
  labelActive: {
    color: colors.ink,
  },
});
