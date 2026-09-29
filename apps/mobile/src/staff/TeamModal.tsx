import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { User, UserRole } from '@kidscare/shared-types';
import { inviteUser, listUsers } from '../api/users';
import { Card } from '../components/Card';
import { colors, radii, shadows, spacing, typography } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentUserRole?: string | undefined;
}

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  SUPER_ADMIN: { label: 'Süper Admin', bg: colors.primaryLight, text: colors.primaryDark },
  ADMIN: { label: 'Yönetici / Müdür', bg: colors.primaryLight, text: colors.primary },
  TEACHER: { label: 'Öğretmen', bg: colors.amberLight, text: colors.amberText },
  PARENT: { label: 'Veli', bg: colors.surfaceMuted, text: colors.textSecondary },
};

export function TeamModal({ visible, onClose, currentUserRole }: Props): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [inviting, setInviting] = useState(false);

  const canInvite = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      // quiet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      void loadData();
    }
  }, [visible]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !invitePassword.trim()) {
      Alert.alert('Eksik Bilgi', 'E-posta ve şifre zorunludur.');
      return;
    }
    setInviting(true);
    try {
      const created = await inviteUser({
        email: inviteEmail.trim(),
        password: invitePassword.trim(),
        role: inviteRole,
      });
      setUsers((prev) => [created, ...prev]);
      setShowInviteForm(false);
      setInviteEmail('');
      setInvitePassword('');
      Alert.alert('Başarılı', `${created.email} kullanıcısı sisteme eklendi.`);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Kullanıcı eklenemedi');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 22 }}>👥</Text>
              <Text style={styles.modalTitle}>Personel & Ekip ({users.length})</Text>
            </View>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {canInvite && (
            <Pressable
              style={styles.inviteToggleBtn}
              onPress={() => setShowInviteForm(!showInviteForm)}
            >
              <Ionicons
                name={showInviteForm ? 'remove-circle-outline' : 'person-add-outline'}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.inviteToggleText}>
                {showInviteForm ? 'Formu Gizle' : '+ Yeni Personel / Öğretmen Ekle'}
              </Text>
            </Pressable>
          )}

          {/* Invite Form */}
          {showInviteForm && (
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Yeni Hesap Tanımla</Text>

              <Text style={styles.fieldLabel}>E-posta Adresi *</Text>
              <TextInput
                style={styles.input}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="ornek@demo.test"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>İlk Giriş Şifresi *</Text>
              <TextInput
                style={styles.input}
                value={invitePassword}
                onChangeText={setInvitePassword}
                placeholder="Minimum 6 karakter"
                secureTextEntry
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Kullanıcı Rolü *</Text>
              <View style={styles.rolePickerRow}>
                <Pressable
                  style={[
                    styles.roleBtn,
                    inviteRole === 'TEACHER' && styles.roleBtnActive,
                  ]}
                  onPress={() => setInviteRole('TEACHER')}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      inviteRole === 'TEACHER' && styles.roleBtnTextActive,
                    ]}
                  >
                    Öğretmen
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.roleBtn, inviteRole === 'PARENT' && styles.roleBtnActive]}
                  onPress={() => setInviteRole('PARENT')}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      inviteRole === 'PARENT' && styles.roleBtnTextActive,
                    ]}
                  >
                    Veli
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.submitBtn, inviting && { opacity: 0.7 }]}
                onPress={handleInvite}
                disabled={inviting}
              >
                {inviting ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.submitBtnText}>Hesabı Oluştur</Text>
                )}
              </Pressable>
            </Card>
          )}

          {/* User List */}
          {loading ? (
            <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 380 }}
              contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.lg }}
            >
              {users.map((u) => {
                const badge = ROLE_LABELS[u.role] || {
                  label: u.role,
                  bg: colors.surfaceMuted,
                  text: colors.textSecondary,
                };
                return (
                  <View key={u.id} style={styles.userRow}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {u.email.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userEmail}>{u.email}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                        {u.isActive ? (
                          <Text style={styles.activeText}>• Aktif</Text>
                        ) : (
                          <Text style={styles.passiveText}>• Pasif</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.lg,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  inviteToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
    gap: 6,
    marginBottom: spacing.md,
  },
  inviteToggleText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  formCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  roleBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm + 2,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  userEmail: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  badgeText: {
    ...typography.tiny,
  },
  activeText: {
    ...typography.tiny,
    color: colors.success,
  },
  passiveText: {
    ...typography.tiny,
    color: colors.textMuted,
  },
});
