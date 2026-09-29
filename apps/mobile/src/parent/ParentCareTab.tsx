import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  MedicationRecord,
  ParentChildOverview,
  PickupContact,
  StandaloneMedicationStatus,
} from '@kidscare/shared-types';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { fetchParentChildrenOverview } from '../api/parent';
import { createMedicationRecord, listMedicationRecords } from '../api/medication';
import { createPickupContact, deletePickupContact, listPickupContacts } from '../api/pickup';

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

export function ParentCareTab(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<ParentChildOverview[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [contacts, setContacts] = useState<PickupContact[]>([]);

  // Med modal state
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [savingMed, setSavingMed] = useState(false);

  // Pickup modal state
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupName, setPickupName] = useState('');
  const [pickupRelation, setPickupRelation] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [savingPickup, setSavingPickup] = useState(false);

  async function loadData(childId?: string): Promise<void> {
    try {
      let activeId = childId || selectedChildId;
      if (!activeId) {
        const overview = await fetchParentChildrenOverview();
        setChildren(overview);
        if (overview.length > 0) {
          activeId = overview[0]?.student.id ?? null;
          setSelectedChildId(activeId);
        }
      }
      if (activeId) {
        const [meds, contactList] = await Promise.all([
          listMedicationRecords(activeId).catch(() => []),
          listPickupContacts(activeId).catch(() => []),
        ]);
        setMedications(meds);
        setContacts(contactList);
      }
    } catch (err) {
      console.error('Error loading care data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [selectedChildId]);

  const onRefresh = (): void => {
    setRefreshing(true);
    void loadData();
  };

  async function handleCreateMedication(): Promise<void> {
    if (!selectedChildId || !medName.trim() || !medDosage.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ilaç adı ve dozunu yazın.');
      return;
    }
    setSavingMed(true);
    try {
      await createMedicationRecord({
        studentId: selectedChildId,
        medicationName: medName.trim(),
        dosage: medDosage.trim(),
        instructions: medInstructions.trim() || (medTime ? `Saat: ${medTime}` : undefined),
      });
      setMedModalOpen(false);
      setMedName('');
      setMedDosage('');
      setMedTime('');
      setMedInstructions('');
      Alert.alert('Başarılı', 'İlaç talebi öğretmene iletildi.');
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Kayıt oluşturulamadı');
    } finally {
      setSavingMed(false);
    }
  }

  async function handleCreatePickup(): Promise<void> {
    if (!selectedChildId || !pickupName.trim() || !pickupPhone.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen teslim alacak kişinin adını ve telefonunu yazın.');
      return;
    }
    setSavingPickup(true);
    try {
      await createPickupContact({
        studentId: selectedChildId,
        fullName: pickupName.trim(),
        relation: pickupRelation.trim() || 'Yetkili Yakın',
        phone: pickupPhone.trim(),
        identityNote: pickupNote.trim() || undefined,
        isActive: true,
      });
      setPickupModalOpen(false);
      setPickupName('');
      setPickupRelation('');
      setPickupPhone('');
      setPickupNote('');
      Alert.alert('Başarılı', 'Yetkili kişi kaydedildi.');
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Kayıt oluşturulamadı');
    } finally {
      setSavingPickup(false);
    }
  }

  async function handleDeletePickup(id: string, name: string): Promise<void> {
    Alert.alert('Yetkiliyi Sil', `${name} yetkili listesinden silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePickupContact(id);
            void loadData();
          } catch (err) {
            Alert.alert('Hata', 'Silinemedi');
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer
      icon="shield-checkmark"
      title="Bakım & Güvenlik"
      subtitle="İlaç verme takibi ve güvenli teslimat onayları"
    >
      {/* Child Switcher if multiple */}
      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
          {children.map((c) => {
            const isSel = c.student.id === selectedChildId;
            return (
              <Pressable
                key={c.student.id}
                onPress={() => setSelectedChildId(c.student.id)}
                style={[styles.childChip, isSel && styles.childChipActive]}
              >
                <Text style={[styles.childChipText, isSel && styles.childChipTextActive]}>
                  {c.student.firstName} {c.student.lastName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <>
          {/* İLAÇ TAKİBİ BÖLÜMÜ */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>💊 Günlük İlaç Takibi</Text>
              <Text style={styles.sectionSubtitle}>Çocuğunuzun kreşte alacağı ilaçlar</Text>
            </View>
            <Pressable
              onPress={() => setMedModalOpen(true)}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="add" size={16} color={colors.textInverse} />
              <Text style={styles.addBtnText}>İlaç Ekle</Text>
            </Pressable>
          </View>

          {medications.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyContent}>
                <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Kayıtlı İlaç Yok</Text>
                <Text style={styles.emptyDesc}>
                  Bugün verilmesi gereken herhangi bir ilaç kaydı bulunmuyor.
                </Text>
              </View>
            </Card>
          ) : (
            medications.map((item) => {
              const badge = MED_STATUS_BADGE[item.status] || MED_STATUS_BADGE.REQUESTED;
              return (
                <Card key={item.id} variant="accent" style={styles.recordCard}>
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
                  {item.givenAt && (
                    <Text style={styles.givenTimeText}>
                      Veriliş Saati: {new Date(item.givenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </Card>
              );
            })
          )}

          {/* GÜVENLİ TESLİMAT BÖLÜMÜ */}
          <View style={[styles.sectionHeaderRow, { marginTop: spacing.xxl }]}>
            <View>
              <Text style={styles.sectionTitle}>🛡️ Güvenli Teslimat</Text>
              <Text style={styles.sectionSubtitle}>Çocuğu teslim almaya yetkili kişiler</Text>
            </View>
            <Pressable
              onPress={() => setPickupModalOpen(true)}
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: colors.primaryDark },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name="add" size={16} color={colors.textInverse} />
              <Text style={styles.addBtnText}>Yetkili Ekle</Text>
            </Pressable>
          </View>

          {contacts.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyContent}>
                <Ionicons name="shield-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Yetkili Kişi Yok</Text>
                <Text style={styles.emptyDesc}>
                  Öğrenciyi teslim alabilecek yakınları veya servisi buradan ekleyebilirsiniz.
                </Text>
              </View>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.personHeaderRow}>
                    <View style={styles.personAvatar}>
                      <Ionicons name="person" size={16} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.personName}>{contact.fullName}</Text>
                      <Text style={styles.personRelation}>{contact.relation}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => void handleDeletePickup(contact.id, contact.fullName)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
                {contact.phone && <Text style={styles.phoneText}>Telefon: {contact.phone}</Text>}
                {contact.identityNote && (
                  <Text style={styles.noteText}>Not: {contact.identityNote}</Text>
                )}
              </Card>
            ))
          )}
        </>
      )}

      {/* MODAL: YENİ İLAÇ TALEBİ */}
      <Modal visible={medModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💊 Yeni İlaç Bildirimi</Text>
              <Pressable onPress={() => setMedModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>İlaç Adı *</Text>
            <TextInput
              style={styles.modalInput}
              value={medName}
              onChangeText={setMedName}
              placeholder="Örn: Calpol 120mg Şurup"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Dozaj / Miktar *</Text>
            <TextInput
              style={styles.modalInput}
              value={medDosage}
              onChangeText={setMedDosage}
              placeholder="Örn: 1 Ölçek (5ml) veya 1 Tablet"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Verilme Saati</Text>
            <TextInput
              style={styles.modalInput}
              value={medTime}
              onChangeText={setMedTime}
              placeholder="Örn: 13:30 (Öğle yemeği sonrası)"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Ek Talimat / Not</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              value={medInstructions}
              onChangeText={setMedInstructions}
              multiline
              placeholder="Örn: Tok karnına verilecek, buzdolabında saklanmalı."
              placeholderTextColor={colors.textMuted}
            />

            <Pressable
              style={({ pressed }) => [
                styles.modalSubmitBtn,
                savingMed && { opacity: 0.6 },
                pressed && { opacity: 0.88 },
              ]}
              onPress={() => void handleCreateMedication()}
              disabled={savingMed}
            >
              {savingMed ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.modalSubmitText}>İlaç Talebini Kaydet</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL: YENİ TESLİMAT İZNİ */}
      <Modal visible={pickupModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛡️ Yeni Teslimat Yetkilendirmesi</Text>
              <Pressable onPress={() => setPickupModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Teslim Alacak Kişinin Adı Soyadı *</Text>
            <TextInput
              style={styles.modalInput}
              value={pickupName}
              onChangeText={setPickupName}
              placeholder="Örn: Fatma Yılmaz"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Yakınlık Derecesi</Text>
            <TextInput
              style={styles.modalInput}
              value={pickupRelation}
              onChangeText={setPickupRelation}
              placeholder="Örn: Anneanne, Teyze, Servis Şoförü"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Telefon Numarası</Text>
            <TextInput
              style={styles.modalInput}
              value={pickupPhone}
              onChangeText={setPickupPhone}
              keyboardType="phone-pad"
              placeholder="05xx xxx xx xx"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Açıklama / Not</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              value={pickupNote}
              onChangeText={setPickupNote}
              multiline
              placeholder="Bugün doktor randevusu sonrası teslim alacaktır."
              placeholderTextColor={colors.textMuted}
            />

            <Pressable
              style={({ pressed }) => [
                styles.modalSubmitBtn,
                { backgroundColor: colors.primaryDark },
                savingPickup && { opacity: 0.6 },
                pressed && { opacity: 0.88 },
              ]}
              onPress={() => void handleCreatePickup()}
              disabled={savingPickup}
            >
              {savingPickup ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.modalSubmitText}>Yetkilendirmeyi Kaydet</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  childScroll: {
    marginBottom: spacing.md,
  },
  childChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  childChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  childChipTextActive: {
    color: colors.textInverse,
  },
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
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    gap: 4,
  },
  addBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
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
    color: colors.amberText,
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
  givenTimeText: {
    ...typography.tiny,
    color: colors.successText,
    fontWeight: '700',
    marginTop: spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  modalSubmitText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
});
