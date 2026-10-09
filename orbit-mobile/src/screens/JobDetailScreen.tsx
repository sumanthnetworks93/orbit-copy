import { useCallback, useState, type ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApplySheet } from '../components/ApplySheet';
import { SocialFooter } from '../components/SocialFooter';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hyd/LanguageContext';
import { isJobFrozenForDisplay } from '../hyd/filter';
import { jobAbout, jobApplyHint, jobFacts, jobWorkLines, jobWorkplaceNotes } from '../hyd/jobBrief';
import { scoreJobMatch } from '../hyd/match';
import { getMatchPrefs, subscribeToJobMatches, unsubscribeFromJobMatches, type MatchPrefs } from '../services/jobAlerts';
import { isJobVerifiedByOrbitSupport } from '../services/orbitSupport';
import { logJobView } from '../services/api';
import { reportListing, reportMailto } from '../services/reports';
import type { JobDetailParams } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<{ JobDetail: JobDetailParams }, 'JobDetail'>;

export function JobDetailScreen({ navigation, route }: Props) {
  const { job } = route.params;
  const { user } = useAuth();
  const { copy } = useLanguage();
  const [applyOpen, setApplyOpen] = useState(false);
  const [reported, setReported] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<MatchPrefs | null>(null);
  const frozen = isJobFrozenForDisplay(job);
  const orbitVerified = isJobVerifiedByOrbitSupport(job);
  const match = scoreJobMatch(job, prefs ?? { role: '', area: '' });
  const subscribed = Boolean(prefs?.subscribed);
  const facts = jobFacts(job);
  const work = jobWorkLines(job);
  const workplace = jobWorkplaceNotes(
    { ...job, frozen: frozen || job.frozen },
    copy,
  );

  useFocusEffect(
    useCallback(() => {
      getMatchPrefs().then(setPrefs).catch(() => undefined);
      void logJobView({ id: job.id, title: job.title, company: job.company }, user?.uid);
    }, [job.id, job.title, job.company, user?.uid]),
  );

  return (
    <View style={styles.root} testID="job-detail">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable testID="job-detail-back" onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <ScrollView style={styles.listView} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>{job.company}</Text>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.place}>{job.location}</Text>

          <View style={styles.facts}>
            {facts.map((fact) => (
              <View key={fact.label} style={styles.fact}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            ))}
          </View>

          {orbitVerified ? (
            <Text testID="job-detail-orbit-verified" style={styles.verified}>
              {copy.verified}
            </Text>
          ) : null}

          <Section label={copy.aboutRole}>
            <Text style={styles.prose}>{jobAbout(job)}</Text>
          </Section>

          {work.length ? (
            <Section label={copy.theWork}>
              {work.map((line) => (
                <Text key={line} style={styles.line}>
                  {line}
                </Text>
              ))}
            </Section>
          ) : null}

          {workplace.length ? (
            <Section label={copy.workplace}>
              {workplace.map((line) => (
                <Text key={line} style={styles.line}>
                  {line}
                </Text>
              ))}
            </Section>
          ) : null}

          {job.walkIn ? (
            <Section label={copy.walkins}>
              <Text style={styles.line}>
                {job.walkIn.date} · {job.walkIn.time}
              </Text>
              <Text style={styles.line}>{job.walkIn.venue}</Text>
              <Text style={styles.muted}>
                Ask for {job.walkIn.askFor} · Bring {job.walkIn.bring}
              </Text>
            </Section>
          ) : null}

          {match.score >= 45 ? (
            <Section label={copy.whyMatch}>
              <Text style={styles.prose}>{match.reasons.join('. ')}.</Text>
              <Text style={styles.muted}>{match.score}% {copy.aiMatch}</Text>
            </Section>
          ) : null}

          {job.lastReplyAt ? (
            <Text style={styles.reply}>
              {copy.lastReply}: {new Date(job.lastReplyAt).toLocaleDateString()}
            </Text>
          ) : null}

          <Section label={copy.howToApply}>
            <Text style={styles.prose}>{jobApplyHint(job)}</Text>
          </Section>

          <Pressable
            testID="job-detail-apply"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => setApplyOpen(true)}
          >
            <Text style={styles.primaryText}>{copy.apply}</Text>
          </Pressable>
          <Pressable
            testID="job-subscribe-matches"
            style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}
            onPress={() => {
              if (subscribed) {
                void unsubscribeFromJobMatches().then(setPrefs);
                return;
              }
              void subscribeToJobMatches({
                role: job.title,
                area: job.area ?? job.location.split(',')[0] ?? '',
              }).then(setPrefs);
            }}
          >
            <Text style={styles.textActionLabel}>{subscribed ? copy.subscribed : copy.similarRoles}</Text>
          </Pressable>

          <View style={styles.reports}>
            <Pressable
              testID="report-job"
              onPress={() => {
                void reportListing('job', job).then(() => setReported('job'));
                void Linking.openURL(reportMailto('job', job)).catch(() => undefined);
              }}
            >
              <Text style={styles.report}>{reported === 'job' ? 'Job reported' : 'Report job'}</Text>
            </Pressable>
            <Text style={styles.reportDot}>·</Text>
            <Pressable
              testID="report-employer"
              onPress={() => {
                void reportListing('employer', job).then(() => setReported('employer'));
                void Linking.openURL(reportMailto('employer', job)).catch(() => undefined);
              }}
            >
              <Text style={styles.report}>{reported === 'employer' ? 'Employer reported' : 'Report employer'}</Text>
            </Pressable>
          </View>
          <SocialFooter message={`${job.title} at ${job.company} — Hyderabad jobs on Orbit.`} />
        </ScrollView>
      </SafeAreaView>
      <ApplySheet job={job} visible={applyOpen} onClose={() => setApplyOpen(false)} />
    </View>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  safe: { flex: 1 },
  listView: { flex: 1 },
  back: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  backText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  body: { paddingHorizontal: 24, paddingBottom: 40 },
  kicker: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.label,
    marginTop: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.ink,
    marginTop: 8,
  },
  place: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.muted,
    marginTop: 8,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 28,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fact: { minWidth: 88, marginBottom: 16 },
  factLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.label,
  },
  factValue: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
    marginTop: 4,
  },
  verified: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
    marginTop: 18,
  },
  section: { marginTop: 28 },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.label,
    marginBottom: 10,
  },
  prose: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
  },
  line: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
    marginBottom: 4,
  },
  muted: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 6,
  },
  reply: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 20,
  },
  primary: {
    marginTop: 32,
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontFamily: fonts.medium, fontSize: 16 },
  textAction: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  textActionLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  reports: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  report: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.label,
  },
  reportDot: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.label,
  },
  pressed: { opacity: 0.88 },
});
