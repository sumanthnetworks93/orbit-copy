import {
  HankenGrotesk_400Regular,
  HankenGrotesk_400Regular_Italic,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clerkPublishableKey, isClerkConfigured } from './src/config/clerk';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/hyd/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_400Regular_Italic,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  if (Platform.OS !== 'web' && !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const tree: ReactNode = (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );

  if (!isClerkConfigured) {
    return tree;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {tree}
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
});
