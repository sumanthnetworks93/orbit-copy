export type StartupFilters = {
  search: string;
  category: string | null;
  hiringOnly: boolean;
};

export type JobFilters = {
  search: string;
  jobType: string | null;
  location: string;
  remoteOnly: boolean;
  area?: string | null;
  womenSafe?: boolean;
  cabProvided?: boolean;
  nearMetro?: boolean;
  lateShift?: boolean;
  verifiedOnly?: boolean;
  walkInOnly?: boolean;
  freelanceOnly?: boolean;
};

export const defaultStartupFilters: StartupFilters = {
  search: '',
  category: null,
  hiringOnly: false,
};

export const defaultJobFilters: JobFilters = {
  search: '',
  jobType: null,
  location: '',
  remoteOnly: false,
  area: null,
  womenSafe: false,
  cabProvided: false,
  nearMetro: false,
  lateShift: false,
  verifiedOnly: false,
  walkInOnly: false,
};

export type GeoLocation = {
  ip: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  flag: string;
  emoji: string;
  district?: string;
};

export type PagedResponse<T> = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
};

export type PagedJobsResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  startupCount: number;
  postedTodayCount: number;
  postedByDay: { date: string; count: number }[];
  jobs: Job[];
};

export type Startup = {
  id: number;
  name: string;
  description: string;
  category: string;
  openRoles: number;
  upvotes: number;
  initial: string;
  color: string;
  location: string;
  area?: string;
  outsideLocation?: boolean;
};

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  tags: string;
  salary: string;
  initial: string;
  color: string;
  sourceUrl?: string | null;
  area?: string;
  womenSafe?: boolean;
  cabProvided?: boolean;
  nearMetro?: boolean;
  lateShift?: boolean;
  verifiedEmployer?: boolean;
  lastReplyAt?: string;
  frozen?: boolean;
  commuteMin?: number;
  walkIn?: {
    date: string;
    time: string;
    venue: string;
    askFor: string;
    bring: string;
  };
  employerPhone?: string;
  postedAt?: string | null;
  outsideLocation?: boolean;
  about?: string;
};

export type JobsResponse = {
  roleCount: number;
  startupCount: number;
  jobs: Job[];
};

export function countActiveStartupFilters(filters: StartupFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.category) count += 1;
  if (filters.hiringOnly) count += 1;
  return count;
}

export function countActiveJobFilters(filters: JobFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.jobType) count += 1;
  if (filters.location.trim()) count += 1;
  if (filters.remoteOnly) count += 1;
  if (filters.area) count += 1;
  if (filters.womenSafe) count += 1;
  if (filters.cabProvided) count += 1;
  if (filters.nearMetro) count += 1;
  if (filters.lateShift) count += 1;
  if (filters.verifiedOnly) count += 1;
  if (filters.walkInOnly) count += 1;
  return count;
}
