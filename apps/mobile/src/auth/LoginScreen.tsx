import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { getCustomBaseUrl, getDefaultBaseUrl, resolveBaseUrl, setCustomBaseUrl } from '../api/client';
import { KidsCareLogo } from '../components/KidsCareLogo';
import { useResponsive } from '../utils/responsive';

type DemoRole = 'ADMIN' | 'TEACHER' | 'PARENT';

const DEMO_PRESETS: Record<
  DemoRole,
  { label: string; email: string; pass: string; roleDesc: string; emoji: string }
> = {
  ADMIN: {
    label: 'Müdür',
    email: 'admin@demo.test',
    pass: 'demo1234',
    roleDesc: 'Tüm kreş operasyonu, ekip & ayarlar',
    emoji: '👑',
  },
  TEACHER: {
    label: 'Öğretmen',
    email: 'teacher@demo.test',
    pass: 'demo1234',
    roleDesc: 'Yoklama, günlük karne & aktivite akışı',
    emoji: '👩‍🏫',
  },
  PARENT: {
    label: 'Veli',
    email: 'parent@demo.test',
    pass: 'demo1234',
    roleDesc: 'Öğrenci karnesi, ilaç & teslimat takibi',
    emoji: '👨‍👩‍👧',
  },
};

export function LoginScreen({
  onSwitchToSignup,
}: {
  onSwitchToSignup: () => void;
}): React.ReactElement {
  const { login, state } = useAuth();
  const [slug, setSlug] = useState('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverUrl, setServerUrl] = useState(resolveBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePreset, setActivePreset] = useState<DemoRole>('PARENT');
  const error = state.status === 'unauthenticated' ? state.error : null;
  const { isSmallPhone } = useResponsive();

  useEffect(() => {
    void getCustomBaseUrl().then((url) => {
      if (url) setServerUrl(url);
    });
  }, []);

  async function performLogin(targetSlug: string, targetEmail: string, targetPass: string): Promise<void> {
    if (submitting) return;
    setSubmitting(true);
    console.log(`👉 [LOGIN ATTEMPT] slug: "${targetSlug}", email: "${targetEmail}", serverUrl: "${serverUrl}"`);
    try {
      if (serverUrl) {
        await setCustomBaseUrl(serverUrl);
      }
      await login(targetSlug.trim(), targetEmail.trim(), targetPass);
      console.log(`🎉 [LOGIN SUCCESS] Logged in as: "${targetEmail}"`);
    } catch (err) {
      console.error(`❌ [LOGIN ERROR]:`, err);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePresetSelect(role: DemoRole, autoLogin = false): void {
    const preset = DEMO_PRESETS[role];
    setActivePreset(role);
    setSlug('demo');
    setEmail(preset.email);
    setPassword(preset.pass);
    if (autoLogin) {
      void performLogin('demo', preset.email, preset.pass);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Compact Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadgeCard}>
              <KidsCareLogo variant="icon" size="sm" />
            </View>

            <View style={styles.brandTitleCol}>
              <View style={styles.titleRow}>
                <Text style={styles.brandTitleBlack}>Kids</Text>
                <Text style={styles.brandTitleTeal}>Care</Text>
                <View style={styles.portalBadge}>
                  <Text style={styles.portalBadgeText}>KREŞ</Text>
                </View>
              </View>
              <Text style={styles.brandDesc}>Yeni Nesil Okul Öncesi Yönetim Portalı</Text>
            </View>
          </View>

          {/* Main Focused Login Card */}
          <View style={styles.card}>
            {/* Quick Demo Credentials Assistant Box */}
            <View style={styles.demoBox}>
              <View style={styles.demoBoxHeader}>
                <View style={styles.demoBoxTitleRow}>
                  <Ionicons name="sparkles" size={13} color={colors.amberDark} />
                  <Text style={styles.demoBoxTitle}>Hızlı Demo Girişi</Text>
                </View>
                <Pressable
                  onPress={() => handlePresetSelect(activePreset, true)}
                  hitSlop={8}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.demoBoxAction}>Tek Tıkla Giriş →</Text>
                </Pressable>
              </View>

              {/* 3 Role Preset Cards */}
              <View style={styles.presetButtonsRow}>
                {(Object.keys(DEMO_PRESETS) as DemoRole[]).map((role) => {
                  const preset = DEMO_PRESETS[role];
                  const isSelected = activePreset === role;
                  return (
                    <Pressable
                      key={role}
                      style={[
                        styles.presetButton,
                        isSelected ? styles.presetButtonActive : styles.presetButtonInactive,
                      ]}
                      onPress={() => handlePresetSelect(role, false)}
                    >
                      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                      <Text
                        style={[
                          styles.presetLabel,
                          isSelected ? styles.presetLabelActive : styles.presetLabelInactive,
                        ]}
                        numberOfLines={1}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.demoRoleDesc} numberOfLines={1}>
                {DEMO_PRESETS[activePreset].roleDesc}
              </Text>
            </View>

            {/* Error Banner */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText} numberOfLines={2}>
                  {error}
                </Text>
              </View>
            )}

            {/* Slug Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kreş Kodu / Slug</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={slug}
                  onChangeText={setSlug}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="demo"
                  placeholderTextColor={colors.textMuted}
                  editable={!submitting}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta Adresi</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="ornek@demo.test"
                  placeholderTextColor={colors.textMuted}
                  editable={!submitting}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  editable={!submitting}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                submitting && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => void performLogin(slug, email, password)}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <View style={styles.submitButtonInner}>
                  <Ionicons name="log-in-outline" size={17} color={colors.textInverse} style={{ marginRight: 6 }} />
                  <Text style={styles.submitButtonText}>Giriş Yap</Text>
                </View>
              )}
            </Pressable>

            {/* Server Config Accordion */}
            <Pressable
              style={styles.serverToggle}
              onPress={() => setShowServerConfig((prev) => !prev)}
            >
              <Ionicons name="hardware-chip-outline" size={12} color={colors.textMuted} />
              <Text style={styles.serverToggleText} numberOfLines={1}>
                {serverUrl.replace('https://', '').replace('http://', '')}
              </Text>
              <Ionicons
                name={showServerConfig ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.textMuted}
              />
            </Pressable>

            {showServerConfig && (
              <View style={styles.serverConfigBox}>
                <Text style={styles.serverConfigLabel}>API Sunucu Adresi:</Text>
                <TextInput
                  style={styles.serverInput}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="https://kidscare.abdullahkeklik.com/api"
                  placeholderTextColor={colors.textMuted}
                />
                <Pressable
                  style={styles.serverResetBtn}
                  onPress={() => {
                    const def = getDefaultBaseUrl();
                    setServerUrl(def);
                    void setCustomBaseUrl(def);
                  }}
                >
                  <Text style={styles.serverResetText}>Varsayılana Sıfırla</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Footer Note */}
          <Text style={styles.footerText}>KidsCare v2.0 • Güvenli Okul Öncesi Portalı</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  logoBadgeCard: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    ...shadows.xs,
  },
  brandTitleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  brandTitleBlack: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTitleTeal: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  portalBadge: {
    marginLeft: 4,
    backgroundColor: colors.amberLight,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  portalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.amberText,
    letterSpacing: 0.5,
  },
  brandDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  demoBox: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm + 2,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  demoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  demoBoxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  demoBoxTitle: {
    ...typography.tiny,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoBoxAction: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  presetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: radii.xs + 2,
    borderWidth: 1,
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  presetEmoji: {
    fontSize: 12,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetLabelActive: {
    color: colors.textInverse,
  },
  presetLabelInactive: {
    color: colors.textSecondary,
  },
  demoRoleDesc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: radii.sm,
    padding: spacing.xs + 2,
    marginBottom: spacing.sm,
    gap: 6,
  },
  errorText: {
    fontSize: 11,
    color: colors.dangerText,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm + 2,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...shadows.card,
  },
  submitButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  serverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 2,
    gap: 4,
  },
  serverToggleText: {
    fontSize: 10,
    color: colors.textMuted,
    maxWidth: 200,
  },
  serverConfigBox: {
    marginTop: 6,
    padding: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverConfigLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  serverInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xs + 2,
    paddingHorizontal: spacing.xs + 2,
    height: 32,
    fontSize: 11,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  serverResetBtn: {
    marginTop: 4,
    alignItems: 'center',
  },
  serverResetText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '500',
  },
});
