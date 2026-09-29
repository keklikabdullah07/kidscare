import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  MedicationRecord,
  PickupAuthorization,
  StandaloneMedicationStatus,
} from '@kidscare/shared-types';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, spacing, typography } from '../theme';
import {
  listMedicationRecords,
  markMedicationGiven,
  markMedicationSkipped,
} from '../api/medication';
import { listPickupAuthorizations, reviewPickupAuthorization } from '../api/pickup';

import { useAuth } from '../auth/AuthContext';

const MED_STATUS_BADGE: Record<
  StandaloneMedicationStatus,
  { label: string; bg: string; text: string }
> = {
  REQUESTED: { label: 'Onay Bekliyor', bg: colors.amberLight, text: colors.amberText },
  APPROVED: { label: 'Onaylandı', bg: colors.primaryLight, text: colors.primaryDark },
  SCHEDULED: { label: 'Planlandı', bg: colors.primaryLight, text: colors.primary },
  GIVEN: { label: '✓ Verildi', bg: colors.successBg, text: colors.successText },
  SKIPPED: { label: 'Atlandı', bg: colors.surfaceMuted, text: colors.textSecondary },
  REJECTED: { label: 'Reddedildi', bg: colors.dangerBg, text: colors.dangerText },
};

export function StaffCareTab(): React.ReactElement {
  const { state: authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [authorizations, setAuthorizations] = useState<PickupAuthorization[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin =
    authState.status === 'authenticated' &&
    (authState.user.role === 'ADMIN' || authState.user.role === 'SUPER_ADMIN');

  async function loadData(): Promise<void> {
    try {
      const [meds, auths] = await Promise.all([
        listMedicationRecords().catch(() => []),
        isAdmin ? listPickupAuthorizations().catch(() => []) : Promise.resolve([]),
      ]);
      setMedications(meds);
      setAuthorizations(auths);
    } catch (err) {
      console.error('Error loading staff care data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    void loadData();
  };

  async function handleMarkGiven(id: string): Promise<void> {
    setBusyId(id);
    try {
      await markMedicationGiven(id, { givenAt: new Date() });
      Alert.alert('Başarılı', 'İlaç verildi olarak kaydedildi ve veliye bildirildi.');
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function handleSkipMed(id: string): Promise<void> {
    Alert.prompt
      ? Alert.prompt('İlacı Atla', 'Atlanma sebebi nedir?', async (reason) => {
          if (!reason) return;
          setBusyId(id);
          try {
            await markMedicationSkipped(id, { reason });
            void loadData();
          } catch (err) {
            Alert.alert('Hata', err instanceof Error ? err.message : 'İşlem başarısız');
          } finally {
            setBusyId(null);
          }
        })
      : (() => {
          setBusyId(id);
          markMedicationSkipped(id, { reason: 'Öğrenci veya veli isteği' })
            .then(() => void loadData())
            .catch((err: unknown) =>
              Alert.alert('Hata', err instanceof Error ? err.message : 'İşlem başarısız'),
            )
            .finally(() => setBusyId(null));
        })();
  }

  async function handleReviewPickup(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    setBusyId(id);
    try {
      await reviewPickupAuthorization(id, { status });
      Alert.alert('Güncellendi', `Teslimat izni ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`);
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScreenContainer
      icon="medkit"
      title="Sağlık & Güvenlik"
      subtitle="Bugün verilecek ilaçlar ve teslimat izin onayları"
    >
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      ) : (
        <>
          {/* İLAÇLAR BÖLÜMÜ */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              💊 Verilecek İlaçlar ({medications.filter((m) => m.status !== 'GIVEN').length})
            </Text>
            <Pressable onPress={onRefresh} hitSlop={8}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </Pressable>
          </View>

          {medications.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyContent}>
                <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.success} />
                <Text style={styles.emptyTitle}>Tüm İlaçlar Tamamlandı</Text>
                <Text style={styles.emptyDesc}>Bugün verilmesi gereken bekleyen ilaç yok.</Text>
              </View>
            </Card>
          ) : (
            medications.map((item) => {
              const badge = MED_STATUS_BADGE[item.status] || MED_STATUS_BADGE.REQUESTED;
              const isPending = item.status === 'REQUESTED' || item.status === 'APPROVED' || item.status === 'SCHEDULED';
              const isBusy = busyId === item.id;

              return (
                <Card
                  key={item.id}
                  variant={isPending ? 'accent' : 'default'}
                  style={styles.recordCard}
                >
                  <View style={styles.recordHeader}>
                    <Text style={styles.medNameText}>{item.medicationName}</Text>
                    <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgePillText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.medDoseText}>Dozaj: {item.dosage}</Text>
                  {item.instructions && (
                    <Text style={styles.medInstructionText}>Talimat: {item.instructions}</Text>
                  )}

                  {isPending && (
                    <View style={styles.actionButtonsRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.givenBtn,
                          isBusy && { opacity: 0.6 },
                          pressed && { opacity: 0.88 },
                        ]}
                        onPress={() => void handleMarkGiven(item.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? (
                          <ActivityIndicator size="small" color={colors.textInverse} />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                            <Text style={styles.givenBtnText}>İlaç Verildi</Text>
                          </>
                        )}
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.88 }]}
                        onPress={() => void handleSkipMed(item.id)}
                        disabled={isBusy}
                      >
                        <Text style={styles.skipBtnText}>Atla</Text>
                      </Pressable>
                    </View>
                  )}
                </Card>
              );
            })
          )}

          {/* GÜVENLİ TESLİMAT BÖLÜMÜ */}
          <View style={[styles.sectionHeaderRow, { marginTop: spacing.xxl }]}>
            <Text style={styles.sectionTitle}>
              🛡️ Bekleyen Teslimat İzinleri ({authorizations.filter((a) => a.status === 'PENDING').length})
            </Text>
          </View>

          {authorizations.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyContent}>
                <Ionicons name="shield-checkmark-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Bekleyen Teslimat İzni Yok</Text>
                <Text style={styles.emptyDesc}>Velilerden gelen olağan dışı teslimat talebi bulunmuyor.</Text>
              </View>
            </Card>
          ) : (
            authorizations.map((auth) => {
              const isPending = auth.status === 'PENDING';
              const isBusy = busyId === auth.id;

              return (
                <Card key={auth.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.personHeaderRow}>
                      <View style={styles.personAvatar}>
                        <Ionicons name="shield-outline" size={16} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.personName}>Teslimat İzni #{auth.id.slice(0, 8)}</Text>
                        <Text style={styles.personRelation}>
                          {new Date(auth.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.badgePill,
                        {
                          backgroundColor:
                            auth.status === 'APPROVED'
                              ? colors.successBg
                              : auth.status === 'REJECTED'
                              ? colors.dangerBg
                              : colors.amberLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgePillText,
                          {
                            color:
                              auth.status === 'APPROVED'
                                ? colors.successText
                                : auth.status === 'REJECTED'
                                ? colors.dangerText
                                : colors.amberText,
                          },
                        ]}
                      >
                        {auth.status === 'APPROVED'
                          ? 'Onaylı'
                          : auth.status === 'REJECTED'
                          ? 'Reddedildi'
                          : 'Onay Bekliyor'}
                      </Text>
                    </View>
                  </View>
                  {auth.note && <Text style={styles.noteText}>Veli Notu: {auth.note}</Text>}

                  {isPending && (
                    <View style={styles.actionButtonsRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.givenBtn,
                          isBusy && { opacity: 0.6 },
                          pressed && { opacity: 0.88 },
                        ]}
                        onPress={() => void handleReviewPickup(auth.id, 'APPROVED')}
                        disabled={isBusy}
                      >
                        <Text style={styles.givenBtnText}>✓ İzni Onayla</Text>
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          styles.skipBtn,
                          { borderColor: colors.dangerBg },
                          pressed && { opacity: 0.88 },
                        ]}
                        onPress={() => void handleReviewPickup(auth.id, 'REJECTED')}
                        disabled={isBusy}
                      >
                        <Text style={[styles.skipBtnText, { color: colors.danger }]}>Reddet</Text>
                      </Pressable>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  recordCard: {
    marginBottom: spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  medNameText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  badgePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgePillText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  medDoseText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  medInstructionText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  givenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    gap: 4,
  },
  givenBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
  },
  skipBtn: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  skipBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  personHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  personRelation: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  phoneText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
