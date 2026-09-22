import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getApplications, markEmployerReply, setApplicationStage, type EasyApply } from '../../hyd/applications';
import { forEmployerView } from '../../hyd/customerSecurity';
import { maskPhone, whatsappUrl } from '../../hyd/whatsapp';
import { getEmployerApplicants } from '../../services/employerJobs';
import {
  ActionRow,
  CardMeta,
  CardNote,
  CardTitle,
  DeskButton,
  DeskScreen,
  EmptyState,
  PageHeader,
  Surface,
} from '../../ui';

type Row = {
  id: string;
  name: string;
  role: string;
  note: string;
  appliedAt: string;
  jobId: number;
  phone?: string;
  fromApply?: boolean;
};

export function EmployerApplicantsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useFocusEffect(
    useCallback(() => {
      void getApplications()
        .then((apps) => {
          const secured = apps.map(forEmployerView);
          const fromApply: Row[] = secured.map((item: EasyApply) => ({
            id: item.id,
            name: item.name,
            role: item.jobTitle,
            note: `${item.area} · last job ${item.lastJob}`,
            appliedAt: 'Just now',
            jobId: item.jobId,
            phone: item.phone,
            fromApply: true,
          }));
          const seed = getEmployerApplicants().map((item) => ({
            id: item.id,
            name: item.name,
            role: item.role,
            note: item.note,
            appliedAt: item.appliedAt,
            jobId: item.jobId,
          }));
          const ids = new Set(fromApply.map((item) => item.id));
          setRows([...fromApply, ...seed.filter((item) => !ids.has(item.id))]);
        })
        .catch(() => setRows(getEmployerApplicants()));
    }, []),
  );

  async function message(row: Row) {
    const url = whatsappUrl(row.role, user?.company ?? 'Helios Health', row.name);
    await markEmployerReply(row.jobId);
    const opened = await Linking.canOpenURL(url);
    if (opened) await Linking.openURL(url);
  }

  return (
    <DeskScreen testID="employer-applicants-screen">
      <PageHeader
        kicker="Inbox"
        title="Applicants"
        subtitle="Today’s 6-field applies, tied to the job they applied for. Phones stay masked."
      />
      {rows.length === 0 ? <EmptyState text="No applicants yet. Live jobs collect applies from the seeker feed." /> : null}
      {rows.map((row) => (
        <Surface key={row.id} testID={`employer-applicant-${row.id}`}>
          <CardTitle>{row.name}</CardTitle>
          <CardMeta>{`${row.role} · ${row.appliedAt}`}</CardMeta>
          <CardNote>{row.note}</CardNote>
          {row.phone ? <CardMeta>{maskPhone(row.phone)}</CardMeta> : null}
          <ActionRow>
            {row.fromApply ? (
              <DeskButton
                label="Shortlist"
                variant="lilac"
                onPress={() => void setApplicationStage(row.id, 'Shortlisted')}
              />
            ) : null}
            <DeskButton label="WhatsApp" variant="ghost" onPress={() => void message(row)} />
          </ActionRow>
        </Surface>
      ))}
    </DeskScreen>
  );
}
