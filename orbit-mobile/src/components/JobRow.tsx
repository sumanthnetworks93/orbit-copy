import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApplySheet } from './ApplySheet';
import { useLanguage } from '../hyd/LanguageContext';
import { isJobFrozenForDisplay } from '../hyd/filter';
import type { Job } from '../types';
import { isJobVerifiedByOrbitSupport } from '../services/orbitSupport';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  job: Job;
  onApply?: (job: Job) => void;
  onOpen?: (job: Job) => void;
};

export const JobRow = memo(function JobRow({ job, onApply, onOpen }: Props) {
  const { copy } = useLanguage();
  const [open, setOpen] = useState(false);
  const frozen = isJobFrozenForDisplay(job);
  const orbitVerified = isJobVerifiedByOrbitSupport(job);

  return (
    <Pressable
      testID={`job-row-${job.id}`}
      disabled={!onOpen}
      onPress={() => onOpen?.(job)}
      style={({ pressed }) => [styles.row, pressed && onOpen ? styles.pressed : null]}
    >
      <View style={[styles.avatar, { backgroundColor: job.color }]}>
        <Text style={styles.initial}>{job.initial}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>
          {job.company} · {job.location}
        </Text>
        <Text style={styles.tags}>
          {job.jobType} · {job.tags}
          {job.commuteMin ? ` · ${job.commuteMin} min commute` : ''}
        </Text>
        <View style={styles.badges}>
          {orbitVerified ? (
            <View testID={`job-orbit-verified-${job.id}`}>
              <Badge label={copy.verified} />
            </View>
          ) : null}
          {frozen ? <Badge label={copy.frozen} /> : null}
          {job.womenSafe ? <Badge label={copy.womenSafe} /> : null}
          {job.cabProvided ? <Badge label={copy.cab} /> : null}
          {job.nearMetro ? <Badge label={copy.metro} /> : null}
          {job.lateShift ? <Badge label={copy.lateShift} /> : null}
          {job.walkIn ? <Badge label={copy.walkInToday} /> : null}
          {job.outsideLocation ? (
            <View testID={`job-outside-${job.id}`}>
              <Badge label={copy.outsideLocation} />
            </View>
          ) : null}
        </View>
        {job.lastReplyAt ? (
          <Text style={styles.reply}>
            {copy.lastReply}: {new Date(job.lastReplyAt).toLocaleDateString()}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Text style={styles.salary}>{job.salary}</Text>
        <Pressable
          testID={`job-apply-${job.id}`}
          style={({ pressed }) => [styles.apply, pressed && styles.pressed]}
          onPress={(event) => {
            event.stopPropagation();
            if (onApply) onApply(job);
            else setOpen(true);
          }}
        >
          <Text style={styles.applyText}>{copy.applyNow}</Text>
        </Pressable>
      </View>

      {onApply ? null : <ApplySheet job={job} visible={open} onClose={() => setOpen(false)} />}
    </Pressable>
  );
});

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
    marginBottom: 10,
    borderRadius: 22,
    backgroundColor: colors.white,
    overflow: 'hidden',
    ...elevation.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  initial: { color: colors.white, fontFamily: fonts.semiBold, fontSize: 18 },
  content: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.ink },
  company: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  tags: { fontFamily: fonts.regular, fontSize: 13, color: colors.label },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.white,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 10, color: colors.ink },
  reply: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 8,
    minWidth: 84,
    alignSelf: 'stretch',
    paddingTop: 2,
  },
  salary: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink },
  apply: {
    backgroundColor: colors.lilac,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  applyText: { color: colors.ink, fontFamily: fonts.medium, fontSize: 13 },
  pressed: { opacity: 0.88 },
});
