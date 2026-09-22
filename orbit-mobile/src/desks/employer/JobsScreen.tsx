import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { assertSafeListing } from '../../hyd/listingGuard';
import { createJob } from '../../services/api';
import { getAdminProfiles } from '../../services/adminModeration';
import {
  addEmployerListing,
  getEmployerListings,
  openEmployerListings,
  setListingStatus,
  type EmployerListing,
} from '../../services/employerJobs';
import {
  quoteNextJobPost,
  recordJobPost,
  rupees,
  type JobQuote,
} from '../../services/employerBilling';
import {
  ActionRow,
  CardMeta,
  CardTitle,
  ChipRow,
  DeskButton,
  DeskScreen,
  DeskSheet,
  EmptyState,
  Field,
  PageHeader,
  StatGrid,
  StatusPill,
  Surface,
} from '../../ui';

type JobFilter = 'All Jobs' | 'Active' | 'Draft' | 'Paused' | 'Closed';

function listingTone(listing: EmployerListing) {
  if (listing.status === 'open') return 'live' as const;
  if (listing.status === 'pending') return 'pending' as const;
  if (listing.status === 'paused') return 'frozen' as const;
  return 'hidden' as const;
}

function listingLabel(listing: EmployerListing) {
  if (listing.status === 'open') return 'Live';
  if (listing.status === 'pending') return 'Pending review';
  if (listing.status === 'paused') return 'Paused';
  return 'Closed';
}

export function EmployerJobsScreen() {
  const { user, idToken, refreshToken } = useAuth();
  const [listings, setListings] = useState<EmployerListing[]>([]);
  const [filter, setFilter] = useState<JobFilter>('All Jobs');
  const [postOpen, setPostOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Gachibowli, Hyderabad');
  const [jobType, setJobType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [tags, setTags] = useState('');
  const [quote, setQuote] = useState<JobQuote | null>(null);
  const [saving, setSaving] = useState(false);

  const company = user?.company ?? 'Helios Health';
  const firstName = (user?.name ?? 'Sarah').split(' ')[0];

  useFocusEffect(
    useCallback(() => {
      void Promise.all([getEmployerListings(), quoteNextJobPost()]).then(([next, nextQuote]) => {
        setListings(next);
        setQuote(nextQuote);
      });
    }, []),
  );

  const mine = listings.filter((listing) => listing.company === company);
  const visible = mine.filter((listing) => {
    if (filter === 'All Jobs') return true;
    if (filter === 'Active') return listing.status === 'open';
    if (filter === 'Draft') return listing.status === 'pending';
    if (filter === 'Paused') return listing.status === 'paused';
    return listing.status === 'closed';
  });

  async function publish() {
    const check = assertSafeListing({
      title: title.trim(),
      company,
      location: location.trim(),
      salary: salary.trim(),
      tags: tags.trim(),
      jobType: jobType.trim(),
    });
    if (!check.ok) {
      Alert.alert('Post a Job', check.error);
      return;
    }
    setSaving(true);
    try {
      const profiles = await getAdminProfiles();
      const verified = profiles.some(
        (profile) =>
          profile.role === 'employer' &&
          profile.status === 'verified' &&
          !profile.suspended &&
          (profile.email === user?.email || profile.company === company),
      );
      const token = idToken ?? (await refreshToken());
      let boardJobId: number | undefined;
      if (token) {
        try {
          const created = await createJob(
            {
              title: title.trim(),
              company,
              location: location.trim(),
              jobType: jobType.trim() || 'Full-time',
              tags: tags.trim() || 'Hyderabad',
              salary: salary.trim(),
            },
            token,
          );
          boardJobId = created.id;
        } catch {
          boardJobId = undefined;
        }
      }
      const nextQuote = await quoteNextJobPost();
      await addEmployerListing({
        title: title.trim(),
        company,
        location: location.trim(),
        jobType: jobType.trim() || 'Full-time',
        salary: salary.trim(),
        tags: tags.trim() || 'Hyderabad',
        holdForReview: !verified,
        boardJobId,
      });
      await recordJobPost(nextQuote);
      setTitle('');
      setSalary('');
      setTags('');
      setPostOpen(false);
      setListings(await getEmployerListings());
      setQuote(await quoteNextJobPost());
    } catch (error) {
      Alert.alert('Post a Job', error instanceof Error ? error.message : 'Could not save the listing.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DeskScreen testID="employer-screen">
      <PageHeader
        kicker="Employer"
        title={firstName}
        subtitle={company}
        titleTestID="employer-welcome"
        subtitleTestID="employer-company"
      />
      <StatGrid
        items={[
          { label: 'Open roles', value: openEmployerListings(mine).length, testID: 'kpi-Active Jobs' },
          {
            label: 'Applicants',
            value: mine.reduce((sum, job) => sum + job.applicants, 0),
            testID: 'kpi-Total Applicants',
          },
          { label: 'Listings', value: mine.length, testID: 'kpi-Candidates Shortlisted' },
        ]}
      />
      <ActionRow>
        <DeskButton testID="employer-go-post" label="+ Post a Job" variant="lilac" onPress={() => setPostOpen(true)} />
      </ActionRow>
      <ChipRow
        testIDPrefix="job-filter"
        value={filter}
        onChange={setFilter}
        chips={[
          { id: 'All Jobs', label: 'All Jobs' },
          { id: 'Active', label: 'Live' },
          { id: 'Draft', label: 'Pending' },
          { id: 'Paused', label: 'Paused' },
          { id: 'Closed', label: 'Closed' },
        ]}
      />
      {visible.length === 0 ? <EmptyState text="No listings in this filter." /> : null}
      {visible.map((job) => (
        <Surface key={job.id} testID={`employer-job-${job.boardJobId}`}>
          <StatusPill tone={listingTone(job)} label={listingLabel(job)} />
          <CardTitle>{job.title}</CardTitle>
          <CardMeta>{`${job.location} · ${job.jobType} · ${job.salary}`}</CardMeta>
          <CardMeta>{`${job.applicants} applicants · ${job.postedAt}`}</CardMeta>
          <ActionRow>
            <DeskButton
              label={job.status === 'paused' ? 'Resume' : 'Pause'}
              variant="ghost"
              onPress={() =>
                void setListingStatus(job.id, job.status === 'paused' ? 'open' : 'paused').then(setListings)
              }
            />
            <DeskButton
              label="Close"
              variant="ghost"
              onPress={() => void setListingStatus(job.id, 'closed').then(setListings)}
            />
          </ActionRow>
        </Surface>
      ))}

      <DeskSheet visible={postOpen} title="Post a Job" testID="employer-post-screen" onClose={() => setPostOpen(false)}>
        <CardMeta testID="employer-post-quota">
          {quote
            ? quote.chargeInr === 0
              ? `${quote.remainingIncluded} of ${quote.included} included jobs left this month. Extra jobs are ₹25.`
              : `Included jobs are used. This post is ${rupees(quote.chargeInr)}.`
            : 'Two jobs each month are free. Extra jobs are ₹25.'}
        </CardMeta>
        <Field label="Role title" testID="employer-post-title" value={title} onChange={setTitle} placeholder="Staff Nurse" />
        <Field label="Company" value={company} onChange={() => undefined} editable={false} />
        <Field
          label="Location"
          testID="employer-post-location"
          value={location}
          onChange={setLocation}
          placeholder="Gachibowli, Hyderabad"
        />
        <Field label="Type" value={jobType} onChange={setJobType} placeholder="Full-time" />
        <Field
          label="Salary"
          testID="employer-post-salary"
          value={salary}
          onChange={setSalary}
          placeholder="₹28,000–₹36,000 / month"
        />
        <Field label="Tags" value={tags} onChange={setTags} placeholder="Nursing · Hospital" />
        <ActionRow>
          <DeskButton label="Cancel" variant="ghost" onPress={() => setPostOpen(false)} />
          <DeskButton
            testID="employer-publish"
            label={saving ? 'Publishing…' : quote?.chargeInr ? `Pay ${rupees(quote.chargeInr)} and publish` : 'Publish role'}
            variant="lilac"
            disabled={saving}
            onPress={() => void publish()}
          />
        </ActionRow>
      </DeskSheet>
    </DeskScreen>
  );
}
