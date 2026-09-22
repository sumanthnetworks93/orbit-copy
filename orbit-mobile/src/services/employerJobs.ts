import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyOutsideLocationTag, isOutsideLocation } from '../hyd/locationReconcile';
import type { Job, JobFilters } from '../types';
import { isFreelanceJob } from '../hyd/freelance';
import { getPlatformControlsSync } from './adminControl';
import { getJobOverride } from './adminJobs';
import { isJobVerifiedByOrbitSupport } from './orbitSupport';

export type ListingStatus = 'open' | 'pending' | 'paused' | 'closed';

export type EmployerListing = {
  id: string;
  boardJobId: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  tags: string;
  applicants: number;
  status: ListingStatus;
  postedAt: string;
  postedAtIso?: string;
};

export type EmployerApplicant = {
  id: string;
  name: string;
  role: string;
  note: string;
  appliedAt: string;
  jobId: number;
};

const LISTINGS_KEY = 'orbit_employer_listings';
let cache: EmployerListing[] = [];

const SEED_LISTINGS: EmployerListing[] = [
  {
    id: 'el-1',
    boardJobId: 7101,
    title: 'Staff Nurse',
    company: 'Helios Health',
    location: 'Gachibowli, Hyderabad',
    jobType: 'Full-time',
    salary: '₹28,000–₹36,000 / month',
    tags: 'Nursing · Hospital',
    applicants: 3,
    status: 'open',
    postedAt: '2d ago',
  },
  {
    id: 'el-2',
    boardJobId: 7102,
    title: 'Front Office Executive',
    company: 'Helios Health',
    location: 'HITEC City, Hyderabad',
    jobType: 'Full-time',
    salary: '₹22,000–₹28,000 / month',
    tags: 'Clinic · Front desk',
    applicants: 1,
    status: 'open',
    postedAt: '5d ago',
  },
  {
    id: 'el-3',
    boardJobId: 7103,
    title: 'Warehouse Associate',
    company: 'Northline',
    location: 'Jeedimetla, Hyderabad',
    jobType: 'Full-time',
    salary: '₹18,000–₹22,000 / month',
    tags: 'Logistics',
    applicants: 0,
    status: 'pending',
    postedAt: 'Just now',
  },
];

const SEED_APPLICANTS: EmployerApplicant[] = [
  {
    id: 'ea-1',
    name: 'Lakshmi Kadari',
    role: 'Staff Nurse',
    note: 'Night-shift nurse, Gachibowli.',
    appliedAt: 'Today',
    jobId: 7101,
  },
  {
    id: 'ea-2',
    name: 'Arjun Rao',
    role: 'Front Office Executive',
    note: 'Clinic desk, HITEC.',
    appliedAt: 'Yesterday',
    jobId: 7102,
  },
];

function withListingLocation(listing: EmployerListing): EmployerListing {
  return {
    ...listing,
    tags: applyOutsideLocationTag(listing.tags, isOutsideLocation(listing.location)),
  };
}

function normalize(listing: EmployerListing): EmployerListing {
  return withListingLocation({
    ...listing,
    boardJobId: listing.boardJobId || Number(String(listing.id).replace(/\D/g, '')) || Date.now() % 1_000_000_000,
    company: listing.company || 'Employer',
    status: listing.status ?? 'open',
  });
}

export function getEmployerListingsSync(): EmployerListing[] {
  return cache;
}

export function setEmployerListingsSync(next: EmployerListing[]) {
  cache = next.map(normalize);
  return cache;
}

async function save(next: EmployerListing[]): Promise<EmployerListing[]> {
  cache = next.map(normalize);
  await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(cache));
  return cache;
}

export async function getEmployerListings(): Promise<EmployerListing[]> {
  try {
    const raw = await AsyncStorage.getItem(LISTINGS_KEY);
    if (!raw) {
      return save(SEED_LISTINGS);
    }
    const parsed = (JSON.parse(raw) as EmployerListing[]).map(normalize);
    cache = parsed;
    return parsed;
  } catch {
    cache = SEED_LISTINGS.map(normalize);
    return cache;
  }
}

export async function hydrateEmployerListings(): Promise<EmployerListing[]> {
  return getEmployerListings();
}

export function listingToJob(listing: EmployerListing): Job {
  const company = listing.company;
  return {
    id: listing.boardJobId,
    title: listing.title,
    company,
    location: listing.location,
    jobType: listing.jobType,
    tags: listing.tags,
    salary: listing.salary,
    initial: company.slice(0, 1).toUpperCase(),
    color: '#5B4B8A',
    area: listing.location.split(',')[0]?.trim(),
    verifiedEmployer: isJobVerifiedByOrbitSupport({ id: listing.boardJobId, company }),
    postedAt: listing.postedAtIso ?? null,
    frozen: listing.status === 'paused',
  };
}

function matchesPostedFilters(job: Job, filters: JobFilters): boolean {
  const override = getJobOverride(job.id);
  if (override?.hidden || override?.frozen) return false;
  if (job.frozen) return false;
  const q = filters.search.trim().toLowerCase();
  if (q && !`${job.title} ${job.company} ${job.tags} ${job.location}`.toLowerCase().includes(q)) return false;
  if (filters.jobType && job.jobType !== filters.jobType) return false;
  if (filters.freelanceOnly ? !isFreelanceJob(job) : isFreelanceJob(job)) return false;
  const loc = filters.location.trim().toLowerCase();
  if (loc && !`${job.location} ${job.area ?? ''}`.toLowerCase().includes(loc)) return false;
  if (filters.remoteOnly) return false;
  return true;
}

export function getVisiblePostedJobs(filters: JobFilters): Job[] {
  return cache.filter((listing) => listing.status === 'open').map(listingToJob).filter((job) => matchesPostedFilters(job, filters));
}

export function pendingEmployerListings(listings: EmployerListing[] = cache): EmployerListing[] {
  return listings.filter((listing) => listing.status === 'pending');
}

export function openEmployerListings(listings: EmployerListing[] = cache): EmployerListing[] {
  return listings.filter((listing) => listing.status === 'open');
}

export async function addEmployerListing(
  input: Omit<EmployerListing, 'id' | 'applicants' | 'status' | 'postedAt' | 'boardJobId'> & {
    holdForReview?: boolean;
    boardJobId?: number;
  },
): Promise<EmployerListing> {
  const listings = await getEmployerListings();
  const pending = input.holdForReview || getPlatformControlsSync().jobReviewRequired;
  const created: EmployerListing = {
    title: input.title,
    company: input.company,
    location: input.location,
    jobType: input.jobType,
    salary: input.salary,
    tags: input.tags,
    id: `el-${Date.now()}`,
    boardJobId: input.boardJobId ?? (7000 + (Date.now() % 100000)),
    applicants: 0,
    status: pending ? 'pending' : 'open',
    postedAt: 'Just now',
    postedAtIso: new Date().toISOString(),
  };
  const tagged = normalize(created);
  await save([tagged, ...listings]);
  return tagged;
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<EmployerListing[]> {
  const listings = await getEmployerListings();
  return save(listings.map((listing) => (listing.id === id ? { ...listing, status } : listing)));
}

export async function reviewEmployerListing(id: string, status: 'open' | 'closed'): Promise<EmployerListing[]> {
  return setListingStatus(id, status);
}

export function getEmployerApplicants(): EmployerApplicant[] {
  return SEED_APPLICANTS;
}
