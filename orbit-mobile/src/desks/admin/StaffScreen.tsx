import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LegalSupportBlock } from '../../components/LegalSheet';
import { useAuth } from '../../context/AuthContext';
import {
  PLATFORM_CONTROL_FIELDS,
  getPlatformControls,
  setPlatformControl,
  type PlatformControlKey,
  type PlatformControls,
} from '../../services/adminControl';
import { MEMBERSHIP_PLANS, rupees } from '../../services/employerBilling';
import { fetchAlertSettings, fetchLoginAlerts, saveAlertSettings, type AlertSettings, type LoginAlertEvent } from '../../services/api';
import { signOutUser } from '../../services/auth';
import {
  ActionRow,
  CardMeta,
  CardNote,
  CardTitle,
  DeskButton,
  DeskScreen,
  EmptyState,
  Field,
  PageHeader,
  Section,
  Surface,
  ToggleRow,
} from '../../ui';

export function StaffScreen() {
  const { user } = useAuth();
  const [controls, setControls] = useState<PlatformControls | null>(null);
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [adminEmail, setAdminEmail] = useState('support@orbit.app');
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);
  const [loginEvents, setLoginEvents] = useState<LoginAlertEvent[]>([]);
  const [savingAlerts, setSavingAlerts] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        getPlatformControls(),
        fetchAlertSettings().catch(() => null),
        fetchLoginAlerts().catch(() => []),
      ]).then(([nextControls, settings, events]) => {
        setControls(nextControls);
        if (settings) {
          setAlertSettings(settings);
          setDiscordWebhook(settings.discordWebhookUrl);
          setAdminEmail(settings.adminEmail || 'support@orbit.app');
        }
        setLoginEvents(events);
      });
    }, []),
  );

  async function saveLoginAlerts() {
    try {
      setSavingAlerts(true);
      const next = await saveAlertSettings({
        discordWebhookUrl: discordWebhook.trim(),
        adminEmail: adminEmail.trim(),
      });
      setAlertSettings(next);
      setDiscordWebhook(next.discordWebhookUrl);
      Alert.alert('Login alerts', 'Discord and email destinations saved.');
    } catch (error) {
      Alert.alert('Login alerts', error instanceof Error ? error.message : 'Could not save alert settings.');
    } finally {
      setSavingAlerts(false);
    }
  }

  async function toggle(key: PlatformControlKey, value: boolean) {
    setControls(await setPlatformControl(key, value));
  }

  async function signOut() {
    try {
      await signOutUser();
    } catch (error) {
      Alert.alert('Sign out', error instanceof Error ? error.message : 'Could not sign out.');
    }
  }

  return (
    <DeskScreen testID="admin-profile-screen">
      <PageHeader kicker="Staff" title={user?.name ?? 'Super Admin'} subtitle={user?.email ?? undefined} />
      <Surface>
        <CardTitle>Super Admin · Orbit Control</CardTitle>
        <CardMeta>Verify people, freeze jobs, and route login alerts.</CardMeta>
      </Surface>

      <Section title="Login alerts" hint="Paste a Discord webhook so Super Admin gets a ping on every sign-in.">
        <Field
          label="Discord webhook"
          testID="admin-discord-webhook"
          value={discordWebhook}
          onChange={setDiscordWebhook}
          autoCapitalize="none"
          placeholder="https://discord.com/api/webhooks/…"
          helper="Discord → Server Settings → Integrations → Webhooks → Copy Webhook URL"
        />
        <Field
          label="Admin email"
          testID="admin-alert-email"
          value={adminEmail}
          onChange={setAdminEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="admin@orbit.app"
          helper={
            alertSettings?.discordReady
              ? 'Discord is connected. Email alerts send when SMTP is set.'
              : 'Discord is waiting for a webhook. Logins still appear below.'
          }
        />
        <ActionRow>
          <DeskButton
            testID="admin-save-alerts"
            label={savingAlerts ? 'Saving…' : 'Save Discord and email'}
            variant="lilac"
            onPress={() => void saveLoginAlerts()}
          />
        </ActionRow>
        {loginEvents.length === 0 ? <EmptyState text="No logins reported yet." /> : null}
        {loginEvents.map((event) => (
          <Surface key={event.id} testID={`admin-login-${event.id}`}>
            <CardTitle>{event.name || event.email || event.userId}</CardTitle>
            <CardMeta>{`${event.email || 'no email'} · ${event.role} · ${event.method}`}</CardMeta>
            <CardNote>{`Discord ${event.discordStatus} · Email ${event.emailStatus}`}</CardNote>
          </Surface>
        ))}
      </Section>

      <Section title="Platform">
        {controls
          ? PLATFORM_CONTROL_FIELDS.filter(
              (field) => field.key !== 'guestApply' && field.key !== 'maintenance',
            ).map((field) => (
              <ToggleRow
                key={field.key}
                testID={`admin-control-${field.key}`}
                label={field.label}
                helper={field.helper}
                on={controls[field.key]}
                onPress={() => void toggle(field.key, !controls[field.key])}
              />
            ))
          : null}
      </Section>

      <Section title="Hiring plans" hint="Employers get 2 jobs free each month. Extra posts are ₹25.">
        {MEMBERSHIP_PLANS.map((plan) => (
          <Surface key={plan.id} testID={`admin-plan-${plan.id}`}>
            <CardTitle>{plan.name}</CardTitle>
            <CardMeta>
              {`${plan.priceInr === 0 ? '₹0 / month' : `${rupees(plan.priceInr)} / month`} · ${plan.jobsPerMonth} included · extras ${rupees(plan.extraJobInr)}`}
            </CardMeta>
          </Surface>
        ))}
      </Section>

      <LegalSupportBlock />
      <ActionRow>
        <DeskButton testID="admin-sign-out" label="Sign out" variant="ghost" onPress={() => void signOut()} />
      </ActionRow>
    </DeskScreen>
  );
}
