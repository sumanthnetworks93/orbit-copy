import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProfileStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type AdminProfile = {
  id: string;
  name: string;
  role: 'seeker' | 'employer';
  company?: string;
  email: string;
  status: ProfileStatus;
  note?: string;
  suspended?: boolean;
};

const KEY = 'orbit_admin_profiles';

export const ADMIN_PROFILE_SEED: AdminProfile[] = [
  {
    id: 'ap-0',
    name: 'Sarah Bennett',
    role: 'employer',
    company: 'Helios Health',
    email: 'sarah@helios.health',
    status: 'verified',
    note: 'Verified by Orbit Support',
  },
  {
    id: 'ap-1',
    name: 'Maya Chen',
    role: 'employer',
    company: 'Northline',
    email: 'hiring@northline.test',
    status: 'pending',
  },
  {
    id: 'ap-2',
    name: 'Sri Sai Kirana',
    role: 'employer',
    company: 'Sri Sai Kirana',
    email: 'shop@saisai.test',
    status: 'pending',
  },
  {
    id: 'ap-3',
    name: 'Lakshmi Kadari',
    role: 'seeker',
    email: 'lakshmi@orbit.test',
    status: 'pending',
  },
  {
    id: 'ap-4',
    name: 'Kakatiya Hospital',
    role: 'employer',
    company: 'Kakatiya Multi-Speciality',
    email: 'hr@kakatiya.test',
    status: 'verified',
    note: 'Verified by Orbit Support',
  },
];

let cache: AdminProfile[] = ADMIN_PROFILE_SEED;

export function getAdminProfilesSync(): AdminProfile[] {
  return cache;
}

export function setAdminProfilesSync(next: AdminProfile[]) {
  cache = next;
  return cache;
}

export async function getAdminProfiles(): Promise<AdminProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      cache = ADMIN_PROFILE_SEED;
      await AsyncStorage.setItem(KEY, JSON.stringify(cache));
      return cache;
    }
    cache = JSON.parse(raw) as AdminProfile[];
    return cache;
  } catch {
    cache = ADMIN_PROFILE_SEED;
    return cache;
  }
}

export async function hydrateAdminProfiles(): Promise<AdminProfile[]> {
  return getAdminProfiles();
}

async function saveAdminProfiles(next: AdminProfile[]): Promise<AdminProfile[]> {
  cache = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(cache));
  return cache;
}

export async function reviewAdminProfile(
  id: string,
  status: 'verified' | 'rejected',
  note?: string,
): Promise<AdminProfile[]> {
  const profiles = await getAdminProfiles();
  return saveAdminProfiles(
    profiles.map((profile) =>
      profile.id === id
        ? {
            ...profile,
            status,
            note: note ?? (status === 'verified' ? 'Verified by Orbit Support' : profile.note),
          }
        : profile,
    ),
  );
}

export async function setAdminProfileSuspended(id: string, suspended: boolean): Promise<AdminProfile[]> {
  const profiles = await getAdminProfiles();
  return saveAdminProfiles(
    profiles.map((profile) =>
      profile.id === id
        ? { ...profile, suspended, note: suspended ? 'Suspended by Super Admin' : profile.note }
        : profile,
    ),
  );
}

export async function setAdminProfileRole(
  id: string,
  role: AdminProfile['role'],
): Promise<AdminProfile[]> {
  const profiles = await getAdminProfiles();
  return saveAdminProfiles(profiles.map((profile) => (profile.id === id ? { ...profile, role } : profile)));
}

export function pendingAdminProfiles(profiles: AdminProfile[]): AdminProfile[] {
  return profiles.filter((profile) => profile.status === 'pending' && !profile.suspended);
}

export function verifiedAdminProfiles(profiles: AdminProfile[]): AdminProfile[] {
  return profiles.filter((profile) => profile.status === 'verified' && !profile.suspended);
}

export function suspendedAdminProfiles(profiles: AdminProfile[]): AdminProfile[] {
  return profiles.filter((profile) => Boolean(profile.suspended));
}

export function isCompanyVerifiedByOrbitSupport(company?: string, profiles: AdminProfile[] = cache): boolean {
  const needle = company?.trim().toLowerCase();
  if (!needle) return false;
  return verifiedAdminProfiles(profiles).some(
    (profile) =>
      profile.role === 'employer' && (profile.company ?? '').trim().toLowerCase() === needle,
  );
}
