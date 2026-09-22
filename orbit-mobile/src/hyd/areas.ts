export const HYD_AREAS = [
  'HITEC City',
  'Gachibowli',
  'Financial District',
  'Madhapur',
  'Kompally',
  'Uppal',
] as const;

export type HydArea = (typeof HYD_AREAS)[number];

export const TELANGANA_DISTRICTS = [
  'Adilabad',
  'Bhadradri Kothagudem',
  'Hanumakonda',
  'Hyderabad',
  'Jagtial',
  'Jangaon',
  'Jayashankar Bhupalpally',
  'Jogulamba Gadwal',
  'Kamareddy',
  'Karimnagar',
  'Khammam',
  'Kumuram Bheem Asifabad',
  'Mahabubabad',
  'Mahabubnagar',
  'Mancherial',
  'Medak',
  'Medchal-Malkajgiri',
  'Mulugu',
  'Nagarkurnool',
  'Nalgonda',
  'Narayanpet',
  'Nirmal',
  'Nizamabad',
  'Peddapalli',
  'Rajanna Sircilla',
  'Rangareddy',
  'Sangareddy',
  'Siddipet',
  'Suryapet',
  'Vikarabad',
  'Wanaparthy',
  'Warangal',
  'Yadadri Bhuvanagiri',
] as const;

export type TelanganaDistrict = (typeof TELANGANA_DISTRICTS)[number];

const AREA_TO_DISTRICT: Record<string, TelanganaDistrict> = {
  'HITEC City': 'Rangareddy',
  Gachibowli: 'Rangareddy',
  'Financial District': 'Rangareddy',
  Madhapur: 'Rangareddy',
  Kompally: 'Medchal-Malkajgiri',
  Uppal: 'Medchal-Malkajgiri',
  Secunderabad: 'Hyderabad',
};

const DISTRICT_SET = new Set<string>(TELANGANA_DISTRICTS);

export function isTelanganaDistrict(value: string): value is TelanganaDistrict {
  return DISTRICT_SET.has(value);
}

export function districtForArea(area: string): TelanganaDistrict {
  if (isTelanganaDistrict(area)) return area;
  return AREA_TO_DISTRICT[area] ?? 'Hyderabad';
}

export function jobMatchesDistrict(area: string, district: string): boolean {
  if (!isTelanganaDistrict(district)) return area === district;
  if (districtForArea(area) === district) return true;
  if (district === 'Hyderabad' && (HYD_AREAS as readonly string[]).includes(area)) return true;
  return area === district;
}
