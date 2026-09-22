import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutUser } from './auth';

const SEEKER_KEYS = [
  'orbit_simple_resume',
  'orbit_hyd_applications',
  'orbit_hyd_replies',
  'orbit_hyd_threads',
  'orbit_job_match_alerts',
  'orbit_applied_jobs',
  'orbit_profile_display_name',
  'orbit_profile_notifications',
  'orbit_saved_startups',
  'orbit_voted_startup_ids',
  'orbit_job_reports',
  'orbit_onboarding_done',
];

export async function closeSeekerAccount(): Promise<void> {
  await Promise.all(SEEKER_KEYS.map((key) => AsyncStorage.removeItem(key)));
  await signOutUser();
}
