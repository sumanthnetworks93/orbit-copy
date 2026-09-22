import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, elevation } from '../theme/colors';
import { fonts } from '../theme/typography';

const AREAS = ['Hyderabad', 'Gachibowli', 'HITEC City', 'Madhapur'] as const;
const ROLES = ['Any role', 'Nurse', 'Driver', 'Office'] as const;

type Props = {
  defaultName?: string;
  onSkip: () => void;
  onContinue: (input: { name: string; area: string; role: string }) => void;
};

export function OnboardingSheet({ defaultName = '', onSkip, onContinue }: Props) {
  const [name, setName] = useState(defaultName);
  const [area, setArea] = useState<(typeof AREAS)[number]>('Hyderabad');
  const [role, setRole] = useState<(typeof ROLES)[number]>('Any role');

  return (
    <>
      <Pressable testID="onboarding-dismiss" style={styles.scrim} onPress={onSkip} />
      <View style={styles.sheet} testID="onboarding-sheet">
        <Text style={styles.kicker}>WELCOME</Text>
        <Text style={styles.title}>Two taps. Then jobs.</Text>
        <Text style={styles.copy}>Name and area now. Apply later in six fields — no PDF.</Text>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          testID="onboarding-name"
          value={name}
          onChangeText={setName}
          placeholder="Priya Rao"
          placeholderTextColor={colors.label}
          autoComplete="off"
          style={styles.input}
        />

        <Text style={styles.label}>Show jobs in</Text>
        <View style={styles.chips}>
          {AREAS.map((item) => (
            <Pressable
              key={item}
              testID={`onboarding-area-${item}`}
              onPress={() => setArea(item)}
              style={[styles.chip, area === item && styles.chipOn]}
            >
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Work you want</Text>
        <View style={styles.chips}>
          {ROLES.map((item) => (
            <Pressable
              key={item}
              testID={`onboarding-role-${item}`}
              onPress={() => setRole(item)}
              style={[styles.chip, role === item && styles.chipOn]}
            >
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="onboarding-continue"
          onPress={() =>
            onContinue({
              name: name.trim() || defaultName.trim() || 'Seeker',
              area,
              role: role === 'Any role' ? '' : role,
            })
          }
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>See my jobs</Text>
        </Pressable>
        <Pressable testID="onboarding-skip" onPress={onSkip} style={styles.skip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 20, 15, 0.28)',
    zIndex: 8,
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
    zIndex: 9,
    borderRadius: 28,
    backgroundColor: colors.white,
    padding: 18,
    ...elevation.float,
  },
  kicker: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.label,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.7,
    color: colors.ink,
    marginTop: 6,
  },
  copy: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.label,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  chipOn: {
    backgroundColor: colors.lilac,
    borderColor: colors.lilac,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.ink,
  },
  primary: {
    marginTop: 12,
    height: 52,
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
  skip: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  pressed: { opacity: 0.88 },
});
