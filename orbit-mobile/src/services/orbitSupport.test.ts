import { describe, expect, it, beforeEach } from 'vitest';
import { setJobOverridesSync } from './adminJobs';
import { ADMIN_PROFILE_SEED, setAdminProfilesSync } from './adminModeration';
import { isJobVerifiedByOrbitSupport, ORBIT_SUPPORT_TAG, withOrbitSupportTag } from './orbitSupport';

beforeEach(() => {
  setJobOverridesSync({});
  setAdminProfilesSync(ADMIN_PROFILE_SEED);
});

describe('Orbit Support verification', () => {
  it('does not tag a seed listing until Super Admin verifies it', () => {
    expect(isJobVerifiedByOrbitSupport({ id: 9001, company: 'KIMS Hospitals' })).toBe(false);
    expect(withOrbitSupportTag({ id: 9001, company: 'KIMS Hospitals', verifiedEmployer: true }).verifiedEmployer).toBe(
      false,
    );
  });

  it('tags a job after Super Admin stamps Orbit Support', () => {
    setJobOverridesSync({ 9001: { orbitVerified: true } });
    expect(isJobVerifiedByOrbitSupport({ id: 9001, company: 'KIMS Hospitals' })).toBe(true);
    expect(ORBIT_SUPPORT_TAG).toBe('Verified by Orbit Support');
  });

  it('tags listings from an employer Super Admin already verified', () => {
    expect(isJobVerifiedByOrbitSupport({ id: 7101, company: 'Helios Health' })).toBe(true);
  });

  it('lets Super Admin remove the tag from a verified company listing', () => {
    setJobOverridesSync({ 7101: { orbitVerified: false } });
    expect(isJobVerifiedByOrbitSupport({ id: 7101, company: 'Helios Health' })).toBe(false);
  });
});
