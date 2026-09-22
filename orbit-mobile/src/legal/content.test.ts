import { describe, expect, it } from 'vitest';
import { getLegalDoc, LEGAL_DOCS, SUPPORT_EMAIL, supportMailto } from './content';

describe('legal content', () => {
  it('ships privacy, seeker terms, employer terms, and privacy notice', () => {
    expect(getLegalDoc('privacy').title).toBe('Privacy Policy');
    expect(getLegalDoc('terms').title).toBe('Terms of Use');
    expect(getLegalDoc('termsEmployer').title).toBe('Terms for employers');
    expect(getLegalDoc('notice').title).toBe('Privacy Notice');
    expect(Object.keys(LEGAL_DOCS)).toEqual(['privacy', 'terms', 'termsEmployer', 'notice']);
    expect(getLegalDoc('privacy').sections.map((s) => s.heading)).toContain('What candidate data we collect');
    expect(getLegalDoc('privacy').sections.find((s) => s.heading === 'Where it is stored')?.body).toMatch(
      /application database/i,
    );
    expect(getLegalDoc('privacy').sections.find((s) => s.heading === 'How we protect it')?.body).toMatch(
      /masked number/i,
    );
    expect(getLegalDoc('privacy').sections.map((s) => s.body).join(' ')).toMatch(/Digital Personal Data Protection/);
    expect(getLegalDoc('privacy').sections.map((s) => s.body).join(' ')).toMatch(/Digital Personal Data Protection Rules, 2025/);
    expect(getLegalDoc('terms').sections[0].heading).toMatch(/job seekers/i);
    expect(getLegalDoc('termsEmployer').sections.map((s) => s.body).join(' ')).toMatch(
      /does not replace any statutory employer obligation/i,
    );
    expect(getLegalDoc('termsEmployer').sections.map((s) => s.body).join(' ')).toMatch(
      /Verified by Orbit Support/i,
    );
    expect(getLegalDoc('notice').sections[0].body).toMatch(/customer database/i);
  });

  it('points support mail at the Orbit inbox', () => {
    expect(SUPPORT_EMAIL).toBe('support@orbit.app');
    expect(supportMailto()).toContain('mailto:support@orbit.app');
  });
});
