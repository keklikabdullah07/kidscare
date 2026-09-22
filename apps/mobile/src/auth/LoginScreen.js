import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useAuth } from './AuthContext';
import { colors, spacing } from '../theme';
import { getCustomBaseUrl, resolveBaseUrl, setCustomBaseUrl } from '../api/client';
export function LoginScreen({ onSwitchToSignup, }) {
    const { login, state } = useAuth();
    const [slug, setSlug] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [serverUrl, setServerUrl] = useState(resolveBaseUrl());
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const error = state.status === 'unauthenticated' ? state.error : null;
    useEffect(() => {
        void getCustomBaseUrl().then((url) => {
            if (url)
                setServerUrl(url);
        });
    }, []);
    async function handleSubmit() {
        if (submitting)
            return;
        setSubmitting(true);
        console.log(`👉 [LOGIN ATTEMPT] slug: "${slug}", email: "${email}", serverUrl: "${serverUrl}"`);
        try {
            if (serverUrl) {
                await setCustomBaseUrl(serverUrl);
            }
            await login(slug, email, password);
            console.log(`🎉 [LOGIN SUCCESS] Logged in as: "${email}"`);
        }
        catch (err) {
            console.error(`❌ [LOGIN ERROR]:`, err);
        }
        finally {
            setSubmitting(false);
        }
    }
    return (<KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>KidsCare — Giriş</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Kreş slug</Text>
          <TextInput style={styles.input} value={slug} onChangeText={setSlug} autoCapitalize="none" autoCorrect={false} placeholder="demo-kres" editable={!submitting}/>

          <Text style={styles.label}>E-posta</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!submitting}/>

          <Text style={styles.label}>Şifre</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry editable={!submitting}/>

          <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={() => void handleSubmit()} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}</Text>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Server URL Config Accordion */}
          <TouchableOpacity style={styles.serverToggle} onPress={() => setShowServerConfig((prev) => !prev)}>
            <Text style={styles.serverToggleText}>
              ⚙️ Sunucu Ayarı: {serverUrl} {showServerConfig ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showServerConfig && (<View style={styles.serverConfigBox}>
              <Text style={styles.serverConfigLabel}>API Sunucu Adresi:</Text>
              <TextInput style={styles.serverInput} value={serverUrl} onChangeText={setServerUrl} autoCapitalize="none" autoCorrect={false} placeholder="https://kidscare-api.onrender.com"/>
              <TouchableOpacity style={styles.serverResetBtn} onPress={() => {
                const defaultUrl = 'https://kidscare-api.onrender.com';
                setServerUrl(defaultUrl);
                void setCustomBaseUrl(defaultUrl);
            }}>
                <Text style={styles.serverResetText}>Varsayılana Sıfırla (Render)</Text>
              </TouchableOpacity>
            </View>)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Kreşiniz yok mu?</Text>
          <TouchableOpacity onPress={onSwitchToSignup}>
            <Text style={styles.footerLink}>Kayıt ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>);
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
    serverToggle: {
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
        alignItems: 'center',
    },
    serverToggleText: {
        fontSize: 11,
        color: colors.textMuted,
    },
    serverConfigBox: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
    },
    serverConfigLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    serverInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        fontSize: 12,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
    },
    serverResetBtn: {
        marginTop: 6,
        alignItems: 'center',
    },
    serverResetText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: '600',
    },
});
