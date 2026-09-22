import { SignIn, SignUp } from '@clerk/expo/web';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isClerkConfigured } from '../config/clerk';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function ClerkAuthActions() {
  const [panel, setPanel] = useState<'sign-in' | 'sign-up' | null>(null);

  if (!isClerkConfigured) {
    return null;
  }

  if (panel) {
    return (
      <View style={styles.panel} testID={panel === 'sign-up' ? 'clerk-signup-panel' : 'clerk-signin-panel'}>
        {panel === 'sign-up' ? (
          <SignUp routing="hash" />
        ) : (
          <SignIn routing="hash" />
        )}
        <Pressable
          accessibilityLabel="Back to auth options"
          onPress={() => setPanel(null)}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Pressable
        testID="auth-sign-in"
        accessibilityLabel="Sign in"
        onPress={() => setPanel('sign-in')}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Sign in</Text>
      </Pressable>
      <Pressable
        testID="auth-sign-up"
        accessibilityLabel="Sign up"
        onPress={() => setPanel('sign-up')}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryText}>Sign up</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 12,
    minHeight: 280,
  },
  primary: {
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  secondary: {
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.88,
  },
});
