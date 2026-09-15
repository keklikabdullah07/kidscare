import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from './AuthContext';
import { colors, spacing } from '../theme';

export function SignupScreen({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}): React.ReactElement {
  const { signup, state } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const error = state.status === 'unauthenticated' ? state.error : null;

  async function handleSubmit(): Promise<void> {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signup(slug, name, email, password);
    } catch {
      // error already on state
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>KidsCare — Kreş Kaydı</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Kreş adı</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Yeni Kreş"
            editable={!submitting}
          />

          <Text style={styles.label}>
            Kreş slug <Text style={styles.hint}>(küçük harf, tire)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={slug}
            onChangeText={setSlug}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="yeni-kres"
            editable={!submitting}
          />

          <Text style={styles.label}>Admin e-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />

          <Text style={styles.label}>
            Şifre <Text style={styles.hint}>(min 8 karakter)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!submitting}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={() => void handleSubmit()}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>{submitting ? 'Kayıt yapılıyor…' : 'Kayıt ol'}</Text>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten kreşiniz var mı?</Text>
          <TouchableOpacity onPress={onSwitchToLogin}>
            <Text style={styles.footerLink}>Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  hint: { color: colors.textMuted, fontWeight: '400', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 6,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.surface, fontWeight: '600', fontSize: 14 },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textMuted, fontSize: 13 },
  footerLink: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
