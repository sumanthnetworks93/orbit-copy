import { Alert } from 'react-native';
import { LegalSupportBlock } from '../../components/LegalSheet';
import { useAuth } from '../../context/AuthContext';
import { getAdminProfiles, verifiedAdminProfiles } from '../../services/adminModeration';
import { useEffect, useState } from 'react';
import { signOutUser } from '../../services/auth';
import { CardMeta, CardTitle, DeskButton, DeskScreen, PageHeader, StatusPill, Surface, ActionRow } from '../../ui';

export function EmployerCompanyScreen() {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    void getAdminProfiles().then((profiles) => {
      const ok = verifiedAdminProfiles(profiles).some(
        (profile) => profile.email === user?.email || profile.company === user?.company,
      );
      setVerified(ok);
    });
  }, [user?.company, user?.email]);

  async function signOut() {
    try {
      await signOutUser();
    } catch (error) {
      Alert.alert('Sign out', error instanceof Error ? error.message : 'Could not sign out.');
    }
  }

  return (
    <DeskScreen testID="employer-profile-screen">
      <PageHeader kicker="Company" title={user?.company ?? 'Employer'} subtitle={`${user?.name ?? ''} · ${user?.email ?? ''}`} />
      <Surface>
        <StatusPill tone={verified ? 'verified' : 'pending'} label={verified ? 'Verified by Orbit Support' : 'In review'} />
        <CardTitle>{user?.company ?? 'Employer'}</CardTitle>
        <CardMeta>Hyderabad hiring desk. Ghost jobs auto-freeze if you do not reply in 7 days. Candidate phones stay masked.</CardMeta>
      </Surface>
      <LegalSupportBlock />
      <ActionRow>
        <DeskButton testID="employer-sign-out" label="Sign out" variant="ghost" onPress={() => void signOut()} />
      </ActionRow>
    </DeskScreen>
  );
}
