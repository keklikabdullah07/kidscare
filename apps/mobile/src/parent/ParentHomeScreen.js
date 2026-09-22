import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { fetchParentChildrenOverview } from '../api/parent';
import { getDailyMenu } from '../api/daily-menus';
import { useAuth } from '../auth/AuthContext';
import { DailyMenuModal } from '../daily-menus/DailyMenuModal';
import { ActivityGalleryModal } from '../activities/ActivityGalleryModal';
import { colors, spacing } from '../theme';
export function ParentHomeScreen() {
    const { logout, state: authState } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [childrenData, setChildrenData] = useState([]);
    const [dailyMenu, setDailyMenu] = useState(null);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [selectedDate] = useState(new Date().toISOString().split('T')[0] ?? '');
    const [menuModalVisible, setMenuModalVisible] = useState(false);
    const [passportModalVisible, setPassportModalVisible] = useState(false);
    const [galleryModalVisible, setGalleryModalVisible] = useState(false);
    const loadData = async () => {
        try {
            const [data, menuRes] = await Promise.all([
                fetchParentChildrenOverview(selectedDate),
                getDailyMenu(selectedDate).catch(() => ({ menu: null, allergenWarnings: [] })),
            ]);
            setChildrenData(data);
            setDailyMenu(menuRes.menu);
            if (data.length > 0 &&
                (!selectedChildId || !data.some((c) => c.student.id === selectedChildId))) {
                setSelectedChildId(data[0]?.student.id ?? null);
            }
        }
        catch {
            // silent or empty
        }
        finally {
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
    const getMoodLabel = (mood) => {
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
    const getMealBadge = (level) => {
        switch (level) {
            case 'ALL':
                return { text: '🟢 Hepsi', bg: '#DCFCE7', fg: '#166534' };
            case 'HALF':
                return { text: '🟠 Yarısı', bg: '#FFEDD5', fg: '#9A3412' };
            case 'LITTLE':
                return { text: '🔴 Az', bg: '#FEE2E2', fg: '#991B1B' };
            case 'NONE':
                return { text: '❌ Yemedi', bg: '#F3F4F6', fg: '#374151' };
            default:
                return { text: '-', bg: '#F3F4F6', fg: '#6B7280' };
        }
    };
    // Match allergens
    const childAllergies = activeChild?.student.passport?.allergies ?? [];
    const menuAllergens = dailyMenu?.allergens ?? [];
    const matchedAllergies = childAllergies.filter((alg) => menuAllergens.some((m) => m.toLowerCase().includes(alg.toLowerCase()) || alg.toLowerCase().includes(m.toLowerCase())));
    return (<SafeAreaView style={styles.safeArea}>
      {/* App Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏡 Veli Portalı</Text>
          <Text style={styles.headerSubtitle}>
            {authState.status === 'authenticated' ? authState.user.email : ''}
          </Text>
        </View>
        <Pressable onPress={() => {
            void logout();
        }} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
        {loading ? (<View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary}/>
            <Text style={styles.loadingText}>Bilgiler yükleniyor...</Text>
          </View>) : !activeChild ? (<View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Kayıtlı Öğrenci Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              Hesabınıza bağlı bir öğrenci kaydı henüz tanımlanmamış.
            </Text>
          </View>) : (<>
            {/* Multi-child selector */}
            {childrenData.length > 1 && (<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childTabs}>
                {childrenData.map((child) => {
                    const isSelected = child.student.id === activeChild.student.id;
                    return (<Pressable key={child.student.id} onPress={() => setSelectedChildId(child.student.id)} style={[styles.childTab, isSelected && styles.childTabActive]}>
                      <Text style={[styles.childTabText, isSelected && styles.childTabTextActive]}>
                        👶 {child.student.firstName} {child.student.lastName}
                      </Text>
                    </Pressable>);
                })}
              </ScrollView>)}

            {/* Status Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.childName}>
                    {activeChild.student.firstName} {activeChild.student.lastName}
                  </Text>
                  <Text style={styles.dateLabel}>
                    {new Date(selectedDate).toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            })}
                  </Text>
                </View>

                {/* Status Indicator */}
                <View style={styles.statusBadge}>
                  {activeChild.todayAttendance?.status === 'PRESENT' ? (<View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]}/>
                      <Text style={styles.statusText}>Okulda</Text>
                    </View>) : activeChild.todayAttendance?.status === 'LEFT' ? (<View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: '#93C5FD' }]}/>
                      <Text style={styles.statusText}>Ayrıldı</Text>
                    </View>) : activeChild.todayAttendance?.status === 'ABSENT' ? (<View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: '#F87171' }]}/>
                      <Text style={styles.statusText}>Katılmadı</Text>
                    </View>) : activeChild.todayAttendance?.status === 'EXCUSED' ? (<View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: '#FBBF24' }]}/>
                      <Text style={styles.statusText}>İzinli</Text>
                    </View>) : (<View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: '#FDE047' }]}/>
                      <Text style={styles.statusText}>Henüz Gelmedi</Text>
                    </View>)}
                </View>
              </View>

              {/* Attendance Times */}
              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeTitle}>GİRİŞ SAATİ</Text>
                  <Text style={styles.timeValue}>
                    {activeChild.todayAttendance?.checkInTime || '--:--'}
                  </Text>
                </View>
                <View style={styles.timeDivider}/>
                <View style={styles.timeCol}>
                  <Text style={styles.timeTitle}>ÇIKIŞ SAATİ</Text>
                  <Text style={styles.timeValue}>
                    {activeChild.todayAttendance?.checkOutTime || '--:--'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Personalized Allergy Alert Banner */}
            {matchedAllergies.length > 0 && (<View style={styles.allergyBanner}>
                <Text style={styles.allergyIcon}>⚠️</Text>
                <View style={styles.allergyContent}>
                  <Text style={styles.allergyTitle}>Alerji Uyarısı!</Text>
                  {matchedAllergies.map((w, idx) => (<Text key={idx} style={styles.allergyText}>
                      • Menüde {activeChild.student.firstName}'in alerjisi olan{' '}
                      <Text style={{ fontWeight: '800' }}>{w}</Text> bulunuyor!
                    </Text>))}
                </View>
              </View>)}

            {/* Quick Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <Pressable onPress={() => setMenuModalVisible(true)} style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>🍲</Text>
                <Text style={styles.actionButtonText}>Yemek Listesi</Text>
              </Pressable>

              <Pressable onPress={() => setGalleryModalVisible(true)} style={[styles.actionButton, styles.actionButtonAccent]}>
                <Text style={styles.actionButtonIcon}>📸</Text>
                <Text style={styles.actionButtonText}>Foto Galeri</Text>
              </Pressable>

              <Pressable onPress={() => setPassportModalVisible(true)} style={[styles.actionButton, styles.actionButtonSecondary]}>
                <Text style={styles.actionButtonIcon}>🛡️</Text>
                <Text style={styles.actionButtonText}>Pasaport</Text>
              </Pressable>
            </View>

            {/* Daily Report Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📝 Günlük Karne</Text>
                {activeChild.todayDailyReport ? (<View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>Dolduruldu</Text>
                  </View>) : (<View style={styles.badgePending}>
                    <Text style={styles.badgePendingText}>Bekleniyor</Text>
                  </View>)}
              </View>

              {activeChild.todayDailyReport ? (<View style={styles.reportContent}>
                  {/* Mood */}
                  <View style={styles.reportItemRow}>
                    <Text style={styles.reportItemLabel}>Ruh Hali</Text>
                    <Text style={styles.reportItemVal}>
                      {getMoodLabel(activeChild.todayDailyReport.mood)}
                    </Text>
                  </View>

                  {/* Meals Breakdown */}
                  <View style={styles.mealsContainer}>
                    <Text style={styles.sectionSmallTitle}>🍽️ Yemek Durumu</Text>
                    <View style={styles.mealsRow}>
                      <View style={styles.mealBox}>
                        <Text style={styles.mealLabel}>Kahvaltı</Text>
                        <View style={[
                    styles.mealPill,
                    {
                        backgroundColor: getMealBadge(activeChild.todayDailyReport.meals?.breakfast).bg,
                    },
                ]}>
                          <Text style={[
                    styles.mealPillText,
                    {
                        color: getMealBadge(activeChild.todayDailyReport.meals?.breakfast)
                            .fg,
                    },
                ]}>
                            {getMealBadge(activeChild.todayDailyReport.meals?.breakfast).text}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.mealBox}>
                        <Text style={styles.mealLabel}>Öğle</Text>
                        <View style={[
                    styles.mealPill,
                    {
                        backgroundColor: getMealBadge(activeChild.todayDailyReport.meals?.lunch).bg,
                    },
                ]}>
                          <Text style={[
                    styles.mealPillText,
                    { color: getMealBadge(activeChild.todayDailyReport.meals?.lunch).fg },
                ]}>
                            {getMealBadge(activeChild.todayDailyReport.meals?.lunch).text}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.mealBox}>
                        <Text style={styles.mealLabel}>İkindi</Text>
                        <View style={[
                    styles.mealPill,
                    {
                        backgroundColor: getMealBadge(activeChild.todayDailyReport.meals?.afternoonSnack).bg,
                    },
                ]}>
                          <Text style={[
                    styles.mealPillText,
                    {
                        color: getMealBadge(activeChild.todayDailyReport.meals?.afternoonSnack).fg,
                    },
                ]}>
                            {getMealBadge(activeChild.todayDailyReport.meals?.afternoonSnack).text}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Nap & Potty stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statIcon}>😴</Text>
                      <View>
                        <Text style={styles.statTitle}>Uyku</Text>
                        <Text style={styles.statValue}>
                          {activeChild.todayDailyReport.naps?.startTime &&
                    activeChild.todayDailyReport.naps?.endTime
                    ? `${activeChild.todayDailyReport.naps.startTime} - ${activeChild.todayDailyReport.naps.endTime}`
                    : activeChild.todayDailyReport.naps?.quality === 'GOOD'
                        ? 'İyi uyudu'
                        : 'Uyumadı'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statBox}>
                      <Text style={styles.statIcon}>🚽</Text>
                      <View>
                        <Text style={styles.statTitle}>Tuvalet / Bez</Text>
                        <Text style={styles.statValue}>
                          {activeChild.todayDailyReport.potty &&
                    activeChild.todayDailyReport.potty.length > 0
                    ? `${activeChild.todayDailyReport.potty.length} kayıt`
                    : 'Normal'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Activities */}
                  {activeChild.todayDailyReport.activities &&
                    activeChild.todayDailyReport.activities.length > 0 && (<View style={styles.activitiesSection}>
                        <Text style={styles.sectionSmallTitle}>🎨 Aktiviteler</Text>
                        <View style={styles.activityChips}>
                          {activeChild.todayDailyReport.activities.map((act, i) => (<View key={i} style={styles.activityChip}>
                              <Text style={styles.activityChipText}>{act}</Text>
                            </View>))}
                        </View>
                      </View>)}

                  {/* Teacher Note */}
                  {activeChild.todayDailyReport.teacherNote && (<View style={styles.teacherNoteBox}>
                      <Text style={styles.teacherNoteHeader}>💬 Öğretmenin Notu</Text>
                      <Text style={styles.teacherNoteText}>
                        "{activeChild.todayDailyReport.teacherNote}"
                      </Text>
                    </View>)}
                </View>) : (<View style={styles.emptyReportBox}>
                  <Text style={styles.emptyReportEmoji}>⏳</Text>
                  <Text style={styles.emptyReportText}>
                    Öğretmenimiz gün sonuna doğru aktiviteleri ve günlük karne raporunu sisteme
                    girecektir.
                  </Text>
                </View>)}
            </View>
          </>)}
      </ScrollView>

      {/* Daily Menu Modal */}
      <DailyMenuModal date={selectedDate} visible={menuModalVisible} onClose={() => setMenuModalVisible(false)}/>

      {/* Passport Modal */}
      <Modal visible={passportModalVisible} transparent animationType="slide" onRequestClose={() => setPassportModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.passportCard}>
            <View style={styles.passportHeader}>
              <Text style={styles.passportTitle}>🛡️ Sağlık & Gelişim Pasaportu</Text>
              <Pressable onPress={() => setPassportModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.passportBody}>
              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Kan Grubu</Text>
                <Text style={styles.passportValue}>
                  {activeChild?.student.passport?.bloodType || 'Belirtilmedi'}
                </Text>
              </View>

              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Alerjiler</Text>
                {activeChild?.student.passport?.allergies &&
            activeChild.student.passport.allergies.length > 0 ? (<View style={styles.allergyTagList}>
                    {activeChild.student.passport.allergies.map((a, i) => (<View key={i} style={styles.allergyTag}>
                        <Text style={styles.allergyTagText}>⚠️ {a}</Text>
                      </View>))}
                  </View>) : (<Text style={styles.passportValueGreen}>✓ Kayıtlı alerji yok</Text>)}
              </View>

              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Özel Beslenme / Diyet</Text>
                <Text style={styles.passportValue}>
                  {activeChild?.student.passport?.dietaryRestrictions?.join(', ') || 'Yok'}
                </Text>
              </View>

              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Kronik Rahatsızlıklar</Text>
                <Text style={styles.passportValue}>
                  {activeChild?.student.passport?.chronicConditions?.join(', ') || 'Yok'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ActivityGalleryModal visible={galleryModalVisible} onClose={() => setGalleryModalVisible(false)} userRole={authState.status === 'authenticated' ? authState.user.role : undefined}/>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    logoutButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    logoutText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    centerBox: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: 14,
        color: '#64748B',
    },
    emptyBox: {
        padding: spacing.xl,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    childTabs: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    childTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    childTabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    childTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    childTabTextActive: {
        color: '#FFFFFF',
    },
    heroCard: {
        backgroundColor: '#2563EB',
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    childName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    dateLabel: {
        fontSize: 13,
        color: '#BFDBFE',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    timeRow: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
        paddingVertical: 10,
    },
    timeCol: {
        flex: 1,
        alignItems: 'center',
    },
    timeDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    timeTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#93C5FD',
        letterSpacing: 0.5,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 2,
    },
    allergyBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF3C7',
        borderWidth: 1.5,
        borderColor: '#F59E0B',
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: 10,
    },
    allergyIcon: {
        fontSize: 22,
    },
    allergyContent: {
        flex: 1,
    },
    allergyTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#92400E',
    },
    allergyText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#B45309',
        marginTop: 2,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    actionButtonSecondary: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    actionButtonAccent: {
        backgroundColor: '#EEF2FF',
        borderColor: '#C7D2FE',
    },
    actionButtonIcon: {
        fontSize: 16,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: spacing.sm,
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    badgeSuccess: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeSuccessText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#166534',
    },
    badgePending: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgePendingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    reportContent: {
        gap: spacing.md,
    },
    reportItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
    },
    reportItemLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    reportItemVal: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    mealsContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
    },
    sectionSmallTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    mealsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    mealBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    mealLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    mealPill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    mealPillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    statIcon: {
        fontSize: 20,
    },
    statTitle: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 2,
    },
    activitiesSection: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
    },
    activityChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    activityChip: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    activityChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    teacherNoteBox: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        padding: 12,
        borderRadius: 12,
    },
    teacherNoteHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 4,
    },
    teacherNoteText: {
        fontSize: 13,
        color: '#1E3A8A',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    emptyReportBox: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    emptyReportEmoji: {
        fontSize: 28,
        marginBottom: 6,
    },
    emptyReportText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    passportCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        maxHeight: '75%',
    },
    passportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: spacing.sm,
    },
    passportTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    closeBtn: {
        fontSize: 18,
        fontWeight: '700',
        color: '#64748B',
        padding: 4,
    },
    passportBody: {
        marginTop: spacing.md,
    },
    passportItem: {
        marginBottom: spacing.md,
    },
    passportLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    passportValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    passportValueGreen: {
        fontSize: 13,
        fontWeight: '600',
        color: '#16A34A',
    },
    allergyTagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    allergyTag: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    allergyTagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#991B1B',
    },
});
