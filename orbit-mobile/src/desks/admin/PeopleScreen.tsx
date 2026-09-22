import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getAdminProfiles,
  reviewAdminProfile,
  setAdminProfileRole,
  setAdminProfileSuspended,
  type AdminProfile,
} from '../../services/adminModeration';
import {
  ActionRow,
  CardMeta,
  CardNote,
  CardTitle,
  ChipRow,
  ConfirmRow,
  DeskButton,
  DeskScreen,
  EmptyState,
  PageHeader,
  SearchField,
  StatusPill,
  Surface,
} from '../../ui';

type PeopleFilter = 'all' | 'pending' | 'employer' | 'seeker' | 'suspended';

function badgeTone(profile: AdminProfile) {
  if (profile.suspended) return 'suspended' as const;
  if (profile.status === 'verified') return 'verified' as const;
  if (profile.status === 'pending') return 'pending' as const;
  return 'off' as const;
}

function badgeLabel(profile: AdminProfile) {
  if (profile.suspended) return 'Suspended';
  if (profile.status === 'verified' && profile.role === 'employer') return 'Verified by Orbit Support';
  return profile.status === 'verified' ? 'Verified profile' : `${profile.status} profile`;
}

export function PeopleScreen() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getAdminProfiles().then(setProfiles).catch(() => undefined);
    }, []),
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (filter === 'pending' && (profile.status !== 'pending' || profile.suspended)) return false;
      if (filter === 'employer' && profile.role !== 'employer') return false;
      if (filter === 'seeker' && profile.role !== 'seeker') return false;
      if (filter === 'suspended' && !profile.suspended) return false;
      if (!q) return true;
      return `${profile.name} ${profile.email} ${profile.company ?? ''}`.toLowerCase().includes(q);
    });
  }, [profiles, query, filter]);

  return (
    <DeskScreen testID="admin-people-screen">
      <PageHeader kicker="Directory" title="People" subtitle="Verify, suspend, or change a role." />
      <SearchField testID="admin-people-search" value={query} onChange={setQuery} placeholder="Search name or email" />
      <ChipRow
        testIDPrefix="admin-people-filter"
        value={filter}
        onChange={setFilter}
        chips={[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'employer', label: 'Employers' },
          { id: 'seeker', label: 'Seekers' },
          { id: 'suspended', label: 'Suspended' },
        ]}
      />
      {visible.length === 0 ? <EmptyState text="No people match." /> : null}
      {visible.map((profile) => (
        <Surface key={profile.id} testID={`admin-user-${profile.id}`}>
          <StatusPill tone={badgeTone(profile)} label={badgeLabel(profile)} />
          <CardTitle>{profile.name}</CardTitle>
          <CardMeta>
            {`${profile.role}${profile.company ? ` · ${profile.company}` : ''} · ${profile.email}`}
          </CardMeta>
          {profile.note ? <CardNote>{profile.note}</CardNote> : null}
          {confirmingId === profile.id ? (
            <ConfirmRow
              confirmLabel="Confirm suspend"
              confirmTestID="confirm-yes"
              onCancel={() => setConfirmingId(null)}
              onConfirm={() => {
                setConfirmingId(null);
                void setAdminProfileSuspended(profile.id, true).then(setProfiles);
              }}
            />
          ) : (
            <ActionRow>
              {profile.status === 'pending' && !profile.suspended ? (
                <DeskButton
                  testID={`admin-people-approve-${profile.id}`}
                  label="Verify"
                  variant="lilac"
                  onPress={() =>
                    void reviewAdminProfile(profile.id, 'verified', 'Verified by Orbit Support').then(setProfiles)
                  }
                />
              ) : null}
              <DeskButton
                testID={profile.suspended ? `admin-restore-${profile.id}` : `admin-suspend-${profile.id}`}
                label={profile.suspended ? 'Restore' : 'Suspend'}
                variant={profile.suspended ? 'lilac' : 'ghost'}
                onPress={() => {
                  if (profile.suspended) {
                    void setAdminProfileSuspended(profile.id, false).then(setProfiles);
                    return;
                  }
                  setConfirmingId(profile.id);
                }}
              />
              <DeskButton
                testID={`admin-role-${profile.id}`}
                label={profile.role === 'employer' ? 'Make seeker' : 'Make employer'}
                variant="ghost"
                onPress={() =>
                  void setAdminProfileRole(profile.id, profile.role === 'employer' ? 'seeker' : 'employer').then(
                    setProfiles,
                  )
                }
              />
            </ActionRow>
          )}
        </Surface>
      ))}
    </DeskScreen>
  );
}
