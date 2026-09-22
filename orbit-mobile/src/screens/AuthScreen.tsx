import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useIsCompact } from '../hyd/useIsCompact';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClerkAuthActions } from '../components/ClerkAuthActions';
import { isClerkConfigured } from '../config/clerk';
import { LegalLinks, LegalSheet } from '../components/LegalSheet';
import { MobileQr } from '../components/MobileQr';
import { OrbitBackground } from '../components/OrbitBackground';
import { OrbitLogo } from '../components/OrbitLogo';
import { SocialButton } from '../components/SocialButton';
import { SupportButton } from '../components/SupportButton';
import { DEMO_PASSWORD, DEMO_SEEKER, isE2EMode, signInAsAdmin, signInAsEmployer, signInAsGuest, signInAsUser, signInWithPassword } from '../services/auth';
import type { LegalDocId } from '../legal/content';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function AuthScreen() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const [email, setEmail] = useState(DEMO_SEEKER.email ?? 'priya@orbit.app');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const compact = useIsCompact();

  async function handlePasswordLogin() {
    try {
      setLoadingProvider('password');
      await signInWithPassword(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed.';
      Alert.alert('Sign in', message);
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleUser() {
    try {
      setLoadingProvider('user');
      await signInAsUser();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'User sign in failed.';
      Alert.alert('User sign in', message);
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleAdmin() {
    try {
      setLoadingProvider('admin');
      await signInAsAdmin();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin sign in failed.';
      Alert.alert('Admin sign in', message);
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleEmployer() {
    try {
      setLoadingProvider('employer');
      await signInAsEmployer();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Employer sign in failed.';
      Alert.alert('Employer sign in', message);
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleGuest() {
    try {
      setLoadingProvider('guest');
      await signInAsGuest();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed.';
      Alert.alert('Sign in', message);
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <View style={styles.root} testID="auth-screen">
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <View style={styles.hero}>
            <OrbitLogo />
            <Text style={styles.title}>
              Discover startups.{'\n'}
              <Text style={styles.titleEm}>Find your next role.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Hyderabad jobs first. Apply in six fields. No PDF resume.
            </Text>
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Apply without a PDF</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Hyderabad first</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Phone stays masked</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <Text style={styles.demoLabel}>Looking for work?</Text>
            <Pressable
              testID="auth-user"
              accessibilityLabel="Login as user"
              disabled={loadingProvider !== null}
              onPress={() => void handleUser()}
              style={({ pressed }) => [styles.login, pressed && styles.pressed]}
            >
              {loadingProvider === 'user' ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <Text style={styles.loginText}>Login as user</Text>
              )}
            </Pressable>
            {isE2EMode() || compact ? (
              <SocialButton
                provider="github"
                loading={loadingProvider === 'guest'}
                onPress={handleGuest}
                testID="auth-guest"
                label="Continue as guest"
              />
            ) : null}

            <Text style={styles.demoLabel}>Or use email</Text>
            <TextInput
              testID="auth-email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor={colors.label}
              style={styles.input}
            />
            <TextInput
              testID="auth-password"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor={colors.label}
              style={styles.input}
            />
            <Pressable
              testID="auth-login"
              accessibilityLabel="Log in with demo account"
              disabled={loadingProvider !== null}
              onPress={() => void handlePasswordLogin()}
              style={({ pressed }) => [styles.login, pressed && styles.pressed]}
            >
              {loadingProvider === 'password' ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <Text style={styles.loginText}>Log in</Text>
              )}
            </Pressable>
            <Text style={styles.demoHint}>priya@orbit.app · OrbitDemo1!</Text>
            {isClerkConfigured ? <ClerkAuthActions /> : null}
            <Text style={styles.demoLabel}>Hiring desk</Text>
            <Pressable
              testID="auth-admin"
              accessibilityLabel="Login as super admin"
              disabled={loadingProvider !== null}
              onPress={() => void handleAdmin()}
              style={({ pressed }) => [styles.employer, pressed && styles.pressed]}
            >
              {loadingProvider === 'admin' ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <Text style={styles.employerText}>Login as super admin</Text>
              )}
            </Pressable>
            <Pressable
              testID="auth-employer"
              accessibilityLabel="Login as employer"
              disabled={loadingProvider !== null}
              onPress={() => void handleEmployer()}
              style={({ pressed }) => [styles.employer, pressed && styles.pressed]}
            >
              {loadingProvider === 'employer' ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <Text style={styles.employerText}>Login as employer</Text>
              )}
            </Pressable>
          </View>

          {Platform.OS === 'web' ? <MobileQr /> : null}

          <View style={styles.legalBlock}>
            <Text style={styles.legal}>
              By continuing you agree to Orbit's Terms and Privacy Policy. We never hand employers your raw phone number.
            </Text>
            <LegalLinks onOpen={setLegalDoc} />
            <SupportButton />
          </View>
        </ScrollView>
      </SafeAreaView>
      <LegalSheet docId={legalDoc} onClose={() => setLegalDoc(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 56,
  },
  hero: {
    alignItems: 'center',
    gap: 20,
    marginTop: 32,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 52,
    letterSpacing: -1.2,
    textAlign: 'center',
    color: colors.ink,
  },
  titleEm: {
    fontFamily: fonts.displayItalic,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    color: colors.muted,
    maxWidth: 340,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 360,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
  },
  buttons: {
    gap: 12,
    marginTop: 40,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  demoLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.label,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  demoHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  login: {
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  employer: {
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employerText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.88,
  },
  legal: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.label,
  },
  legalBlock: {
    marginTop: 28,
    gap: 14,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
});
