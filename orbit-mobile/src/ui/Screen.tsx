import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbitBackground } from '../components/OrbitBackground';
import { colors } from '../theme/colors';

type Props = {
  testID: string;
  children: ReactNode;
  scroll?: boolean;
};

export function DeskScreen({ testID, children, scroll = true }: Props) {
  return (
    <View style={styles.root} testID={testID}>
      <OrbitBackground theme="blobs" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
});
