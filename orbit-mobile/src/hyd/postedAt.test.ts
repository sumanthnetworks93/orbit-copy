import { describe, expect, it } from 'vitest';
import { countPostedOnDay, dayKeyInIst, jobsFeedRows, mergeDayCounts, postedDayLabel, startupFeedRows } from './postedAt';

const noonIst = Date.parse('2026-09-13T06:30:00.000Z');

describe('posted day counts', () => {
  it('uses the India calendar day', () => {
    expect(dayKeyInIst('2026-09-13T06:30:00.000Z')).toBe('2026-09-13');
    expect(dayKeyInIst('2026-09-12T18:31:00.000Z')).toBe('2026-09-13');
  });

  it('labels today and yesterday', () => {
    expect(postedDayLabel('2026-09-13', noonIst)).toBe('Today');
    expect(postedDayLabel('2026-09-12', noonIst)).toBe('Yesterday');
  });

  it('counts jobs posted on a day', () => {
    const jobs = [
      { postedAt: '2026-09-13T04:00:00.000Z' },
      { postedAt: '2026-09-13T10:00:00.000Z' },
      { postedAt: '2026-09-12T04:00:00.000Z' },
    ];
    expect(countPostedOnDay(jobs, '2026-09-13')).toBe(2);
  });

  it('adds Hyderabad jobs onto the API day totals', () => {
    const counts = mergeDayCounts(
      [{ date: '2026-09-13', count: 5 }],
      [{ postedAt: '2026-09-13T08:00:00.000Z' }, { postedAt: '2026-09-12T08:00:00.000Z' }],
    );
    expect(counts['2026-09-13']).toBe(6);
    expect(counts['2026-09-12']).toBe(1);
  });

  it('inserts a day header with that day’s count', () => {
    const rows = jobsFeedRows(
      [
        { id: 1, postedAt: '2026-09-13T08:00:00.000Z' },
        { id: 2, postedAt: '2026-09-13T09:00:00.000Z' },
        { id: 3, postedAt: '2026-09-12T09:00:00.000Z' },
      ],
      { '2026-09-13': 12, '2026-09-12': 4 },
      noonIst,
    );
    expect(rows[0]).toMatchObject({ kind: 'day', label: 'Today', count: 12 });
    expect(rows[3]).toMatchObject({ kind: 'day', label: 'Yesterday', count: 4 });
  });

  it('sorts so each calendar day has one header', () => {
    const rows = jobsFeedRows(
      [
        { id: 1, postedAt: '2026-09-12T09:00:00.000Z' },
        { id: 2, postedAt: '2026-09-13T09:00:00.000Z' },
        { id: 3, postedAt: '2026-09-12T10:00:00.000Z' },
      ],
      { '2026-09-13': 1, '2026-09-12': 2 },
      noonIst,
    );
    expect(rows.filter((row) => row.kind === 'day').map((row) => row.label)).toEqual(['Today', 'Yesterday']);
  });

  it('keeps Hyderabad jobs above an Outside location section', () => {
    const rows = jobsFeedRows(
      [
        { id: 1, postedAt: '2026-09-13T08:00:00.000Z', location: 'New York', outsideLocation: true },
        { id: 2, postedAt: '2026-09-12T09:00:00.000Z', location: 'Gachibowli, Hyderabad', area: 'Gachibowli', outsideLocation: false },
        { id: 3, postedAt: '2026-09-13T09:00:00.000Z', location: 'Madhapur, Hyderabad', area: 'Madhapur', outsideLocation: false },
      ],
      { '2026-09-13': 2, '2026-09-12': 1 },
      noonIst,
      'Hyderabad',
    );
    const jobIds = rows.filter((row) => row.kind === 'job').map((row) => row.job.id);
    expect(jobIds).toEqual([3, 2, 1]);
    expect(rows.filter((row) => row.kind === 'section').map((row) => row.label)).toEqual([
      'In Hyderabad',
      'Outside location',
    ]);
  });

  it('groups Hyderabad startups above an Outside location section', () => {
    const rows = startupFeedRows(
      [
        { id: 1, location: 'New York', outsideLocation: true },
        { id: 2, location: 'Warangal, Telangana', area: 'Warangal', outsideLocation: false },
        { id: 3, location: 'Gachibowli, Hyderabad', area: 'Gachibowli', outsideLocation: false },
      ],
      'Hyderabad',
    );
    expect(rows.filter((row) => row.kind === 'startup').map((row) => row.startup.id)).toEqual([3, 2, 1]);
    expect(rows.filter((row) => row.kind === 'section').map((row) => row.label)).toEqual([
      'In Hyderabad',
      'More local startups',
      'Outside location',
    ]);
  });
});
