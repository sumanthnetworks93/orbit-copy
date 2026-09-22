import { describe, expect, it } from 'vitest';
import {
  OUTSIDE_LOCATION_TAG,
  applyOutsideLocationTag,
  areaFromGeo,
  isIndiaHyderabadLocation,
  matchesPreferredLocation,
  partitionJobsByLocation,
  preferredLocationLabel,
  withLocationReconciliation,
  withStartupLocation,
} from './locationReconcile';

describe('locationReconcile', () => {
  it('maps IP geo to a Telangana area and ignores foreign cities', () => {
    expect(areaFromGeo('Hyderabad', 'Telangana')).toBe('Hyderabad');
    expect(areaFromGeo('Gachibowli', 'Telangana')).toBe('Gachibowli');
    expect(areaFromGeo('Warangal', 'Telangana')).toBe('Warangal');
    expect(areaFromGeo('Mountain View', 'California')).toBeNull();
  });

  it('keeps Hyderabad and Telangana jobs local', () => {
    expect(isIndiaHyderabadLocation('Gachibowli, Hyderabad')).toBe(true);
    expect(isIndiaHyderabadLocation('HITEC City, Hyderabad', 'HITEC City')).toBe(true);
    expect(isIndiaHyderabadLocation('Warangal, Telangana')).toBe(true);
    expect(isIndiaHyderabadLocation('Remote · Hyderabad, India')).toBe(true);
  });

  it('marks jobs outside India and Hyderabad', () => {
    expect(isIndiaHyderabadLocation('New York')).toBe(false);
    expect(isIndiaHyderabadLocation('Remote · US')).toBe(false);
    expect(isIndiaHyderabadLocation('London')).toBe(false);
    expect(isIndiaHyderabadLocation('Remote · EU')).toBe(false);
    expect(isIndiaHyderabadLocation('Bangalore, India')).toBe(false);
    expect(isIndiaHyderabadLocation('Remote')).toBe(false);
  });

  it('adds an Outside location tag without duplicating it', () => {
    const tagged = applyOutsideLocationTag('TypeScript · Rust', true);
    expect(tagged).toBe(`TypeScript · Rust · ${OUTSIDE_LOCATION_TAG}`);
    expect(applyOutsideLocationTag(tagged, true)).toBe(tagged);
    expect(applyOutsideLocationTag(tagged, false)).toBe('TypeScript · Rust');
  });

  it('reconciles a remote job and leaves a Hyderabad job unchanged', () => {
    const remote = withLocationReconciliation({
      location: 'Remote · US',
      tags: 'TypeScript · Rust',
    });
    expect(remote.outsideLocation).toBe(true);
    expect(remote.tags).toContain(OUTSIDE_LOCATION_TAG);

    const local = withLocationReconciliation({
      location: 'Madhapur, Hyderabad',
      tags: 'Bike · Same day',
      area: 'Madhapur',
    });
    expect(local.outsideLocation).toBe(false);
    expect(local.tags).toBe('Bike · Same day');
  });

  it('uses manual location first, then auto-detected city', () => {
    expect(preferredLocationLabel({ area: 'Hyderabad', location: 'Warangal, Telangana', geoCity: 'London' })).toBe('Hyderabad');
    expect(preferredLocationLabel({ location: 'Hyderabad, India', geoCity: 'London' })).toBe('Hyderabad');
    expect(preferredLocationLabel({ geoCity: 'Hyderabad' })).toBe('Hyderabad');
  });

  it('matches Hyderabad jobs to a Hyderabad preference and not to Warangal', () => {
    const hyd = { location: 'Gachibowli, Hyderabad', area: 'Gachibowli', outsideLocation: false };
    expect(matchesPreferredLocation(hyd, 'Hyderabad')).toBe(true);
    expect(matchesPreferredLocation(hyd, 'Warangal')).toBe(false);
    expect(matchesPreferredLocation({ location: 'Remote · US', outsideLocation: true }, 'Hyderabad')).toBe(false);
  });

  it('puts preferred jobs first and outside jobs last', () => {
    const hyd = withLocationReconciliation({ id: 1, location: 'Madhapur, Hyderabad', tags: 'Bike', area: 'Madhapur' });
    const warangal = withLocationReconciliation({ id: 2, location: 'Warangal, Telangana', tags: 'Sales', area: 'Warangal' });
    const remote = withLocationReconciliation({ id: 3, location: 'New York', tags: 'Design' });
    const groups = partitionJobsByLocation([remote, warangal, hyd], 'Hyderabad');
    expect(groups.matching.map((job) => job.id)).toEqual([1]);
    expect(groups.other.map((job) => job.id)).toEqual([2]);
    expect(groups.outside.map((job) => job.id)).toEqual([3]);
  });

  it('marks remote startups outside and keeps Hyderabad startups local', () => {
    expect(withStartupLocation({ location: 'Remote' }).outsideLocation).toBe(true);
    expect(withStartupLocation({ location: 'HITEC City, Hyderabad', area: 'HITEC City' }).outsideLocation).toBe(false);
  });
});
