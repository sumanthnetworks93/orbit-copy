import { describe, expect, it } from 'vitest';
import { getJobReports, reportListing, reportMailto } from './reports';

const job = { id: 9001, title: 'Staff Nurse', company: 'KIMS Hospitals' };

describe('reports', () => {
  it('stores a job report and an employer report', async () => {
    const jobReport = await reportListing('job', job);
    const employerReport = await reportListing('employer', job);
    const all = await getJobReports();

    expect(jobReport.kind).toBe('job');
    expect(employerReport.kind).toBe('employer');
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe(employerReport.id);
    expect(all.map((item) => item.company)).toContain('KIMS Hospitals');
  });

  it('builds a support mailto for the job and the employer', () => {
    expect(reportMailto('job', job)).toContain('mailto:support@orbit.app');
    expect(reportMailto('job', job)).toContain(encodeURIComponent('Report job: Staff Nurse'));
    expect(reportMailto('employer', job)).toContain(encodeURIComponent('Report employer: KIMS Hospitals'));
  });
});
