import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { HYD_JOBS } from '../../hyd/seed';
import { fetchPostedJobs } from '../../services/api';
import {
  getJobOverride,
  hydrateJobOverrides,
  toggleJobFrozen,
  toggleJobHidden,
  toggleJobOrbitVerified,
  type JobOverrides,
} from '../../services/adminJobs';
import {
  getEmployerListings,
  type EmployerListing,
} from '../../services/employerJobs';
import { isJobVerifiedByOrbitSupport, ORBIT_SUPPORT_TAG } from '../../services/orbitSupport';
import type { Job } from '../../types';
import {
  ActionRow,
  CardMeta,
  CardTitle,
  ChipRow,
  DeskButton,
  DeskScreen,
  EmptyState,
  PageHeader,
  SearchField,
  StatusPill,
  Surface,
} from '../../ui';

type JobFilter = 'all' | 'live' | 'frozen' | 'hidden' | 'pending';

type Row = {
  id: number;
  listingId?: string;
  title: string;
  company: string;
  location: string;
  pending: boolean;
  seedFrozen?: boolean;
};

function statusOf(row: Row, overrides: JobOverrides): JobFilter {
  const override = overrides[row.id] ?? getJobOverride(row.id);
  if (row.pending) return 'pending';
  if (override?.hidden) return 'hidden';
  const frozen = override?.frozen ?? Boolean(row.seedFrozen);
  if (frozen) return 'frozen';
  return 'live';
}

export function JobsScreen() {
  const [overrides, setOverrides] = useState<JobOverrides>({});
  const [posted, setPosted] = useState<Job[]>([]);
  const [listings, setListings] = useState<EmployerListing[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<JobFilter>('all');

  useFocusEffect(
    useCallback(() => {
      void Promise.all([hydrateJobOverrides(), fetchPostedJobs(), getEmployerListings()]).then(
        ([nextOverrides, nextPosted, nextListings]) => {
          setOverrides(nextOverrides);
          setPosted(nextPosted);
          setListings(nextListings);
        },
      );
    }, []),
  );

  const rows = useMemo(() => {
    const hydRows: Row[] = HYD_JOBS.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: `${job.company} · ${job.area}`,
      pending: false,
      seedFrozen: job.frozen,
    }));
    const listingRows: Row[] = listings.map((listing) => ({
      id: listing.boardJobId,
      listingId: listing.id,
      title: listing.title,
      company: listing.company,
      location: listing.location,
      pending: listing.status === 'pending',
      seedFrozen: listing.status === 'paused',
    }));
    const postedRows: Row[] = posted.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      pending: false,
    }));
    const seen = new Set<number>();
    const merged: Row[] = [];
    [...listingRows, ...hydRows, ...postedRows].forEach((row) => {
      if (seen.has(row.id)) return;
      seen.add(row.id);
      merged.push(row);
    });
    const q = query.trim().toLowerCase();
    return merged.filter((row) => {
      const status = statusOf(row, overrides);
      if (filter !== 'all' && status !== filter) return false;
      if (!q) return true;
      return `${row.title} ${row.company} ${row.location} ${row.id}`.toLowerCase().includes(q);
    });
  }, [listings, posted, overrides, query, filter]);

  return (
    <DeskScreen testID="admin-jobs-screen">
      <PageHeader
        kicker="Listings"
        title="Jobs"
        subtitle="Freeze a role to pull it from the seeker feed. Verify a listing to stamp Verified by Orbit Support."
      />
      <SearchField testID="admin-jobs-search" value={query} onChange={setQuery} placeholder="Search title, company, id" />
      <ChipRow
        testIDPrefix="admin-job-filter"
        value={filter}
        onChange={setFilter}
        chips={[
          { id: 'all', label: 'All' },
          { id: 'live', label: 'Live' },
          { id: 'pending', label: 'Pending' },
          { id: 'frozen', label: 'Frozen' },
          { id: 'hidden', label: 'Hidden' },
        ]}
      />
      {rows.length === 0 ? <EmptyState text="No jobs match." /> : null}
      {rows.map((row) => {
        const status = statusOf(row, overrides);
        const override = overrides[row.id] ?? {};
        const frozen = override.frozen ?? Boolean(row.seedFrozen);
        const hidden = Boolean(override.hidden);
        const orbitVerified = isJobVerifiedByOrbitSupport({ id: row.id, company: row.company });
        return (
          <Surface key={row.id} testID={`admin-job-${row.id}`}>
            <StatusPill
              tone={status === 'live' ? 'live' : status === 'pending' ? 'pending' : status === 'hidden' ? 'hidden' : 'frozen'}
              label={
                status === 'live'
                  ? 'Live'
                  : status === 'pending'
                    ? 'Pending review'
                    : status === 'hidden'
                      ? 'Hidden from seekers'
                      : 'Frozen'
              }
            />
            {orbitVerified ? <StatusPill tone="verified" label={ORBIT_SUPPORT_TAG} /> : null}
            <CardTitle>{row.title}</CardTitle>
            <CardMeta>{`${row.company} · ${row.location} · #${row.id}`}</CardMeta>
            <ActionRow>
              <DeskButton
                testID={`admin-freeze-${row.id}`}
                label={frozen ? 'Unfreeze' : 'Freeze'}
                variant={frozen ? 'lilac' : 'ghost'}
                onPress={() => void toggleJobFrozen(row.id, frozen).then(setOverrides)}
              />
              <DeskButton
                testID={`admin-hide-${row.id}`}
                label={hidden ? 'Show' : 'Hide'}
                variant={hidden ? 'lilac' : 'ghost'}
                onPress={() => void toggleJobHidden(row.id, hidden).then(setOverrides)}
              />
              {status !== 'pending' ? (
                <DeskButton
                  testID={`admin-verify-${row.id}`}
                  label={orbitVerified ? 'Remove tag' : 'Orbit Support'}
                  variant={orbitVerified ? 'ghost' : 'lilac'}
                  onPress={() => void toggleJobOrbitVerified(row.id, orbitVerified).then(setOverrides)}
                />
              ) : null}
            </ActionRow>
          </Surface>
        );
      })}
    </DeskScreen>
  );
}
