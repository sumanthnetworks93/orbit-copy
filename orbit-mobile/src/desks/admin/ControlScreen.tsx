import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AdminTabParamList } from '../../navigation/types';
import { countFrozenHydJobs } from '../../hyd/filter';
import {
  PLATFORM_CONTROL_FIELDS,
  getPlatformControls,
  setPlatformControl,
  type PlatformControlKey,
  type PlatformControls,
} from '../../services/adminControl';
import { hydrateJobOverrides, setJobOverride } from '../../services/adminJobs';
import {
  getAdminProfiles,
  pendingAdminProfiles,
  reviewAdminProfile,
  verifiedAdminProfiles,
  type AdminProfile,
} from '../../services/adminModeration';
import {
  getEmployerListings,
  pendingEmployerListings,
  reviewEmployerListing,
  type EmployerListing,
} from '../../services/employerJobs';
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
  Surface,
  ToggleRow,
} from '../../ui';

export function ControlScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [controls, setControls] = useState<PlatformControls | null>(null);
  const [frozenCount, setFrozenCount] = useState(0);
  const [listings, setListings] = useState<EmployerListing[]>([]);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([getAdminProfiles(), getPlatformControls(), hydrateJobOverrides(), getEmployerListings()]).then(
        ([nextProfiles, nextControls, , nextListings]) => {
          setProfiles(nextProfiles);
          setControls(nextControls);
          setListings(nextListings);
          setFrozenCount(countFrozenHydJobs());
        },
      );
    }, []),
  );

  const pendingPeople = pendingAdminProfiles(profiles);
  const pendingJobs = pendingEmployerListings(listings);

  async function review(id: string, status: 'verified' | 'rejected') {
    setProfiles(
      await reviewAdminProfile(id, status, status === 'verified' ? 'Verified by Orbit Support' : 'Needs more proof'),
    );
  }

  async function toggle(key: PlatformControlKey, value: boolean) {
    const next = await setPlatformControl(key, value);
    setControls(next);
    setFrozenCount(countFrozenHydJobs());
  }

  return (
    <DeskScreen testID="admin-screen">
      <PageHeader
        kicker="Super Admin"
        title="Needs review"
        subtitle="Verify people, then jobs. Switches that stop the board live here."
      />

      <StatGrid
        items={[
          {
            label: 'Pending',
            value: pendingPeople.length,
            onPress: () => navigation.navigate('AdminPeople'),
          },
          {
            label: 'Verified',
            value: verifiedAdminProfiles(profiles).length,
            onPress: () => navigation.navigate('AdminPeople'),
          },
          {
            label: 'Frozen jobs',
            value: frozenCount,
            onPress: () => navigation.navigate('AdminJobs'),
          },
        ]}
      />

      <Section title="Trust & safety" hint="Verify an employer to stamp Verified by Orbit Support on their live jobs.">
        {pendingPeople.length === 0 ? <EmptyState text="No pending profiles." /> : null}
        {pendingPeople.map((profile) => (
          <Surface key={profile.id} testID={`admin-pending-${profile.id}`}>
            <CardTitle>{profile.name}</CardTitle>
            <CardMeta>{`${profile.role}${profile.company ? ` · ${profile.company}` : ''}`}</CardMeta>
            <ActionRow>
              <DeskButton
                testID={`admin-approve-${profile.id}`}
                label="Verify profile"
                variant="lilac"
                onPress={() => void review(profile.id, 'verified')}
              />
              <DeskButton label="Reject" variant="ghost" testID={`admin-reject-${profile.id}`} onPress={() => void review(profile.id, 'rejected')} />
            </ActionRow>
          </Surface>
        ))}
      </Section>

      <Section title="Job posts" hint="Approve a post to send it live with the Orbit Support tag. Unverified recruiters stay here.">
        {pendingJobs.length === 0 ? <EmptyState text="No jobs waiting on review." /> : null}
        {pendingJobs.map((listing) => (
          <Surface key={listing.id} testID={`admin-pending-job-${listing.id}`}>
            <CardTitle>{listing.title}</CardTitle>
            <CardMeta>{`${listing.company} · ${listing.location}`}</CardMeta>
            <ActionRow>
              <DeskButton
                label="Go live"
                variant="lilac"
                testID={`admin-job-approve-${listing.id}`}
                onPress={() =>
                  void reviewEmployerListing(listing.id, 'open')
                    .then(async (next) => {
                      await setJobOverride(listing.boardJobId, { orbitVerified: true });
                      return next;
                    })
                    .then(setListings)
                }
              />
              <DeskButton
                label="Reject"
                variant="ghost"
                testID={`admin-job-reject-${listing.id}`}
                onPress={() => void reviewEmployerListing(listing.id, 'closed').then(setListings)}
              />
            </ActionRow>
          </Surface>
        ))}
      </Section>

      <Section title="Board">
        {controls
          ? PLATFORM_CONTROL_FIELDS.filter((field) => field.key === 'guestApply' || field.key === 'maintenance').map(
              (field) => (
                <ToggleRow
                  key={field.key}
                  testID={`admin-control-${field.key}`}
                  label={field.label}
                  helper={field.helper}
                  on={controls[field.key]}
                  onPress={() => void toggle(field.key, !controls[field.key])}
                />
              ),
            )
          : null}
      </Section>
    </DeskScreen>
  );
}
