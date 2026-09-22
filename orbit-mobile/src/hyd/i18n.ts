import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'te';

const LANG_KEY = 'orbit_lang';

const EN = {
  jobs: 'Jobs',
  walkins: 'Walk-ins',
  applied: 'Applied',
  profile: 'Profile',
  apply: 'Apply without resume',
  applyNow: 'Apply',
  whatsapp: 'WhatsApp',
  maskedCall: 'Call via Orbit',
  verified: 'Verified by Orbit Support',
  frozen: 'Frozen · no reply in 7 days',
  lastReply: 'Last recruiter reply',
  womenSafe: 'Women-safe',
  cab: 'Cab provided',
  metro: 'Near metro',
  lateShift: 'Late shift',
  walkInToday: 'Walk-in today',
  commute: 'Area / commute',
  language: 'Language',
  english: 'English',
  telugu: 'Telugu',
  voiceResume: 'Voice resume',
  generateResume: 'Generated resume',
  sixField: 'Name, phone, area, last job, joining date — no PDF needed.',
  workflow: 'Post Job → Applicants → AI Insights → Review → Shortlist → Interview → Hire',
  aiMatch: 'AI match',
  subscribeMatches: 'Subscribe to AI matches',
  subscribed: 'Subscribed to matches',
  matchAlerts: 'AI job match alerts',
  whatsappAlerts: 'WhatsApp match alerts',
  whyMatch: 'Why this matched',
  outsideLocation: 'Outside location',
  aboutRole: 'About the role',
  theWork: 'The work',
  gettingThere: 'Getting there',
  payHours: 'Pay & hours',
  workplace: 'Workplace',
  howToApply: 'How to apply',
  similarRoles: 'Get alerts for similar roles',
};

const TE: typeof EN = {
  jobs: '\u0C1C\u0C3E\u0C2C\u0C4D\u0C38\u0C4D',
  walkins: '\u0C35\u0C3E\u0C15\u0C4D-\u0C07\u0C28\u0C4D',
  applied: '\u0C05\u0C2A\u0C4D\u0C32\u0C48\u0C21\u0C4D',
  profile: '\u0C2A\u0C4D\u0C30\u0C4A\u0C2B\u0C48\u0C32\u0C4D',
  apply: '\u0C30\u0C46\u0C1C\u0C4D\u0C2F\u0C42\u0C2E\u0C4D \u0C32\u0C47\u0C15\u0C41\u0C02\u0C21\u0C3E \u0C05\u0C2A\u0C4D\u0C32\u0C48',
  applyNow: '\u0C05\u0C2A\u0C4D\u0C32\u0C48',
  whatsapp: '\u0C35\u0C3E\u0C1F\u0C4D\u0C38\u0C3E\u0C2A\u0C4D',
  maskedCall: '\u0C06\u0C30\u0C4D\u0C2C\u0C3F\u0C1F\u0C4D \u0C26\u0C4D\u0C35\u0C3E\u0C30\u0C3E \u0C15\u0C3E\u0C32\u0C4D',
  verified: '\u0C06\u0C30\u0C4D\u0C2C\u0C3F\u0C1F\u0C4D \u0C38\u0C2A\u0C4B\u0C30\u0C4D\u0C1F\u0C4D \u0C27\u0C43\u0C35\u0C40\u0C15\u0C30\u0C23',
  frozen: '\u0C2B\u0C4D\u0C30\u0C40\u0C1C\u0C4D \u00B7 7 \u0C30\u0C4B\u0C1C\u0C41\u0C32\u0C41 \u0C30\u0C3F\u0C2A\u0C4D\u0C32\u0C48 \u0C32\u0C47\u0C26\u0C41',
  lastReply: '\u0C1A\u0C3F\u0C35\u0C30\u0C3F \u0C30\u0C3F\u0C15\u0C4D\u0C30\u0C42\u0C1F\u0C30\u0C4D \u0C30\u0C3F\u0C2A\u0C4D\u0C32\u0C48',
  womenSafe: '\u0C2E\u0C39\u0C3F\u0C33\u0C32\u0C15\u0C41 \u0C38\u0C47\u0C2B\u0C4D',
  cab: '\u0C15\u0C4D\u0C2F\u0C3E\u0C2C\u0C4D \u0C09\u0C02\u0C26\u0C3F',
  metro: '\u0C2E\u0C46\u0C1F\u0C4D\u0C30\u0C4B \u0C26\u0C17\u0C4D\u0C17\u0C30',
  lateShift: '\u0C32\u0C47\u0C1F\u0C4D \u0C37\u0C3F\u0C2B\u0C4D\u0C1F\u0C4D',
  walkInToday: '\u0C08 \u0C30\u0C4B\u0C1C\u0C41 \u0C35\u0C3E\u0C15\u0C4D-\u0C07\u0C28\u0C4D',
  commute: '\u0C0F\u0C30\u0C3F\u0C2F\u0C3E / \u0C15\u0C2E\u0C4D\u0C2F\u0C42\u0C1F\u0C4D',
  language: '\u0C2D\u0C3E\u0C37',
  english: 'English',
  telugu: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41',
  voiceResume: '\u0C35\u0C3E\u0C2F\u0C3F\u0C38\u0C4D \u0C30\u0C46\u0C1C\u0C4D\u0C2F\u0C42\u0C2E\u0C4D',
  generateResume: '\u0C24\u0C2F\u0C3E\u0C30\u0C48\u0C28 \u0C30\u0C46\u0C1C\u0C4D\u0C2F\u0C42\u0C2E\u0C4D',
  sixField: '\u0C2A\u0C47\u0C30\u0C41, \u0C2B\u0C4B\u0C28\u0C4D, \u0C0F\u0C30\u0C3F\u0C2F\u0C3E, \u0C17\u0C24 \u0C1C\u0C3E\u0C2C\u0C4D, \u0C1C\u0C3E\u0C2F\u0C3F\u0C28\u0C3F\u0C02\u0C17\u0C4D \u2014 PDF \u0C05\u0C35\u0C38\u0C30\u0C02 \u0C32\u0C47\u0C26\u0C41.',
  workflow: 'Post \u2192 Applicants \u2192 AI \u2192 Review \u2192 Shortlist \u2192 Interview \u2192 Hire',
  aiMatch: '\u0C0E\u0C06\u0C2F\u0C3F \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D',
  subscribeMatches: '\u0C0E\u0C06\u0C2F\u0C3F \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D\u0C32\u0C15\u0C41 \u0C38\u0C2C\u0C4D\u0C38\u0C4D\u0C15\u0C4D\u0C30\u0C48\u0C2C\u0C4D',
  subscribed: '\u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D \u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C15\u0C41 \u0C38\u0C2C\u0C4D\u0C38\u0C4D\u0C15\u0C4D\u0C30\u0C48\u0C2C\u0C4D \u0C05\u0C2F\u0C4D\u0C2F\u0C3E\u0C2F\u0C3F',
  matchAlerts: '\u0C0E\u0C06\u0C2F\u0C3F \u0C1C\u0C3E\u0C2C\u0C4D \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D \u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C41',
  whatsappAlerts: '\u0C35\u0C3E\u0C1F\u0C4D\u0C38\u0C3E\u0C2A\u0C4D \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D \u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C41',
  whyMatch: '\u0C07\u0C26\u0C3F \u0C0E\u0C32\u0C3E \u0C2E\u0C4D\u0C2F\u0C3E\u0C1A\u0C4D \u0C05\u0C2F\u0C4D\u0C2F\u0C3F\u0C02\u0C26\u0C3F',
  outsideLocation: '\u0C2C\u0C2F\u0C1F\u0C41 \u0C32\u0C4A\u0C15\u0C47\u0C37\u0C28\u0C4D',
  aboutRole: '\u0C2A\u0C3E\u0C24\u0C4D\u0C30 \u0C17\u0C41\u0C30\u0C3F\u0C02\u0C1A\u0C3F',
  theWork: '\u0C2A\u0C28\u0C3F',
  gettingThere: '\u0C0E\u0C32\u0C3E \u0C1A\u0C47\u0C30\u0C3E\u0C32\u0C3F',
  payHours: '\u0C1C\u0C40\u0C24\u0C02 \u0C2E\u0C30\u0C3F\u0C2F\u0C41 \u0C38\u0C2E\u0C2F\u0C02',
  workplace: '\u0C15\u0C3E\u0C30\u0C4D\u0C2F\u0C3E\u0C32\u0C2F\u0C02',
  howToApply: '\u0C0E\u0C32\u0C3E \u0C05\u0C2A\u0C4D\u0C32\u0C48 \u0C1A\u0C47\u0C2F\u0C3E\u0C32\u0C3F',
  similarRoles: '\u0C07\u0C32\u0C3E\u0C02\u0C1F\u0C3F \u0C2A\u0C3E\u0C24\u0C4D\u0C30\u0C32\u0C15\u0C41 \u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C41',
};

export function t(lang: Lang): typeof EN {
  return lang === 'te' ? TE : EN;
}

export async function getLang(): Promise<Lang> {
  const raw = await AsyncStorage.getItem(LANG_KEY);
  return raw === 'te' ? 'te' : 'en';
}

export async function setLang(lang: Lang): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, lang);
}
