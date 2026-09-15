import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Tenant } from '@kidscare/shared-types';
import { ApiError, getBaseUrl } from '../api/client';
import { getTenantMe, updateTenantMe } from '../api/tenants';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';

type Status = 'loading' | 'ready' | 'error';

export function TenantSettingsScreen(): React.ReactElement {
  const { logout, state } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTenantMe()
      .then((t) => {
        if (cancelled) return;
        setTenant(t);
        setName(t.name);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Bilinmeyen hata');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(): Promise<void> {
    if (!tenant || saving || name === tenant.name) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateTenantMe(name);
      setTenant(updated);
      setName(updated.name);
      Alert.alert('Kaydedildi', 'Kreş adı güncellendi.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof ApiError ? `API ${err.status}` : 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Kreş ayarları yüklenemedi</Text>
        <Text style={styles.errorMsg}>{errorMsg}</Text>
        <Text style={styles.errorHint}>API: {getBaseUrl()}</Text>
        <TouchableOpacity style={styles.button} onPress={() => void logout()}>
          <Text style={styles.buttonText}>Çıkış yap</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!tenant) return <></>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.flex1}>
          <Text style={styles.welcome}>
            Hoş geldin,{' '}
            <Text style={styles.bold}>
              {state.status === 'authenticated' ? state.user.email || state.user.id : ''}
            </Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => void logout()}>
          <Text style={styles.logout}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Kreş ayarları</Text>

      <View style={styles.card}>
        <Row label="Slug" value={<Code>{tenant.slug}</Code>} />
        <Row
          label="Durum"
          value={
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tenant.status}</Text>
            </View>
          }
        />
        <Row
          label="Oluşturuldu"
          value={
            <Text style={styles.valueText}>
              {new Date(tenant.createdAt).toLocaleString('tr-TR')}
            </Text>
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Ad</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} editable={!saving} />
        <TouchableOpacity
          style={[styles.button, (saving || name === tenant.name) && styles.buttonDisabled]}
          onPress={() => void handleSave()}
          disabled={saving || name === tenant.name}
        >
          <Text style={styles.buttonText}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Text>
        </TouchableOpacity>
        {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>{value}</View>
    </View>
  );
}

function Code({ children }: { children: string }): React.ReactElement {
  return <Text style={styles.code}>{children}</Text>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  container: { padding: spacing.lg, backgroundColor: colors.bg, flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  flex1: { flex: 1 },
  welcome: { fontSize: 14, color: colors.textSecondary },
  bold: { fontWeight: '600', color: colors.textPrimary },
  logout: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  rowLabel: {
    width: 96,
    fontSize: 13,
    color: colors.textMuted,
  },
  rowValue: { flex: 1 },
  valueText: { fontSize: 14, color: colors.textPrimary },
  code: {
    fontFamily: 'Courier',
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    color: colors.textPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: colors.successText, fontSize: 11, fontWeight: '600' },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.surface, fontWeight: '600', fontSize: 14 },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMsg: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
