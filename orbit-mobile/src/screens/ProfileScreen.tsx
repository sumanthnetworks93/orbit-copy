import { useCallback, useState } from 'react';

import {

  Alert,

  Modal,

  Pressable,

  ScrollView,

  StyleSheet,

  Switch,

  Text,

  TextInput,

  View,

} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { MaterialIcons } from '@expo/vector-icons';

import { OrbitBackground } from '../components/OrbitBackground';

import { useAuth } from '../context/AuthContext';

import type { MainTabParamList } from '../navigation/types';

import { getProfileStats, type ProfileStats } from '../services/profileActivity';

import {

  getDisplayName,

  getNotificationsEnabled,

  setDisplayName,

  setNotificationsEnabled,

} from '../services/profileStorage';
import { getMatchPrefs, patchMatchPrefs, subscribeToJobMatches, unsubscribeFromJobMatches, type MatchPrefs } from '../services/jobAlerts';

import { getSavedStartups } from '../services/savedStartups';

import { ClerkUserButton } from '../components/ClerkUserButton';
import { LegalSheet } from '../components/LegalSheet';
import { openSupportEmail, SupportButton } from '../components/SupportButton';
import { useLanguage } from '../hyd/LanguageContext';
import type { LegalDocId } from '../legal/content';
import { parseVoiceResume } from '../hyd/voice';
import { closeSeekerAccount } from '../services/accountDeletion';
import { signOutUser } from '../services/auth';
import {
  EMPTY_RESUME_DRAFT,
  getSavedResume,
  previewSimpleResume,
  saveSimpleResume,
  type SimpleResumeDraft,
} from '../services/simpleResume';

import type { Startup } from '../types';

import { colors } from '../theme/colors';

import { fonts } from '../theme/typography';



const MENU_ITEMS = [

  { key: 'edit', label: 'Edit profile' },

  { key: 'resume', label: 'Create resume' },

  { key: 'saved', label: 'Saved startups' },

  { key: 'notifications', label: 'Notifications' },

  { key: 'privacy', label: 'Privacy Policy' },

  { key: 'terms', label: 'Terms for job seekers' },

  { key: 'termsEmployer', label: 'Terms for employers' },

  { key: 'notice', label: 'Privacy Notice' },

  { key: 'help', label: 'Support / grievance' },

] as const;



const EMPTY_STATS: ProfileStats = { applied: 0, posted: 0, upvoted: 0 };



function StatCard({

  value,

  label,

  emoji,

}: {

  value: number;

  label: string;

  emoji?: string;

}) {

  return (

    <View style={styles.statCard}>

      {emoji ? <Text style={styles.statEmoji}>{emoji}</Text> : null}

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statLabel}>{label}</Text>

    </View>

  );

}



function MenuRow({

  label,

  onPress,

  isLast,

  testID,

}: {

  label: string;

  onPress: () => void;

  isLast?: boolean;

  testID?: string;

}) {

  return (

    <Pressable

      testID={testID}

      style={({ pressed }) => [styles.menuRow, !isLast && styles.menuRowBorder, pressed && styles.pressed]}

      onPress={onPress}

    >

      <Text style={styles.menuLabel}>{label}</Text>

      <MaterialIcons name="chevron-right" size={18} color={colors.label} />

    </Pressable>

  );

}



export function ProfileScreen() {

  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Profile'>>();

  const { user } = useAuth();
  const { lang, copy, setLang } = useLanguage();
  const [voiceDraft, setVoiceDraft] = useState('');

  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);

  const [profileName, setProfileName] = useState('Alex Rivera');

  const [editOpen, setEditOpen] = useState(false);

  const [editDraft, setEditDraft] = useState('');

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [matchPrefs, setMatchPrefs] = useState<MatchPrefs | null>(null);

  const [savedOpen, setSavedOpen] = useState(false);

  const [savedStartups, setSavedStartups] = useState<Startup[]>([]);
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<SimpleResumeDraft>(EMPTY_RESUME_DRAFT);
  const [resumeText, setResumeText] = useState('');
  const [resumeError, setResumeError] = useState<string | null>(null);



  useFocusEffect(

    useCallback(() => {

      let active = true;



      Promise.all([getProfileStats(), getDisplayName(), getNotificationsEnabled(), getSavedStartups(), getMatchPrefs()])

        .then(([nextStats, storedName, notifications, saved, matches]) => {

          if (!active) return;

          setStats(nextStats);

          setProfileName(storedName?.trim() || user?.displayName?.trim() || 'Alex Rivera');

          setNotificationsEnabledState(notifications);

          setSavedStartups(saved);
          setMatchPrefs(matches);

        })

        .catch(() => undefined);



      return () => {

        active = false;

      };

    }, [user?.displayName]),

  );



  async function handleSignOut() {

    try {

      await signOutUser();

    } catch (error) {

      const message = error instanceof Error ? error.message : 'Sign out failed.';

      Alert.alert('Sign out', message);

    }

  }

  async function handleCloseAccount() {
    try {
      await closeSeekerAccount();
      setDeleteOpen(false);
    } catch (error) {
      Alert.alert('Close account', error instanceof Error ? error.message : 'Could not close this account.');
    }
  }



  function openEditProfile() {

    setEditDraft(profileName);

    setEditOpen(true);

  }



  async function saveProfile() {

    const nextName = editDraft.trim() || 'Alex Rivera';

    await setDisplayName(nextName);

    setProfileName(nextName);

    setEditOpen(false);

  }



  async function saveNotifications(enabled: boolean) {

    setNotificationsEnabledState(enabled);

    await setNotificationsEnabled(enabled);

  }



  function openSavedStartups() {

    void getSavedStartups().then(setSavedStartups);

    setSavedOpen(true);

  }



  function browseStartups() {

    setSavedOpen(false);

    navigation.navigate('Home', {

      screen: 'Feed',

      params: { mode: 'startups' },

    });

  }

  async function openResume() {
    const saved = await getSavedResume();
    setResumeDraft(saved ? {
      name: saved.name,
      phone: saved.phone,
      area: saved.area,
      lastJob: saved.lastJob,
      joinWhen: saved.joinWhen,
      education: saved.education,
      skills: saved.skills,
    } : { ...EMPTY_RESUME_DRAFT, name: profileName });
    setResumeText(saved?.text ?? '');
    setResumeError(null);
    setResumeOpen(true);
  }

  function patchResume(patch: Partial<SimpleResumeDraft>) {
    setResumeDraft((current) => {
      const next = { ...current, ...patch };
      setResumeText(previewSimpleResume(next));
      return next;
    });
    setResumeError(null);
  }

  async function handleSaveResume() {
    try {
      const saved = await saveSimpleResume(resumeDraft);
      setResumeDraft({
        name: saved.name,
        phone: saved.phone,
        area: saved.area,
        lastJob: saved.lastJob,
        joinWhen: saved.joinWhen,
        education: saved.education,
        skills: saved.skills,
      });
      setResumeText(saved.text);
      setResumeError(null);
      await patchMatchPrefs({ role: saved.lastJob, area: saved.area }).then(setMatchPrefs);
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Could not save resume.');
    }
  }



  async function openHelp() {
    await openSupportEmail();
  }

  function handleMenuPress(key: (typeof MENU_ITEMS)[number]['key']) {
    if (key === 'edit') {
      openEditProfile();
      return;
    }
    if (key === 'resume') {
      void openResume();
      return;
    }
    if (key === 'saved') {
      openSavedStartups();
      return;
    }
    if (key === 'notifications') {
      setNotificationsOpen(true);
      return;
    }
    if (key === 'privacy' || key === 'terms' || key === 'termsEmployer' || key === 'notice') {
      setLegalDoc(key);
      return;
    }
    void openHelp();
  }



  const subtitle = 'Product engineer · San Francisco';



  return (

    <View style={styles.root}>

      <OrbitBackground theme="emoji" />

      <SafeAreaView style={styles.safe} edges={['top']}>

        <ScrollView

          contentContainerStyle={styles.scroll}

          showsVerticalScrollIndicator={false}

          keyboardShouldPersistTaps="handled"

        >

          <View style={styles.header}>

            <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>

            <Text style={styles.title}>Profile</Text>

          </View>



          <View style={styles.profile}>

            <ClerkUserButton />

            <View style={styles.avatar}>

              <Text style={styles.avatarText}>{profileName.charAt(0).toUpperCase()}</Text>

            </View>

            <Text style={styles.name}>{profileName}</Text>

            <Text style={styles.subtitle}>{subtitle}</Text>

          </View>



          <View style={styles.statsRow}>

            <StatCard value={stats.applied} label="APPLIED" emoji="💡" />

            <StatCard value={stats.posted} label="POSTED" />

            <StatCard value={stats.upvoted} label="UPVOTED" emoji="🌱" />

          </View>



          <Text style={styles.sectionLabel}>LANGUAGE</Text>
          <View style={styles.langRow}>
            <Pressable
              testID="lang-en"
              onPress={() => setLang('en')}
              style={[styles.langChip, lang === 'en' && styles.langChipOn]}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextOn]}>{copy.english}</Text>
            </Pressable>
            <Pressable
              testID="lang-te"
              onPress={() => setLang('te')}
              style={[styles.langChip, lang === 'te' && styles.langChipOn]}
            >
              <Text style={[styles.langText, lang === 'te' && styles.langTextOn]}>{copy.telugu}</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>{copy.voiceResume}</Text>
          <TextInput
            testID="voice-resume-input"
            value={voiceDraft}
            onChangeText={setVoiceDraft}
            placeholder="I am Ravi driver from HITEC I can join tomorrow"
            placeholderTextColor={colors.label}
            style={styles.voiceInput}
          />
          <Pressable
            testID="voice-resume-save"
            onPress={() => {
              const parsed = parseVoiceResume(voiceDraft || 'I am Ravi driver from HITEC I can join tomorrow');
              setVoiceDraft(
                `${parsed.name}\n${parsed.lastJob}\n${parsed.area}\n${parsed.joinWhen}\n\n${copy.generateResume}`,
              );
              void patchMatchPrefs({ role: parsed.lastJob, area: parsed.area }).then(setMatchPrefs);
            }}
            style={styles.signOut}
          >
            <Text style={styles.signOutText}>{copy.generateResume}</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <View style={styles.menu}>

            {MENU_ITEMS.map((item, index) => (

              <MenuRow
                key={item.key}
                testID={`profile-menu-${item.key}`}
                label={item.label}
                onPress={() => handleMenuPress(item.key)}
                isLast={index === MENU_ITEMS.length - 1}
              />

            ))}

          </View>



          <View style={styles.supportWrap}>
            <SupportButton />
          </View>

          <Pressable
            testID="sign-out"
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
            onPress={handleSignOut}
          >

            <Text style={styles.signOutText}>Sign out</Text>

          </Pressable>
          <Pressable
            testID="close-account"
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
            onPress={() => setDeleteOpen(true)}
          >
            <Text style={styles.signOutText}>Close account</Text>
          </Pressable>

        </ScrollView>

      </SafeAreaView>



      <Modal visible={editOpen} animationType="slide" transparent onRequestClose={() => setEditOpen(false)}>

        <Pressable style={styles.modalBackdrop} onPress={() => setEditOpen(false)} />

        <View style={styles.modalSheet}>

          <Text style={styles.modalTitle}>Edit profile</Text>

          <TextInput

            value={editDraft}

            onChangeText={setEditDraft}

            placeholder="Your name"

            placeholderTextColor={colors.label}

            style={styles.modalInput}

          />

          <Pressable style={styles.modalPrimary} onPress={() => void saveProfile()}>

            <Text style={styles.modalPrimaryText}>Save</Text>

          </Pressable>

        </View>

      </Modal>

      <Modal visible={resumeOpen} animationType="slide" transparent onRequestClose={() => setResumeOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setResumeOpen(false)} />
        <View style={styles.modalSheet} testID="resume-sheet">
          <Text style={styles.modalTitle}>Create resume</Text>
          <Text style={styles.modalCopy}>A simple 6-field resume. No PDF needed.</Text>
          <ScrollView style={styles.savedList} keyboardShouldPersistTaps="handled">
            <TextInput
              testID="resume-name"
              value={resumeDraft.name}
              onChangeText={(name) => patchResume({ name })}
              placeholder="Name"
              placeholderTextColor={colors.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="resume-phone"
              value={resumeDraft.phone}
              onChangeText={(phone) => patchResume({ phone: phone.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit mobile"
              placeholderTextColor={colors.label}
              keyboardType="phone-pad"
              style={styles.modalInput}
            />
            <TextInput
              testID="resume-area"
              value={resumeDraft.area}
              onChangeText={(area) => patchResume({ area })}
              placeholder="Area or district"
              placeholderTextColor={colors.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="resume-last-job"
              value={resumeDraft.lastJob}
              onChangeText={(lastJob) => patchResume({ lastJob })}
              placeholder="Last job"
              placeholderTextColor={colors.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="resume-education"
              value={resumeDraft.education}
              onChangeText={(education) => patchResume({ education })}
              placeholder="Education (optional)"
              placeholderTextColor={colors.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="resume-skills"
              value={resumeDraft.skills}
              onChangeText={(skills) => patchResume({ skills })}
              placeholder="Skills (optional)"
              placeholderTextColor={colors.label}
              style={styles.modalInput}
            />
            <TextInput
              testID="resume-join"
              value={resumeDraft.joinWhen}
              onChangeText={(joinWhen) => patchResume({ joinWhen })}
              placeholder="When can you join"
              placeholderTextColor={colors.label}
              style={styles.modalInput}
            />
            {resumeText ? (
              <Text testID="resume-preview" style={styles.resumePreview}>{resumeText}</Text>
            ) : null}
            {resumeError ? <Text style={styles.resumeError}>{resumeError}</Text> : null}
          </ScrollView>
          <Pressable testID="resume-save" style={styles.modalPrimary} onPress={() => void handleSaveResume()}>
            <Text style={styles.modalPrimaryText}>Save resume</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal

        visible={notificationsOpen}

        animationType="slide"

        transparent

        onRequestClose={() => setNotificationsOpen(false)}

      >

        <Pressable style={styles.modalBackdrop} onPress={() => setNotificationsOpen(false)} />

        <View style={styles.modalSheet}>

          <Text style={styles.modalTitle}>Notifications</Text>

          <View style={styles.toggleRow}>

            <Text style={styles.toggleLabel}>Job alerts</Text>

            <Switch

              value={notificationsEnabled}

              onValueChange={(value) => void saveNotifications(value)}

              trackColor={{ false: colors.border, true: colors.black }}

              thumbColor={colors.white}

            />

          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{copy.matchAlerts}</Text>
            <Switch
              testID="alerts-subscribe"
              value={Boolean(matchPrefs?.subscribed)}
              onValueChange={(value) =>
                void (value ? subscribeToJobMatches() : unsubscribeFromJobMatches()).then(setMatchPrefs)
              }
              trackColor={{ false: colors.border, true: colors.black }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{copy.whatsappAlerts}</Text>
            <Switch
              testID="alerts-whatsapp"
              value={matchPrefs?.whatsapp !== false}
              onValueChange={(value) => void patchMatchPrefs({ whatsapp: value }).then(setMatchPrefs)}
              trackColor={{ false: colors.border, true: colors.black }}
              thumbColor={colors.white}
            />
          </View>

          <Pressable style={styles.modalPrimary} onPress={() => setNotificationsOpen(false)}>

            <Text style={styles.modalPrimaryText}>Done</Text>

          </Pressable>

        </View>

      </Modal>



      <Modal visible={savedOpen} animationType="slide" transparent onRequestClose={() => setSavedOpen(false)}>

        <Pressable style={styles.modalBackdrop} onPress={() => setSavedOpen(false)} />

        <View style={styles.modalSheet}>

          <Text style={styles.modalTitle}>Saved startups</Text>

          {savedStartups.length === 0 ? (

            <Text style={styles.modalCopy}>

              Bookmark startups from the feed to see them here.

            </Text>

          ) : (

            <ScrollView style={styles.savedList} showsVerticalScrollIndicator={false}>

              {savedStartups.map((startup) => (

                <View key={startup.id} style={styles.savedRow}>

                  <Text style={styles.savedName}>{startup.name}</Text>

                  <Text style={styles.savedMeta}>{startup.category}</Text>

                </View>

              ))}

            </ScrollView>

          )}

          <Pressable style={styles.modalPrimary} onPress={browseStartups}>

            <Text style={styles.modalPrimaryText}>Browse startups</Text>

          </Pressable>

        </View>

      </Modal>

      {deleteOpen ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setDeleteOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDeleteOpen(false)} />
          <View style={styles.modalSheet} testID="close-account-sheet">
            <Text style={styles.modalTitle}>Close account</Text>
            <Text style={styles.modalCopy}>
              This clears your resume, applications, match alerts, and saved items on this device, then signs you out. Email support@orbit.app if you need remaining personal data erased from Orbit systems.
            </Text>
            <Pressable testID="close-account-confirm" onPress={() => void handleCloseAccount()} style={styles.modalPrimary}>
              <Text style={styles.modalPrimaryText}>Close my account</Text>
            </Pressable>
            <Pressable testID="close-account-cancel" onPress={() => setDeleteOpen(false)} style={styles.signOut}>
              <Text style={styles.signOutText}>Keep account</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}

      <LegalSheet docId={legalDoc} onClose={() => setLegalDoc(null)} />

    </View>

  );

}



const styles = StyleSheet.create({

  root: {

    flex: 1,

    backgroundColor: colors.white,

  },

  safe: {

    flex: 1,

  },

  scroll: {

    paddingHorizontal: 24,

    paddingBottom: 32,

  },

  header: {

    paddingTop: 8,

    paddingBottom: 28,

  },

  eyebrow: {

    fontFamily: fonts.semiBold,

    fontSize: 11,

    letterSpacing: 1.8,

    color: colors.label,

    marginBottom: 8,

  },

  title: {

    fontFamily: fonts.display,

    fontSize: 42,

    letterSpacing: -1.1,

    color: colors.ink,

    lineHeight: 46,

  },

  profile: {

    alignItems: 'center',

    marginBottom: 28,

  },

  avatar: {

    width: 88,

    height: 88,

    borderRadius: 44,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: colors.ink,

    marginBottom: 16,

  },

  avatarText: {

    fontFamily: fonts.semiBold,

    fontSize: 34,

    color: colors.white,

  },

  name: {

    fontFamily: fonts.semiBold,

    fontSize: 22,

    letterSpacing: -0.3,

    color: colors.ink,

    marginBottom: 6,

  },

  subtitle: {

    fontFamily: fonts.regular,

    fontSize: 15,

    color: colors.muted,

    textAlign: 'center',

  },

  statsRow: {

    flexDirection: 'row',

    gap: 10,

    marginBottom: 32,

  },

  statCard: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    minHeight: 92,

    borderRadius: 16,

    backgroundColor: colors.white,

    borderWidth: 1,

    borderColor: colors.border,

    overflow: 'hidden',

    shadowColor: colors.ink,

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.06,

    shadowRadius: 12,

    elevation: 2,

  },

  statEmoji: {

    position: 'absolute',

    top: 8,

    right: 10,

    fontSize: 18,

    opacity: 0.18,

  },

  statValue: {

    fontFamily: fonts.semiBold,

    fontSize: 28,

    letterSpacing: -0.5,

    color: colors.ink,

    marginBottom: 4,

  },

  statLabel: {

    fontFamily: fonts.semiBold,

    fontSize: 10,

    letterSpacing: 1.4,

    color: colors.label,

  },

  sectionLabel: {

    fontFamily: fonts.semiBold,

    fontSize: 11,

    letterSpacing: 1.8,

    color: colors.label,

    marginBottom: 8,

  },

  menu: {

    borderTopWidth: StyleSheet.hairlineWidth,

    borderTopColor: colors.border,

    marginBottom: 28,

  },

  menuRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingVertical: 18,

  },

  menuRowBorder: {

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: colors.border,

  },

  menuLabel: {

    fontFamily: fonts.medium,

    fontSize: 16,

    color: colors.ink,

  },

  signOut: {

    alignSelf: 'stretch',

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 16,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: colors.border,

    backgroundColor: colors.white,

  },

  signOutText: {

    fontFamily: fonts.semiBold,

    fontSize: 16,

    color: colors.ink,

  },

  supportWrap: {

    marginTop: 16,

    marginBottom: 8,

  },

  pressed: {

    opacity: 0.88,

  },

  modalBackdrop: {

    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(22, 20, 15, 0.28)',

  },

  modalSheet: {

    marginTop: 'auto',

    borderTopLeftRadius: 24,

    borderTopRightRadius: 24,

    backgroundColor: colors.white,

    paddingHorizontal: 24,

    paddingTop: 24,

    paddingBottom: 32,

    gap: 16,

  },

  modalTitle: {

    fontFamily: fonts.semiBold,

    fontSize: 20,

    color: colors.ink,

  },

  modalInput: {

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: 14,

    paddingHorizontal: 14,

    paddingVertical: 12,

    marginBottom: 10,

    fontFamily: fonts.regular,

    fontSize: 16,

    color: colors.ink,

  },

  modalCopy: {

    fontFamily: fonts.regular,

    fontSize: 15,

    lineHeight: 22,

    color: colors.muted,

  },
  resumePreview: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
    marginTop: 8,
  },
  resumeError: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
    marginTop: 8,
  },

  toggleRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

  },

  toggleLabel: {

    fontFamily: fonts.medium,

    fontSize: 16,

    color: colors.ink,

  },

  savedList: {

    maxHeight: 220,

  },

  savedRow: {

    paddingVertical: 12,

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: colors.border,

  },

  savedName: {

    fontFamily: fonts.semiBold,

    fontSize: 16,

    color: colors.ink,

  },

  savedMeta: {

    fontFamily: fonts.regular,

    fontSize: 14,

    color: colors.muted,

    marginTop: 2,

  },

  modalPrimary: {

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 999,

    backgroundColor: colors.black,

    paddingVertical: 14,

  },

  modalPrimaryText: {

    fontFamily: fonts.medium,

    fontSize: 15,

    color: colors.white,

  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  langChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  langChipOn: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  langText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  langTextOn: {
    color: colors.white,
  },
  voiceInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 10,
    minHeight: 72,
  },

});


