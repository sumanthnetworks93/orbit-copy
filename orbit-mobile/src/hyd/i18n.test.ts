import { describe, expect, it } from 'vitest';
import { t } from './i18n';

describe('i18n', () => {
  it('returns English copy by default', () => {
    expect(t('en').jobs).toBe('Jobs');
    expect(t('en').verified).toBe('Verified by Orbit Support');
  });

  it('returns Telugu labels without dropping keys', () => {
    const en = t('en');
    const te = t('te');
    expect(Object.keys(te).sort()).toEqual(Object.keys(en).sort());
    expect(te.jobs).not.toBe(en.jobs);
    expect(te.whatsapp).not.toBe(en.whatsapp);
  });
});
