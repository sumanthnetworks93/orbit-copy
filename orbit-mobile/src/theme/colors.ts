export const colors = {
  canvas: '#F7F4EC',
  white: '#FFFFFF',
  card: '#FFFdf8',
  ink: '#14120E',
  muted: '#7A756C',
  label: '#9A948A',
  border: '#E6E0D4',
  black: '#111110',
  sand: '#EFE8DC',
  lilac: '#E8E4FF',
  hunt: '#FF6154',
};

export const elevation = {
  card: {
    shadowColor: '#14120E',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  float: {
    shadowColor: '#14120E',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
};

export type BackgroundTheme = 'blobs' | 'emoji' | 'dots' | 'doodle' | 'rings';
