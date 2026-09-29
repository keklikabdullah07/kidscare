import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DailyMenu, ParentChildOverview } from '@kidscare/shared-types';
import { fetchParentChildrenOverview } from '../api/parent';
import { getDailyMenu } from '../api/daily-menus';
import { DailyMenuModal } from '../daily-menus/DailyMenuModal';
import { ActivityGalleryModal } from '../activities/ActivityGalleryModal';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, shadows, spacing, typography } from '../theme';

export function ParentHomeScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childrenData, setChildrenData] = useState<ParentChildOverview[]>([]);
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Modals
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [passportModalVisible, setPassportModalVisible] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);

  const selectedDate = new Date().toISOString().split('T')[0] ?? '';

  const loadData = async () => {
    try {
      const [data, menuRes] = await Promise.all([
        fetchParentChildrenOverview(selectedDate).catch(() => []),
        getDailyMenu(selectedDate).catch(() => ({ menu: null, allergenWarnings: [] })),
      ]);
      setChildrenData(data);
      setDailyMenu(menuRes.menu);
      if (
        data.length > 0 &&
        (!selectedChildId || !data.some((c) => c.student.id === selectedChildId))
      ) {
        setSelectedChildId(data[0]?.student.id ?? null);
      }
    } catch {
      // quiet failover
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    void loadData();
  }, [selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const activeChild = Array.isArray(childrenData)
    ? childrenData.find((c) => c?.student?.id === selectedChildId) || childrenData[0]
    : undefined;

  const getMoodLabel = (mood?: string | null) => {
    switch (mood) {
      case 'HAPPY':
        return '😊 Çok Mutlu';
      case 'CALM':
        return '😌 Sakin & Huzurlu';
      case 'ENERGETIC':
        return '⚡ Enerjik & Hareketli';
      case 'TIRED':
        return '🥱 Yorgun';
      case 'CRANKY':
        return '😤 Huysuz';
      case 'SAD':
        return '😢 Üzgün';
      default:
        return mood || 'Belirtilmedi';
    }
  };

  const getMealBadge = (level?: string | null) => {
    switch (level) {
      case 'ALL':
        return { text: 'Hepsi', bg: colors.successBg, fg: colors.successText };
      case 'HALF':
        return { text: 'Yarısı', bg: colors.amberLight, fg: colors.amberText };
      case 'LITTLE':
        return { text: 'Az', bg: colors.dangerBg, fg: colors.dangerText };
      case 'NONE':
        return { text: 'Yemedi', bg: colors.surfaceMuted, fg: colors.textSecondary };
      default:
        return { text: 'Belirtilmedi', bg: colors.surfaceMuted, fg: colors.textMuted };
    }
  };

  // Match allergens with today's menu
  const childAllergies = activeChild?.student.passport?.allergies ?? [];
  const menuAllergens = dailyMenu?.allergens ?? [];
  const matchedAllergies = childAllergies.filter((alg) =>
    menuAllergens.some(
      (m) =>
        m.toLowerCase().includes(alg.toLowerCase()) ||
        alg.toLowerCase().includes(m.toLowerCase()),
    ),
  );

  const attStatus = activeChild?.todayAttendance?.status;

  return (
    <ScreenContainer
      icon="sunny"
      title={
        activeChild
          ? `Merhaba, ${activeChild.student.firstName}'in Ailesi`
          : 'KidsCare Veli Paneli'
      }
      subtitle="Bugünkü akış, günlük karne, beslenme ve okul durumu"
      scrollable={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Günün bülteni yükleniyor...</Text>
          </View>
        ) : !activeChild ? (
          <Card>
            <EmptyState
              icon="👶"
              title="Kayıtlı Öğrenci Bulunamadı"
              description="Hesabınıza bağlı bir öğrenci kaydı henüz tanımlanmamış. Lütfen kreş idaresi ile iletişime geçiniz."
            />
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {/* Multi-child Selector (if parent has multiple kids enrolled) */}
            {childrenData.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.childTabs}
              >
                {childrenData.map((child) => {
                  const isSelected = child.student.id === activeChild.student.id;
                  return (
                    <Pressable
                      key={child.student.id}
                      onPress={() => setSelectedChildId(child.student.id)}
                      style={[styles.childTab, isSelected && styles.childTabActive]}
                    >
                      <Text
                        style={[
                          styles.childTabText,
                          isSelected && styles.childTabTextActive,
                        ]}
                      >
                        👶 {child.student.firstName} {child.student.lastName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* 1. Hero Status Card */}
            <Card variant="primary" style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>
                    {activeChild.student.firstName.charAt(0)}
                    {activeChild.student.lastName.charAt(0)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.heroName}>
                    {activeChild.student.firstName} {activeChild.student.lastName}
                  </Text>
                  <Text style={styles.heroDate}>
                    {new Date(selectedDate).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    attStatus === 'PRESENT' && styles.statusBadgePresent,
                    attStatus === 'LEFT' && styles.statusBadgeLeft,
                    attStatus === 'EXCUSED' && styles.statusBadgeExcused,
                    attStatus === 'ABSENT' && styles.statusBadgeAbsent,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      attStatus === 'PRESENT' && styles.statusBadgeTextPresent,
                      attStatus === 'LEFT' && styles.statusBadgeTextLeft,
                      attStatus === 'EXCUSED' && styles.statusBadgeTextExcused,
                      attStatus === 'ABSENT' && styles.statusBadgeTextAbsent,
                    ]}
                  >
                    {attStatus === 'PRESENT'
                      ? '🟢 Okulda'
                      : attStatus === 'LEFT'
                        ? '🔵 Teslim Edildi'
                        : attStatus === 'EXCUSED'
                          ? '🟡 İzinli'
                          : attStatus === 'ABSENT'
                            ? '⚪ Gelmedi'
                            : '⏳ Bekleniyor'}
                  </Text>
                </View>
              </View>

              {/* Attendance Times Row */}
              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeTitle}>GİRİŞ SAATİ</Text>
                  <Text style={styles.timeValue}>
                    {activeChild.todayAttendance?.checkInTime || '--:--'}
                  </Text>
                </View>

                <View style={styles.timeDivider} />

                <View style={styles.timeCol}>
                  <Text style={styles.timeTitle}>ÇIKIŞ SAATİ</Text>
                  <Text style={styles.timeValue}>
                    {activeChild.todayAttendance?.checkOutTime || '--:--'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Personalized Allergy Alert Banner */}
            {matchedAllergies.length > 0 && (
              <Card style={styles.allergyBanner}>
                <View style={styles.allergyContent}>
                  <Ionicons name="warning" size={24} color={colors.amberDark} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.allergyTitle}>Alerji Uyarısı!</Text>
                    {matchedAllergies.map((w, idx) => (
                      <Text key={idx} style={styles.allergyText}>
                        • Bugünün menüsünde {activeChild.student.firstName}'in alerjisi olan{' '}
                        <Text style={{ fontWeight: '700' }}>{w}</Text> bulunuyor!
                      </Text>
                    ))}
                  </View>
                </View>
              </Card>
            )}

            {/* Quick Action Navigation Row */}
            <View style={styles.actionRow}>
              <Pressable style={styles.actionBtn} onPress={() => setMenuModalVisible(true)}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.amberLight }]}>
                  <Text style={{ fontSize: 20 }}>🍲</Text>
                </View>
                <Text style={styles.actionBtnLabel}>Yemek Menüsü</Text>
              </Pressable>

              <Pressable style={styles.actionBtn} onPress={() => setGalleryModalVisible(true)}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ fontSize: 20 }}>📸</Text>
                </View>
                <Text style={styles.actionBtnLabel}>Foto Galeri</Text>
              </Pressable>

              <Pressable style={styles.actionBtn} onPress={() => setPassportModalVisible(true)}>
                <View style={[styles.actionIconWrap, { backgroundColor: colors.infoBg }]}>
                  <Text style={{ fontSize: 20 }}>🩺</Text>
                </View>
                <Text style={styles.actionBtnLabel}>Pasaport</Text>
              </Pressable>
            </View>

            {/* 2. Daily Report Card */}
            <Card style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 20 }}>📝</Text>
                  <Text style={styles.cardTitle}>Günlük Karne & Akış</Text>
                </View>
                <View
                  style={[
                    styles.reportDoneBadge,
                    activeChild.todayDailyReport
                      ? styles.reportDoneBadgeSuccess
                      : styles.reportDoneBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.reportDoneBadgeText,
                      activeChild.todayDailyReport
                        ? styles.reportDoneBadgeTextSuccess
                        : styles.reportDoneBadgeTextPending,
                    ]}
                  >
                    {activeChild.todayDailyReport ? 'Tamamlandı' : 'Bekleniyor'}
                  </Text>
                </View>
              </View>

              {activeChild.todayDailyReport ? (
                <View style={styles.reportContent}>
                  {/* Mood Row */}
                  <View style={styles.moodRow}>
                    <Text style={styles.reportLabel}>Günün Ruh Hali:</Text>
                    <Text style={styles.moodValue}>
                      {getMoodLabel(activeChild.todayDailyReport.mood)}
                    </Text>
                  </View>

                  {/* Meals Breakdown */}
                  <Text style={[styles.subSectionTitle, { marginTop: spacing.md }]}>
                    🍽️ Yemek Tüketimi
                  </Text>
                  <View style={styles.mealsRow}>
                    <View style={styles.mealBox}>
                      <Text style={styles.mealLabel}>Kahvaltı</Text>
                      <View
                        style={[
                          styles.mealPill,
                          {
                            backgroundColor: getMealBadge(
                              activeChild.todayDailyReport.meals?.breakfast,
                            ).bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.mealPillText,
                            {
                              color: getMealBadge(
                                activeChild.todayDailyReport.meals?.breakfast,
                              ).fg,
                            },
                          ]}
                        >
                          {getMealBadge(activeChild.todayDailyReport.meals?.breakfast).text}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.mealBox}>
                      <Text style={styles.mealLabel}>Öğle</Text>
                      <View
                        style={[
                          styles.mealPill,
                          {
                            backgroundColor: getMealBadge(
                              activeChild.todayDailyReport.meals?.lunch,
                            ).bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.mealPillText,
                            {
                              color: getMealBadge(activeChild.todayDailyReport.meals?.lunch).fg,
                            },
                          ]}
                        >
                          {getMealBadge(activeChild.todayDailyReport.meals?.lunch).text}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.mealBox}>
                      <Text style={styles.mealLabel}>İkindi</Text>
                      <View
                        style={[
                          styles.mealPill,
                          {
                            backgroundColor: getMealBadge(
                              activeChild.todayDailyReport.meals?.afternoonSnack,
                            ).bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.mealPillText,
                            {
                              color: getMealBadge(
                                activeChild.todayDailyReport.meals?.afternoonSnack,
                              ).fg,
                            },
                          ]}
                        >
                          {
                            getMealBadge(activeChild.todayDailyReport.meals?.afternoonSnack)
                              .text
                          }
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Nap & Potty Stats */}
                  <View style={styles.miniStatsRow}>
                    <View style={styles.miniStatBox}>
                      <Text style={styles.miniStatEmoji}>😴</Text>
                      <View>
                        <Text style={styles.miniStatTitle}>Uyku & Dinlenme</Text>
                        <Text style={styles.miniStatValue}>
                          {activeChild.todayDailyReport.naps?.startTime &&
                          activeChild.todayDailyReport.naps?.endTime
                            ? `${activeChild.todayDailyReport.naps.startTime} - ${activeChild.todayDailyReport.naps.endTime}`
                            : activeChild.todayDailyReport.naps?.quality === 'GOOD'
                              ? 'Deliksiz uyudu'
                              : 'Uyumadı'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.miniStatBox}>
                      <Text style={styles.miniStatEmoji}>🚽</Text>
                      <View>
                        <Text style={styles.miniStatTitle}>Tuvalet / Bez</Text>
                        <Text style={styles.miniStatValue}>
                          {activeChild.todayDailyReport.potty &&
                          activeChild.todayDailyReport.potty.length > 0
                            ? `${activeChild.todayDailyReport.potty.length} kayıt`
                            : 'Düzenli'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Teacher Note */}
                  {activeChild.todayDailyReport.teacherNote && (
                    <View style={styles.teacherNoteBox}>
                      <Text style={styles.teacherNoteHeader}>💬 Öğretmenin Gün Sonu Notu</Text>
                      <Text style={styles.teacherNoteText}>
                        "{activeChild.todayDailyReport.teacherNote}"
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyReportBox}>
                  <Text style={styles.emptyReportEmoji}>⏳</Text>
                  <Text style={styles.emptyReportTitle}>Rapor Hazırlanıyor</Text>
                  <Text style={styles.emptyReportText}>
                    Öğretmenlerimiz gün sonuna doğru aktiviteleri ve günlük karne raporunu sisteme
                    girecektir.
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Daily Menu Modal */}
      <DailyMenuModal
        date={selectedDate}
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />

      {/* Activity Gallery Modal */}
      <ActivityGalleryModal
        visible={galleryModalVisible}
        onClose={() => setGalleryModalVisible(false)}
        userRole="PARENT"
        classroom={activeChild?.student?.classroomId ?? undefined}
      />

      {/* Student Passport Modal */}
      <Modal
        visible={passportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPassportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛡️ Sağlık & Gelişim Pasaportu</Text>
              <Pressable onPress={() => setPassportModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.passportRow}>
                <Text style={styles.passportLabel}>Kan Grubu</Text>
                <Text style={styles.passportValue}>
                  {activeChild?.student.passport?.bloodType || 'Belirtilmedi'}
                </Text>
              </View>

              <View style={styles.passportRow}>
                <Text style={styles.passportLabel}>Bilinen Alerjiler</Text>
                <Text
                  style={[
                    styles.passportValue,
                    activeChild?.student.passport?.allergies?.length
                      ? { color: colors.danger, fontWeight: '700' }
                      : {},
                  ]}
                >
                  {activeChild?.student.passport?.allergies?.length
                    ? activeChild.student.passport.allergies.join(', ')
                    : 'Kayıtlı alerji yok'}
                </Text>
              </View>

              <View style={styles.passportRow}>
                <Text style={styles.passportLabel}>Kronik Rahatsızlık</Text>
                <Text style={styles.passportValue}>
                  {activeChild?.student.passport?.chronicConditions?.length
                    ? activeChild.student.passport.chronicConditions.join(', ')
                    : 'Yok'}
                </Text>
              </View>

              <View style={styles.passportRow}>
                <Text style={styles.passportLabel}>Acil Durum Doktoru</Text>
                <Text style={styles.passportValue}>
                  {activeChild?.student.passport?.doctorName
                    ? `${activeChild.student.passport.doctorName} (${activeChild.student.passport.doctorPhone || 'Tel Yok'})`
                    : 'Belirtilmedi'}
                </Text>
              </View>

              {activeChild?.student.passport?.specialNotes && (
                <View style={[styles.passportRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.passportLabel}>Özel Notlar</Text>
                  <Text style={styles.passportValue}>
                    {activeChild.student.passport.specialNotes}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  // Multi-child Selector
  childTabs: {
    marginBottom: spacing.xs,
  },
  childTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.sm,
  },
  childTabActive: {
    backgroundColor: colors.primary,
  },
  childTabText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  childTabTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },

  // Hero Card
  heroCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  heroAvatarText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  heroName: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontSize: 16,
  },
  heroDate: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  statusBadgePresent: { backgroundColor: colors.successBg },
  statusBadgeLeft: { backgroundColor: colors.infoBg },
  statusBadgeExcused: { backgroundColor: colors.amberLight },
  statusBadgeAbsent: { backgroundColor: colors.surfaceMuted },

  statusBadgeText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  statusBadgeTextPresent: { color: colors.successText },
  statusBadgeTextLeft: { color: colors.infoText },
  statusBadgeTextExcused: { color: colors.amberText },
  statusBadgeTextAbsent: { color: colors.textSecondary },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  timeCol: {
    flex: 1,
    alignItems: 'center',
  },
  timeTitle: {
    ...typography.tiny,
    color: colors.textMuted,
    marginBottom: 2,
  },
  timeValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  timeDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
  },

  // Allergy Banner
  allergyBanner: {
    borderColor: colors.amberBorder,
    backgroundColor: colors.amberLight,
  },
  allergyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  allergyTitle: {
    ...typography.bodyBold,
    color: colors.amberDark,
    marginBottom: 2,
  },
  allergyText: {
    ...typography.caption,
    color: colors.amberText,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionBtnLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },

  // Report Card
  reportCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  reportDoneBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  reportDoneBadgeSuccess: { backgroundColor: colors.successBg },
  reportDoneBadgePending: { backgroundColor: colors.surfaceMuted },
  reportDoneBadgeText: {
    ...typography.captionBold,
    fontSize: 10,
  },
  reportDoneBadgeTextSuccess: { color: colors.successText },
  reportDoneBadgeTextPending: { color: colors.textSecondary },

  reportContent: {
    gap: spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reportLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  moodValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  subSectionTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  mealsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mealBox: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  mealLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  mealPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  mealPillText: {
    ...typography.captionBold,
    fontSize: 11,
  },

  miniStatsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  miniStatBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  miniStatEmoji: {
    fontSize: 22,
  },
  miniStatTitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  miniStatValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },

  teacherNoteBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  teacherNoteHeader: {
    ...typography.captionBold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  teacherNoteText: {
    ...typography.body,
    color: colors.primaryDark,
    fontStyle: 'italic',
  },

  emptyReportBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyReportEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyReportTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  emptyReportText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 260,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalSheet: {
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
  passportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  passportLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  passportValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
});
