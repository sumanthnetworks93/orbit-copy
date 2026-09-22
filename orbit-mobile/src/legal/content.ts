export const SUPPORT_EMAIL = 'support@orbit.app';
export const GRIEVANCE_EMAIL = SUPPORT_EMAIL;
export const GRIEVANCE_OFFICER = 'Grievance Officer, Orbit, Hyderabad, Telangana';

export function supportMailto(subject = 'Orbit support') {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function grievanceMailto(subject = 'Orbit grievance') {
  return `mailto:${GRIEVANCE_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export type LegalDocId = 'privacy' | 'terms' | 'termsEmployer' | 'notice';

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

const UPDATED = '16 September 2026';

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updated: UPDATED,
    sections: [
      {
        heading: 'Who we are',
        body: 'Orbit is a Telangana hiring product operated from Hyderabad. Commercial operation as a job marketplace will be carried on through an entity registered with the Ministry of Corporate Affairs (Private Limited Company, LLP, or proprietorship, as appropriate). Until incorporation is complete, this software is a preview. This policy explains how we collect, use, and share personal data when you use Orbit as a seeker, employer, or Super Admin.',
      },
      {
        heading: 'What candidate data we collect',
        body: 'When you apply or create a simple resume we may collect: name, email, 10-digit Indian mobile, area / district, last job / work history, education, skills, joining date, a short voice or text note, the job you applied to, and hiring stage. We do not ask seekers to upload a PDF resume in this version. Account name and email are held by our sign-in provider. Guest session flags, saved startups, language, AI match preferences, and employer billing records may also be stored.',
      },
      {
        heading: 'Who can see it',
        body: 'You see your own apply and resume. Employers and Super Admin see a 6-field apply with your personal mobile masked (for example 987****210), not your raw number. They do not get unrestricted access to candidate phones or documents. WhatsApp goes through an Orbit relay. We do not sell seeker data. Database records are readable by you and by Orbit staff who run hiring and trust controls.',
      },
      {
        heading: 'Where it is stored',
        body: 'When you have an account, we save customer records in our application database: your user id, name, masked phone, area, last job, joining date, voice note, generated 6-field resume, the job you applied to, and hiring stage. Guest applies stay on this device until you sign in, then they are written to the same database. Job and startup listings live in the Orbit jobs database.',
      },
      {
        heading: 'How we protect it',
        body: 'Passwords are handled by the sign-in provider, not stored in Orbit as plain text. Apply fields are length-capped and stripped of markup before save. We do not store a raw personal mobile in the database: only a masked number such as 987****210. Each application row is readable and writable only by the signed-in owner. HTTPS is used for cloud writes. Super Admin access is role-based. We log trust-and-safety actions, rate-limit public APIs where the backend is deployed, and freeze silent or reported listings.',
      },
      {
        heading: 'Digital Personal Data Protection Act',
        body: 'Orbit is designed around India\'s Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025 notified by MeitY, with phased implementation. We process personal data with your consent when you continue, apply, create a resume, or subscribe to alerts, and to run the hiring desk you asked for. You may withdraw consent, close your account, or ask for access, correction, or erasure at support@orbit.app.',
      },
      {
        heading: 'WhatsApp and calls',
        body: 'Employer numbers are masked. Messages go through an Orbit relay so recruiters do not receive your personal number by default. You can turn off WhatsApp match alerts in Profile.',
      },
      {
        heading: 'Payments',
        body: 'Employers get two job posts free each calendar month. Extra posts are ₹25. Memberships are billed in-app as a mock until a payment provider is connected. We do not store card numbers in this version. Platform fees will be invoiced by the registered Orbit entity; GST treatment depends on how the marketplace is structured and must be confirmed with a chartered accountant. CBIC e-commerce operator rules may apply.',
      },
      {
        heading: 'Retention and your rights',
        body: 'Signed-in customer records stay until you close your account or ask us to delete them. Profile → Close account clears seeker data on this device and ends the session. Email support@orbit.app for access, correction, erasure, or a grievance. Grievance Officer: Orbit, Hyderabad, Telangana, support@orbit.app.',
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Use',
    updated: UPDATED,
    sections: [
      {
        heading: 'These terms apply to job seekers',
        body: 'If you browse jobs, apply, create a resume, or continue as a guest, these seeker terms apply. Employers and recruiters must also read Terms for employers. By continuing you agree to both the Privacy Policy and these terms.',
      },
      {
        heading: 'The service',
        body: 'Orbit lists Telangana jobs and walk-ins and lets seekers apply without a PDF. AI match scores are decision-support only. Orbit does not guarantee a hire. Walk-in dates and salaries are provided by employers.',
      },
      {
        heading: 'Your data and consent',
        body: 'Applying shares your name, area, work history, education/skills if you add them, and a masked phone with that employer. Your personal mobile is not given out. You must confirm this consent on the apply sheet. You can close your account from Profile.',
      },
      {
        heading: 'Accounts',
        body: 'Seekers may continue as a guest. You are responsible for the accuracy of applications and voice notes you submit. We may suspend accounts that harass recruiters, submit fake details, or abuse the relay.',
      },
      {
        heading: 'Complaints',
        body: 'Use Report job or Report employer on a listing, or email support@orbit.app. We review reports, may freeze or hide a listing, and may suspend the poster.',
      },
      {
        heading: 'Liability and venue',
        body: 'The service is provided as available. Hyderabad, Telangana, India is the governing venue for disputes. Consumer-protection rules prohibit misleading practices and dark patterns; tell us if a listing is misleading.',
      },
    ],
  },
  termsEmployer: {
    id: 'termsEmployer',
    title: 'Terms for employers',
    updated: UPDATED,
    sections: [
      {
        heading: 'These terms apply to employers and recruiters',
        body: 'If you post jobs, review applicants, or buy extra posts or a membership, these employer terms apply together with the Privacy Policy.',
      },
      {
        heading: 'Verification',
        body: 'Orbit verifies recruiters before they can post freely. Unverified employers stay in review. When Super Admin verifies an employer or listing, seekers see a Verified by Orbit Support tag. Super Admin may require documents, freeze, hide, or reject a listing. Fake placement agencies are not allowed.',
      },
      {
        heading: 'No fees from candidates',
        body: 'You must not ask candidates to pay for registration, equipment, training, security deposit, interview fees, or similar as a condition of applying or being hired, unless you have a legitimate, carefully controlled model that Orbit has approved in writing. Default: such listings are blocked.',
      },
      {
        heading: 'Honest listings',
        body: 'Salary or stipend, location, role title, employer identity, internship duration, and whether a role is paid or unpaid must not be intentionally misleading. Consumer-protection rules and rules on misleading advertisements apply. Ghost jobs may freeze after seven days with no recruiter reply.',
      },
      {
        heading: 'Candidate contact',
        body: 'You see a masked phone and the Orbit WhatsApp relay. Do not scrape, demand, or store personal mobiles outside the product. Do not reject a person based only on an AI match score.',
      },
      {
        heading: 'Payments, invoices, and GST',
        body: 'Two live jobs each month are included on Free. Every extra job is ₹25 unless a membership covers it. When payments go live, Orbit will issue invoices from the registered entity. GST treatment depends on the exact marketplace model; a chartered accountant must confirm it. CBIC has specific provisions for electronic-commerce operators.',
      },
      {
        heading: 'Statutory employer duties',
        body: 'Posting a vacancy on Orbit does not replace any statutory employer obligation, including vacancy notification under the Employment Exchanges (Compulsory Notification of Vacancies) Act, 1959 where it applies, or other employment-law duties handled by the Centre or States/UTs.',
      },
      {
        heading: 'Suspension',
        body: 'We may suspend accounts that post fake or paid-to-apply jobs, mislead candidates, or bypass the relay. Report channels and support@orbit.app are the grievance path.',
      },
    ],
  },
  notice: {
    id: 'notice',
    title: 'Privacy Notice',
    updated: UPDATED,
    sections: [
      {
        heading: 'Short notice',
        body: 'Orbit processes your name, email, area, last job, education/skills if you add them, joining date, and a relay phone so we can match Telangana jobs and let you apply. When you apply while signed in, those fields are saved in our customer database with your personal mobile masked. Legal basis: your consent when you continue, apply, or subscribe to alerts, and our need to run the hiring desk. Designed for the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.',
      },
      {
        heading: 'Sharing',
        body: 'Employers do not get unrestricted access to your phone or resume. They see the 6-field apply and a masked number. Super Admin can verify, suspend, or freeze listings. Verified listings show Verified by Orbit Support. We do not sell seeker data.',
      },
      {
        heading: 'Your controls',
        body: 'AI job-match notifications are off until you subscribe. You can unsubscribe from the job, the matches sheet, or Profile. You can close your account from Profile. You can report a job or employer from the listing.',
      },
      {
        heading: 'Contact',
        body: 'Data queries and grievances: support@orbit.app. Grievance Officer, Orbit, Hyderabad, Telangana. If we appoint a Data Protection Officer, that address will be updated here.',
      },
    ],
  },
};

export function getLegalDoc(id: LegalDocId): LegalDoc {
  return LEGAL_DOCS[id];
}
