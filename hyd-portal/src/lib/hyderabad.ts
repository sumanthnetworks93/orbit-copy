export const LOCALITIES = [
  'HITEC City',
  'Madhapur',
  'Gachibowli',
  'Kondapur',
  'Financial District',
  'Banjara Hills',
  'Jubilee Hills',
  'Begumpet',
  'Ameerpet',
  'Secunderabad',
  'Uppal',
  'Kukatpally',
  'Shamshabad',
  'Pocharam',
] as const;

export type Locality = (typeof LOCALITIES)[number];

export const METRO: Record<
  Locality,
  { station: string; line: 'BLUE' | 'RED' | 'GREEN'; minutesFromHub: number }
> = {
  'HITEC City': { station: 'HITEC City', line: 'BLUE', minutesFromHub: 8 },
  Madhapur: { station: 'Madhapur', line: 'BLUE', minutesFromHub: 10 },
  Gachibowli: { station: 'Raidurg', line: 'BLUE', minutesFromHub: 18 },
  Kondapur: { station: 'HITEC City', line: 'BLUE', minutesFromHub: 16 },
  'Financial District': { station: 'Raidurg', line: 'BLUE', minutesFromHub: 22 },
  'Banjara Hills': { station: 'Road No 5 Jubilee Hills', line: 'BLUE', minutesFromHub: 28 },
  'Jubilee Hills': { station: 'Jubilee Hills Check Post', line: 'BLUE', minutesFromHub: 24 },
  Begumpet: { station: 'Begumpet', line: 'RED', minutesFromHub: 32 },
  Ameerpet: { station: 'Ameerpet', line: 'RED', minutesFromHub: 30 },
  Secunderabad: { station: 'Parade Ground', line: 'GREEN', minutesFromHub: 40 },
  Uppal: { station: 'Uppal', line: 'BLUE', minutesFromHub: 45 },
  Kukatpally: { station: 'KPHB Colony', line: 'RED', minutesFromHub: 35 },
  Shamshabad: { station: 'Raidurg', line: 'BLUE', minutesFromHub: 55 },
  Pocharam: { station: 'Uppal', line: 'BLUE', minutesFromHub: 50 },
};

export function commuteMinutes(from: Locality, to: Locality): number {
  const a = METRO[from];
  const b = METRO[to];
  if (from === to) return Math.max(8, Math.round((a.minutesFromHub + b.minutesFromHub) / 8));
  const lineChange = a.line === b.line ? 0 : 14;
  return Math.abs(a.minutesFromHub - b.minutesFromHub) + 12 + lineChange;
}

export function formatPay(min: number, max: number, period: 'LPA' | 'MONTHLY'): string {
  if (period === 'LPA') {
    const a = Number(min).toFixed(1).replace(/\.0$/, '');
    const b = Number(max).toFixed(1).replace(/\.0$/, '');
    return `${a}–${b} LPA`;
  }
  return `₹${Math.round(Number(min)).toLocaleString('en-IN')}–₹${Math.round(Number(max)).toLocaleString('en-IN')}/mo`;
}

export function isLocality(value: string): value is Locality {
  return (LOCALITIES as readonly string[]).includes(value);
}
