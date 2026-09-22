import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { createJob, createStartup } from '../services/api';
import { incrementProfileStat } from '../services/profileActivity';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Variant = 'startup' | 'job' | 'freelance';

type Props = {
  visible: boolean;
  variant: Variant;
  onClose: () => void;
  onPosted: () => void;
};

type Field = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
};

const STARTUP_FIELDS: Field[] = [
  { key: 'name', label: 'Name', placeholder: 'Marble' },
  { key: 'description', label: 'Description', placeholder: 'What are you building?', multiline: true },
  { key: 'category', label: 'Category', placeholder: 'Dev Tools' },
  { key: 'location', label: 'Location', placeholder: 'HITEC City, Hyderabad' },
  { key: 'openRoles', label: 'Open roles', placeholder: '2', keyboardType: 'number-pad' },
];

const FREELANCE_FIELDS: Field[] = [
  { key: 'title', label: 'Gig title', placeholder: 'UI design for a clinic app' },
  { key: 'company', label: 'Client / company', placeholder: 'Kite Health' },
  { key: 'location', label: 'Location', placeholder: 'Gachibowli, Hyderabad' },
  { key: 'tags', label: 'Skills', placeholder: 'Figma · Gig' },
  { key: 'salary', label: 'Pay', placeholder: '₹8k–₹15k / project' },
];

const JOB_FIELDS: Field[] = [
  { key: 'title', label: 'Role title', placeholder: 'Founding Engineer' },
  { key: 'company', label: 'Company', placeholder: 'Marble' },
  { key: 'location', label: 'Location', placeholder: 'Remote · US' },
  { key: 'jobType', label: 'Type', placeholder: 'Full-time' },
  { key: 'tags', label: 'Tags', placeholder: 'TypeScript · Rust' },
  { key: 'salary', label: 'Salary', placeholder: '$170k' },
];

export function PostModal({ visible, variant, onClose, onPosted }: Props) {
  const { idToken, refreshToken } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = variant === 'startup' ? STARTUP_FIELDS : variant === 'freelance' ? FREELANCE_FIELDS : JOB_FIELDS;
  const title = variant === 'startup' ? 'Post a startup' : variant === 'freelance' ? 'Post a gig' : 'Post a role';

  function updateField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setValues({});
    setError(null);
    setSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    const token = idToken ?? (await refreshToken());
    if (!token) {
      setError('Sign in required to post.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (variant === 'startup') {
        if (!values.name?.trim() || !values.description?.trim() || !values.category?.trim()) {
          setError('Name, description, and category are required.');
          return;
        }

        await createStartup(
          {
            name: values.name.trim(),
            description: values.description.trim(),
            category: values.category.trim(),
            location: values.location?.trim() || 'Remote',
            openRoles: values.openRoles ? Number(values.openRoles) : 0,
          },
          token,
        );
      } else {
        if (!values.title?.trim() || !values.company?.trim() || !values.location?.trim()) {
          setError('Title, company, and location are required.');
          return;
        }

        await createJob(
          {
            title: values.title.trim(),
            company: values.company.trim(),
            location: values.location.trim(),
            jobType: variant === 'freelance' ? 'Freelance' : values.jobType?.trim() || 'Full-time',
            tags: variant === 'freelance' ? `${values.tags?.trim() || 'Gig'} · Freelance` : values.tags?.trim() || '',
            salary: values.salary?.trim() || '',
          },
          token,
        );
      }

      await incrementProfileStat('posted');

      resetForm();
      onPosted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handleRow}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
          >
            {fields.map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  value={values[field.key] ?? ''}
                  onChangeText={(text) => updateField(field.key, text)}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.label}
                  multiline={field.multiline}
                  keyboardType={field.keyboardType}
                  style={[styles.input, field.multiline && styles.inputMultiline]}
                />
              </View>
            ))}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Post</Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 20, 15, 0.28)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  cancel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.label,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#B45309',
  },
  submit: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.ink,
    paddingVertical: 14,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
  },
});
