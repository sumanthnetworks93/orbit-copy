import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { FilterChip } from '../components/FilterChip';
import { OrbitBackground } from '../components/OrbitBackground';
import type { HomeStackParamList } from '../navigation/types';
import { fetchGeoLocation, fetchJobFilterOptions } from '../services/api';
import { TELANGANA_DISTRICTS } from '../hyd/areas';
import { useLanguage } from '../hyd/LanguageContext';
import type { GeoLocation } from '../types';
import {
  countActiveJobFilters,
  defaultJobFilters,
  type JobFilters,
} from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'JobsFilter'>;

function Toggle({
  label,
  helper,
  value,
  onValue,
}: {
  label: string;
  helper: string;
  value: boolean;
  onValue: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValue}
        trackColor={{ false: colors.border, true: colors.black }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function JobsFilterScreen({ navigation, route }: Props) {
  const { copy } = useLanguage();
  const [draft, setDraft] = useState<JobFilters>({
    ...route.params.filters,
    location: route.params.filters.location ?? '',
  });
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [geo, setGeo] = useState<GeoLocation | null>(null);

  useEffect(() => {
    fetchJobFilterOptions()
      .then(setJobTypes)
      .catch(() => setJobTypes([]))
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    fetchGeoLocation()
      .then(setGeo)
      .catch(() => undefined);
  }, []);

  function applyFilters() {
    navigation.navigate({
      name: 'Feed',
      params: { mode: route.params.mode ?? 'jobs', jobFilters: draft },
      merge: true,
    });
  }

  function clearFilters() {
    setDraft(defaultJobFilters);
  }

  return (
    <View style={styles.root}>
      <OrbitBackground theme="dots" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title} testID="jobs-filter-title">
            {route.params.mode === 'freelance' ? 'Filter gigs' : 'Filter jobs'}
          </Text>
          <Text style={styles.subtitle}>
            {countActiveJobFilters(draft)} active filter
            {countActiveJobFilters(draft) === 1 ? '' : 's'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Search</Text>
          <TextInput
            testID="jobs-filter-search"
            value={draft.search}
            onChangeText={(search) => setDraft((current) => ({ ...current, search }))}
            placeholder="Title, company, or tags"
            placeholderTextColor={colors.label}
            style={styles.input}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            testID="jobs-filter-location"
            value={draft.location}
            onChangeText={(location) => setDraft((current) => ({ ...current, location }))}
            placeholder="Hyderabad, India"
            placeholderTextColor={colors.label}
            style={styles.input}
          />
          {geo?.city ? (
            <Pressable
              testID="use-my-location"
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  location: [geo.city, geo.state || geo.country].filter(Boolean).join(', '),
                }))
              }
              style={styles.geoChip}
            >
              <Text style={styles.geoChipText}>
                Use my location{geo.emoji ? ` ${geo.emoji}` : ''} {geo.city}
              </Text>
            </Pressable>
          ) : null}

          <Text style={styles.label}>District</Text>
          <View style={styles.chips}>
            {TELANGANA_DISTRICTS.map((district) => (
              <FilterChip
                key={district}
                label={district}
                active={draft.area === district}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    area: current.area === district ? null : district,
                    location: current.area === district ? current.location : `${district}, Telangana`,
                  }))
                }
              />
            ))}
          </View>

          <Toggle
            label={copy.womenSafe}
            helper="Late-shift + women-only floors / cab"
            value={Boolean(draft.womenSafe)}
            onValue={(womenSafe) => setDraft((current) => ({ ...current, womenSafe }))}
          />
          <Toggle
            label={copy.cab}
            helper="Office cab or pickup"
            value={Boolean(draft.cabProvided)}
            onValue={(cabProvided) => setDraft((current) => ({ ...current, cabProvided }))}
          />
          <Toggle
            label={copy.metro}
            helper="HITEC / Raidurg / Uppal metro"
            value={Boolean(draft.nearMetro)}
            onValue={(nearMetro) => setDraft((current) => ({ ...current, nearMetro }))}
          />
          <Toggle
            label={copy.lateShift}
            helper="Evening or night"
            value={Boolean(draft.lateShift)}
            onValue={(lateShift) => setDraft((current) => ({ ...current, lateShift }))}
          />
          <Toggle
            label={copy.verified}
            helper="Orbit Support verified listings only"
            value={Boolean(draft.verifiedOnly)}
            onValue={(verifiedOnly) => setDraft((current) => ({ ...current, verifiedOnly }))}
          />
          <Toggle
            label={copy.walkins}
            helper="Same-week walk-in drives"
            value={Boolean(draft.walkInOnly)}
            onValue={(walkInOnly) => setDraft((current) => ({ ...current, walkInOnly }))}
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.label}>Remote only</Text>
              <Text style={styles.helper}>Show roles with remote locations</Text>
            </View>
            <Switch
              value={draft.remoteOnly}
              onValueChange={(remoteOnly) => setDraft((current) => ({ ...current, remoteOnly }))}
              trackColor={{ false: colors.border, true: colors.black }}
              thumbColor={colors.white}
            />
          </View>

          <Text style={styles.label}>Job type</Text>
          {loadingOptions ? (
            <ActivityIndicator color={colors.ink} style={styles.loader} />
          ) : (
            <View style={styles.chips}>
              <FilterChip
                label="All types"
                active={draft.jobType === null}
                onPress={() => setDraft((current) => ({ ...current, jobType: null }))}
              />
              {jobTypes.map((jobType) => (
                <FilterChip
                  key={jobType}
                  label={jobType}
                  active={draft.jobType === jobType}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      jobType: current.jobType === jobType ? null : jobType,
                    }))
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable testID="jobs-filter-clear" onPress={clearFilters} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Clear all</Text>
          </Pressable>
          <Pressable testID="jobs-filter-apply" onPress={applyFilters} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Apply filters</Text>
          </Pressable>
        </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.label,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  geoChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  geoChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  loader: {
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
});
