import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobRow } from '../components/JobRow';
import { OrbitBackground } from '../components/OrbitBackground';
import { SocialFooter } from '../components/SocialFooter';
import type { AppliedStackParamList, MainTabParamList } from '../navigation/types';
import { getAppliedJobs, type AppliedJob } from '../services/appliedJobs';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type AppliedNav = CompositeNavigationProp<
  NativeStackNavigationProp<AppliedStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export function AppliedScreen() {
  const navigation = useNavigation<AppliedNav>();
  const [jobs, setJobs] = useState<AppliedJob[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      getAppliedJobs().then((next) => {
        if (active) setJobs(next);
      });

      return () => {
        active = false;
      };
    }, []),
  );

  function browseJobs() {
    navigation.navigate('Home', {
      screen: 'Feed',
      params: { mode: 'jobs' },
    });
  }

  return (
    <View style={styles.root} testID="applied-screen">
      <OrbitBackground theme="emoji" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR APPLICATIONS</Text>
          <Text style={styles.title}>Applied</Text>
        </View>

        {jobs.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="assignment-turned-in" size={28} color={colors.label} />
            </View>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyCopy}>
              Roles you apply to from the Jobs tab will show up here.
            </Text>
            <Pressable
              testID="applied-browse"
              style={({ pressed }) => [styles.browseButton, pressed && styles.pressed]}
              onPress={browseJobs}
            >
              <Text style={styles.browseButtonText}>Browse jobs</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            style={styles.listView}
            data={jobs}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <JobRow
                job={item}
                onOpen={(next) => navigation.navigate('JobDetail', { job: next })}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<SocialFooter />}
          />
        )}
      </SafeAreaView>
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
  listView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    letterSpacing: -1.1,
    color: colors.ink,
    lineHeight: 46,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EEEA',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyCopy: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  browseButton: {
    marginTop: 8,
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  browseButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  pressed: {
    opacity: 0.88,
  },
});
