import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { jobsForStartup } from '../hyd/filter';
import { useLanguage } from '../hyd/LanguageContext';
import type { HomeStackParamList } from '../navigation/types';
import { isStartupVoted, toggleStartupVote } from '../services/profileActivity';
import { isStartupSaved, toggleSavedStartup } from '../services/savedStartups';
import {
  ActionRow,
  CardMeta,
  CardTitle,
  DeskButton,
  DeskScreen,
  EmptyState,
  PageHeader,
  Section,
  StatGrid,
  StatusPill,
  Surface,
} from '../ui';

type Props = NativeStackScreenProps<HomeStackParamList, 'StartupDetail'>;

export function StartupDetailScreen({ navigation, route }: Props) {
  const { startup } = route.params;
  const { copy } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(startup.upvotes);
  const roles = useMemo(() => jobsForStartup(startup.name), [startup.name]);

  useFocusEffect(
    useCallback(() => {
      setVotes(startup.upvotes);
      void isStartupSaved(startup.id).then(setSaved);
      void isStartupVoted(startup.id).then(setVoted);
    }, [startup.id, startup.upvotes]),
  );

  async function handleVote() {
    const next = await toggleStartupVote(startup.id);
    setVoted(next.voted);
    setVotes((count) => count + (next.voted ? 1 : -1));
  }

  async function handleSave() {
    const next = await toggleSavedStartup(startup);
    setSaved(next.saved);
  }

  return (
    <DeskScreen testID="startup-detail">
      <PageHeader
        kicker={startup.category}
        title={startup.name}
        subtitle={startup.location}
        onBack={() => navigation.goBack()}
        backTestID="startup-detail-back"
      />
      {startup.outsideLocation ? <StatusPill tone="pending" label={copy.outsideLocation} /> : null}
      <StatGrid
        items={[
          { label: 'Open roles', value: startup.openRoles, testID: 'startup-detail-roles' },
          { label: 'Upvotes', value: votes, testID: 'startup-detail-votes' },
          { label: 'Category', value: startup.category },
        ]}
      />
      <Section title="About">
        <Surface>
          <CardTitle>{startup.name}</CardTitle>
          <CardMeta testID="startup-detail-about">{startup.description}</CardMeta>
        </Surface>
      </Section>
      <Section title="Open roles">
        {roles.length === 0 ? <EmptyState text="No live roles on Orbit yet." /> : null}
        {roles.map((job) => (
          <Surface key={job.id} testID={`startup-role-${job.id}`}>
            <CardTitle>{job.title}</CardTitle>
            <CardMeta>{`${job.jobType} · ${job.salary}`}</CardMeta>
            <ActionRow>
              <DeskButton
                testID={`startup-role-open-${job.id}`}
                label="View role"
                variant="lilac"
                onPress={() => navigation.navigate('JobDetail', { job })}
              />
            </ActionRow>
          </Surface>
        ))}
      </Section>
      <ActionRow>
        <DeskButton testID="startup-detail-upvote" label={voted ? 'Upvoted' : 'Upvote'} onPress={() => void handleVote()} />
        <DeskButton
          testID="startup-detail-save"
          label={saved ? 'Saved' : 'Save'}
          variant="ghost"
          onPress={() => void handleSave()}
        />
      </ActionRow>
    </DeskScreen>
  );
}
