import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Attendance, DevelopmentDomain, Student } from '@kidscare/shared-types';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { getAttendanceByDate } from '../api/attendance';
import { listStudents } from '../api/students';
import { createObservation } from '../api/development';
import { getTenantMe } from '../api/tenants';
import { DailyMenuModal } from '../daily-menus/DailyMenuModal';
import { CreateActivityModal } from '../activities/CreateActivityModal';
import { ActivityGalleryModal } from '../activities/ActivityGalleryModal';
import { TeamModal } from './TeamModal';
import { colors, radii, shadows, spacing, typography } from '../theme';

const DOMAINS: { key: DevelopmentDomain; label: string }[] = [
  { key: 'BILISSEL', label: 'Bilişsel Gelişim' },
  { key: 'MOTOR', label: 'Motor Beceriler' },
  { key: 'DIL', label: 'Dil & İletişim' },
  { key: 'SOSYAL_DUYGUSAL', label: 'Sosyal-Duygusal' },
  { key: 'SANAT', label: 'Sanat & Yaratıcılık' },
  { key: 'OZ_BAKIM', label: 'Özbakım Becerileri' },
];

export function StaffMoreTab(): React.ReactElement {
  const { logout, state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [tenantName, setTenantName] = useState('Demo Kreş');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  // Modals
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [createActivityVisible, setCreateActivityVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);

  // New Observation Modal
  const [observationModalVisible, setObservationModalVisible] = useState(false);
  const [obsStudentId, setObsStudentId] = useState('');
  const [obsDomain, setObsDomain] = useState<DevelopmentDomain>('BILISSEL');
  const [obsSkillName, setObsSkillName] = useState('');
  const [obsText, setObsText] = useState('');
  const [obsIsParentVisible, setObsIsParentVisible] = useState(true);
  const [savingObs, setSavingObs] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  const loadData = async () => {
    try {
      const [stuRes, attRes, tenantRes] = await Promise.all([
        listStudents().catch(() => []),
        getAttendanceByDate(todayStr).catch(() => []),
        getTenantMe().catch(() => null),
      ]);
      setStudents(stuRes);
      setAttendance(attRes);
      if (tenantRes?.name) {
        setTenantName(tenantRes.name);
      }
    } catch {
      // quiet
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan güvenli çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const handleSaveObservation = async () => {
    if (!obsStudentId) {
      Alert.alert('Eksik Bilgi', 'Lütfen ilgili öğrenciyi seçiniz.');
      return;
    }
    if (!obsSkillName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen kazanım / beceri başlığı giriniz.');
      return;
    }
    if (!obsText.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen gözlem açıklamasını yazınız.');
      return;
    }

    setSavingObs(true);
    try {
      await createObservation({
        studentId: obsStudentId,
        domain: obsDomain,
        skillName: obsSkillName.trim(),
        observation: obsText.trim(),
        isParentVisible: obsIsParentVisible,
      });

      setObservationModalVisible(false);
      setObsSkillName('');
      setObsText('');
      Alert.alert('Kaydedildi', 'Gelişim gözlemi başarıyla eklendi.');
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Gözlem kaydedilemedi');
    } finally {
      setSavingObs(false);
    }
  };

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const leftCount = attendance.filter((a) => a.status === 'LEFT').length;

  return (
    <ScreenContainer
      icon="grid"
      title="Yönetim & Araçlar"
      subtitle="Kreş durumu, hızlı işlemler, etkinlikler ve profil"
      scrollable={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {/* Kullanıcı Kimlik Kartı */}
        <Card variant="primary" style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {state.status === 'authenticated' && state.user.email
                  ? state.user.email.slice(0, 2).toUpperCase()
                  : 'KC'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {state.status === 'authenticated' ? state.user.email : 'Personel'}
              </Text>
              <View style={styles.roleRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {state.status === 'authenticated' ? state.user.role : 'TEACHER'}
                  </Text>
                </View>
                <Text style={styles.tenantText}>{tenantName}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Canlı Durum Kartları (KPI) */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiBox, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={styles.kpiValue}>{students.length}</Text>
            <Text style={styles.kpiLabel}>Toplam Kayıt</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.kpiValue, { color: colors.successText }]}>{presentCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.successText }]}>Şu An İçeride</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.infoBg }]}>
            <Text style={[styles.kpiValue, { color: colors.infoText }]}>{leftCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.infoText }]}>Teslim Edildi</Text>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Hızlı İşlemler & Araçlar</Text>
        </View>

        {/* 1. Yemek Menüsü */}
        <Card onPress={() => setMenuModalVisible(true)} style={styles.menuActionCard}>
          <View style={styles.menuItem}>
            <View style={[styles.iconWrap, { backgroundColor: colors.amberLight }]}>
              <Text style={{ fontSize: 20 }}>🍲</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Günün & Aylık Yemek Menüsü</Text>
              <Text style={styles.menuSub}>Yemek listesini ve alerjen uyarılarını incele</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        {/* 2. Yeni Etkinlik Paylaşımı */}
        <Card onPress={() => setCreateActivityVisible(true)} style={styles.menuActionCard}>
          <View style={styles.menuItem}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 20 }}>📸</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Yeni Sınıf Etkinliği Paylaş</Text>
              <Text style={styles.menuSub}>Fotoğraf yükle, etiketle ve velilerle paylaş</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        {/* 3. Etkinlik Albümünü Görüntüle */}
        <Card onPress={() => setGalleryVisible(true)} style={styles.menuActionCard}>
          <View style={styles.menuItem}>
            <View style={[styles.iconWrap, { backgroundColor: colors.infoBg }]}>
              <Text style={{ fontSize: 20 }}>🎨</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Sınıf Fotoğraf Albümü</Text>
              <Text style={styles.menuSub}>Yüklenen tüm etkinlik fotoğraflarını incele</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        {/* 4. Yeni Gelişim Gözlemi Kaydet */}
        <Card
          onPress={() => {
            setObsStudentId(students[0]?.id ?? '');
            setObsDomain('BILISSEL');
            setObsSkillName('');
            setObsText('');
            setObsIsParentVisible(true);
            setObservationModalVisible(true);
          }}
          style={styles.menuActionCard}
        >
          <View style={styles.menuItem}>
            <View style={[styles.iconWrap, { backgroundColor: colors.successBg }]}>
              <Text style={{ fontSize: 20 }}>📈</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Gelişim & Kazanım Kaydı Ekle</Text>
              <Text style={styles.menuSub}>
                Öğrenci beceri kazanımı ve öğretmen gözlemi gir
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        {/* 5. Personel & Ekip */}
        <Card onPress={() => setTeamModalVisible(true)} style={styles.menuActionCard}>
          <View style={styles.menuItem}>
            <View style={[styles.iconWrap, { backgroundColor: colors.amberLight }]}>
              <Text style={{ fontSize: 20 }}>👥</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Öğretmenler & Personel Ekibi</Text>
              <Text style={styles.menuSub}>Ekip listesini görüntüle ve yeni personel davet et</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        {/* Sistem & Güvenlik */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔒 Sistem & Oturum</Text>
        </View>

        <Card
          onPress={handleLogout}
          variant="muted"
          style={{ borderColor: colors.dangerBg }}
        >
          <View style={styles.logoutRow}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Güvenli Oturumu Kapat</Text>
          </View>
        </Card>

        <Text style={styles.versionFooter}>KidsCare Mobile v2.0 • Impeccable Design</Text>
      </ScrollView>

      {/* Daily Menu Modal */}
      <DailyMenuModal
        date={todayStr}
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />

      {/* Create Activity Modal */}
      <CreateActivityModal
        visible={createActivityVisible}
        onClose={() => setCreateActivityVisible(false)}
        onCreated={() => {
          setCreateActivityVisible(false);
          Alert.alert('Harika', 'Yeni etkinlik başarıyla yayınlandı!');
        }}
      />

      {/* Activity Gallery Modal */}
      <ActivityGalleryModal
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
        userRole="TEACHER"
      />

      {/* New Observation Modal */}
      <Modal
        visible={observationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setObservationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Gelişim Gözlemi Ekle</Text>
                <Pressable onPress={() => setObservationModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Öğrenci Seçimi */}
              <Text style={styles.fieldLabel}>Öğrenci *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: spacing.md }}
              >
                {students.map((stu) => {
                  const isSel = stu.id === obsStudentId;
                  return (
                    <Pressable
                      key={stu.id}
                      style={[styles.stuChip, isSel && styles.stuChipActive]}
                      onPress={() => setObsStudentId(stu.id)}
                    >
                      <Text style={[styles.stuChipText, isSel && styles.stuChipTextActive]}>
                        {stu.firstName} {stu.lastName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Alan (Domain) */}
              <Text style={styles.fieldLabel}>Gelişim Alanı *</Text>
              <View style={styles.domainGrid}>
                {DOMAINS.map((d) => {
                  const isSel = d.key === obsDomain;
                  return (
                    <Pressable
                      key={d.key}
                      style={[styles.domainChip, isSel && styles.domainChipActive]}
                      onPress={() => setObsDomain(d.key)}
                    >
                      <Text
                        style={[
                          styles.domainChipText,
                          isSel && styles.domainChipTextActive,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Kazanım / Beceri Başlığı */}
              <Text style={styles.fieldLabel}>Kazanım / Beceri Başlığı *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Örn: 1-10 Arası Nesneleri Sayma"
                value={obsSkillName}
                onChangeText={setObsSkillName}
                placeholderTextColor={colors.textMuted}
              />

              {/* Gözlem Notu */}
              <Text style={styles.fieldLabel}>Gözlem Açıklaması *</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholder="Öğrencinin bu becerideki başarısı ve gösterdiği çaba..."
                value={obsText}
                onChangeText={setObsText}
                placeholderTextColor={colors.textMuted}
              />

              {/* Veliye Görünsün mü */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Veliye Göster</Text>
                  <Text style={styles.switchSub}>
                    Velinin mobil uygulamasında bu gözlemi görebilmesini sağlar
                  </Text>
                </View>
                <Switch
                  value={obsIsParentVisible}
                  onValueChange={setObsIsParentVisible}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setObservationModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Vazgeç</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalBtn,
                    styles.modalSaveBtn,
                    savingObs && { opacity: 0.6 },
                  ]}
                  onPress={handleSaveObservation}
                  disabled={savingObs}
                >
                  {savingObs ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={styles.modalSaveText}>Gözlemi Kaydet</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Team Modal */}
      <TeamModal
        visible={teamModalVisible}
        onClose={() => setTeamModalVisible(false)}
        currentUserRole={state.status === 'authenticated' ? state.user.role : undefined}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  userCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontSize: 16,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  roleBadgeText: {
    ...typography.tiny,
    color: colors.textInverse,
  },
  tenantText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // KPI Row
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  kpiBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
  },
  kpiValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  menuActionCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  menuSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },

  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.danger,
  },

  versionFooter: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg,
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
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },

  stuChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.sm,
  },
  stuChipActive: {
    backgroundColor: colors.primary,
  },
  stuChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stuChipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },

  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  domainChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  domainChipActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  domainChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  domainChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  switchSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: colors.surfaceMuted,
  },
  modalCancelText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
});
