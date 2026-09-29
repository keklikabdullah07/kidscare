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
import type {
  Attendance,
  AttendanceStatus,
  DailyReport,
  IncidentRecord,
  MealPortion,
  NapQuality,
  Student,
  StudentMood,
} from '@kidscare/shared-types';
import type { IncidentCategory } from '@kidscare/shared-schemas';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import {
  checkInStudent,
  checkOutStudent,
  getAttendanceByDate,
  updateStudentAttendance,
} from '../api/attendance';
import { getDailyReportsByDate, saveStudentDailyReport } from '../api/daily-reports';
import { createIncident, listIncidents } from '../api/incidents';
import { listStudents } from '../api/students';
import { colors, radii, shadows, spacing, typography } from '../theme';

type TrackingSubTab = 'attendance' | 'daily_report' | 'incidents';

const MOODS: { key: StudentMood; emoji: string; label: string }[] = [
  { key: 'HAPPY', emoji: '😊', label: 'Çok Mutlu' },
  { key: 'CALM', emoji: '😌', label: 'Sakin' },
  { key: 'ENERGETIC', emoji: '⚡', label: 'Enerjik' },
  { key: 'TIRED', emoji: '🥱', label: 'Yorgun' },
  { key: 'CRANKY', emoji: '😤', label: 'Huysuz' },
  { key: 'SAD', emoji: '😢', label: 'Üzgün' },
];

const MEAL_PORTIONS: { key: MealPortion; label: string; color: string }[] = [
  { key: 'ALL', label: 'Hepsi', color: colors.success },
  { key: 'HALF', label: 'Yarısı', color: colors.amberDark },
  { key: 'LITTLE', label: 'Az', color: colors.danger },
  { key: 'NONE', label: 'Yemedi', color: colors.textSecondary },
];

const NAP_QUALITIES: { key: NapQuality; label: string }[] = [
  { key: 'GOOD', label: 'Deliksiz / İyi' },
  { key: 'INTERRUPTED', label: 'Bölündü' },
  { key: 'NONE', label: 'Uyumadı' },
];

const INCIDENT_CATEGORIES: { key: IncidentCategory; label: string; icon: string }[] = [
  { key: 'DUSME', label: 'Düşme', icon: 'footsteps-outline' },
  { key: 'YARALANMA', label: 'Küçük Yaralanma', icon: 'bandage-outline' },
  { key: 'HASTALIK', label: 'Hastalık / Ateş', icon: 'thermometer-outline' },
  { key: 'DAVRANIS', label: 'Davranış Sorunu', icon: 'people-outline' },
  { key: 'KAZA', label: 'Kaza', icon: 'alert-circle-outline' },
  { key: 'DIGER', label: 'Diğer', icon: 'information-circle-outline' },
];

export function StaffTrackingTab(): React.ReactElement {
  const [subTab, setSubTab] = useState<TrackingSubTab>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0] ?? '',
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Data
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  // Daily Report Active Student & Form
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<StudentMood | undefined>(undefined);
  const [breakfastPortion, setBreakfastPortion] = useState<MealPortion | undefined>(undefined);
  const [lunchPortion, setLunchPortion] = useState<MealPortion | undefined>(undefined);
  const [snackPortion, setSnackPortion] = useState<MealPortion | undefined>(undefined);
  const [mealNotes, setMealNotes] = useState('');
  const [napStartTime, setNapStartTime] = useState('13:00');
  const [napEndTime, setNapEndTime] = useState('14:30');
  const [napQuality, setNapQuality] = useState<NapQuality | undefined>('GOOD');
  const [teacherNote, setTeacherNote] = useState('');
  const [savingReport, setSavingReport] = useState(false);

  // Check-Out Modal
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [targetStudentForCheckOut, setTargetStudentForCheckOut] = useState<Student | null>(null);
  const [checkOutBy, setCheckOutBy] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [checkOutNote, setCheckOutNote] = useState('');
  const [processingCheckOut, setProcessingCheckOut] = useState(false);

  // Incident Modal
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentStudentId, setIncidentStudentId] = useState<string>('');
  const [incidentCategory, setIncidentCategory] = useState<IncidentCategory>('DUSME');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentAction, setIncidentAction] = useState('');
  const [incidentParentNotified, setIncidentParentNotified] = useState(true);
  const [savingIncident, setSavingIncident] = useState(false);

  const loadAll = async () => {
    try {
      const [stuRes, attRes, repRes, incRes] = await Promise.all([
        listStudents().catch(() => []),
        getAttendanceByDate(selectedDate).catch(() => []),
        getDailyReportsByDate(selectedDate).catch(() => []),
        listIncidents({ from: selectedDate, to: selectedDate }).catch(() => []),
      ]);

      setStudents(stuRes);
      setAttendanceList(attRes);
      setDailyReports(repRes);
      setIncidents(incRes);

      if (stuRes.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stuRes[0]?.id ?? null);
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
    void loadAll();
  }, [selectedDate]);

  // When selected student changes in Daily Reports tab, populate form with existing report
  useEffect(() => {
    if (!selectedStudentId) return;
    const existing = dailyReports.find((r) => r.studentId === selectedStudentId);
    if (existing) {
      setSelectedMood(existing.mood ?? undefined);
      setBreakfastPortion(existing.meals?.breakfast ?? undefined);
      setLunchPortion(existing.meals?.lunch ?? undefined);
      setSnackPortion(existing.meals?.afternoonSnack ?? undefined);
      setMealNotes(existing.meals?.notes ?? '');
      setNapStartTime(existing.naps?.startTime ?? '13:00');
      setNapEndTime(existing.naps?.endTime ?? '14:30');
      setNapQuality(existing.naps?.quality ?? 'GOOD');
      setTeacherNote(existing.teacherNote ?? '');
    } else {
      setSelectedMood(undefined);
      setBreakfastPortion(undefined);
      setLunchPortion(undefined);
      setSnackPortion(undefined);
      setMealNotes('');
      setNapStartTime('13:00');
      setNapEndTime('14:30');
      setNapQuality('GOOD');
      setTeacherNote('');
    }
  }, [selectedStudentId, dailyReports]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadAll();
  };

  // Date Shift Helper
  const shiftDate = (deltaDays: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + deltaDays);
    setSelectedDate(cur.toISOString().split('T')[0] ?? '');
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // ================= Attendance Helpers =================
  const getStudentAttendance = (studentId: string): Attendance | undefined => {
    return attendanceList.find((a) => a.studentId === studentId);
  };

  const handleMarkPresent = async (student: Student) => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    try {
      const updated = await checkInStudent(student.id, selectedDate, {
        checkInTime: nowTime,
      });
      setAttendanceList((prev) => [...prev.filter((a) => a.studentId !== student.id), updated]);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Yoklama kaydedilemedi');
    }
  };

  const handleMarkStatus = async (student: Student, status: AttendanceStatus) => {
    try {
      const updated = await updateStudentAttendance(student.id, selectedDate, { status });
      setAttendanceList((prev) => [...prev.filter((a) => a.studentId !== student.id), updated]);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Durum güncellenemedi');
    }
  };

  const handleMarkAllPresent = async () => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    setLoading(true);
    try {
      for (const st of students) {
        const att = getStudentAttendance(st.id);
        if (!att || att.status !== 'PRESENT') {
          await checkInStudent(st.id, selectedDate, { checkInTime: nowTime });
        }
      }
      await loadAll();
      Alert.alert('Tamamlandı', 'Tüm öğrenciler Geldi olarak işaretlendi.');
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Toplu yoklama alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const openCheckOutModal = (student: Student) => {
    setTargetStudentForCheckOut(student);
    setCheckOutBy('Velisi');
    setCheckOutTime(new Date().toTimeString().slice(0, 5));
    setCheckOutNote('');
    setCheckOutModalOpen(true);
  };

  const handleConfirmCheckOut = async () => {
    if (!targetStudentForCheckOut) return;
    if (!checkOutBy.trim()) {
      Alert.alert('Eksik Bilgi', 'Teslim alan kişi adını belirtiniz.');
      return;
    }
    setProcessingCheckOut(true);
    try {
      const updated = await checkOutStudent(targetStudentForCheckOut.id, selectedDate, {
        checkOutBy: checkOutBy.trim(),
        checkOutTime: checkOutTime.trim() || undefined,
        note: checkOutNote.trim() || undefined,
      });
      setAttendanceList((prev) => [
        ...prev.filter((a) => a.studentId !== targetStudentForCheckOut.id),
        updated,
      ]);
      setCheckOutModalOpen(false);
      Alert.alert('Başarılı', `${targetStudentForCheckOut.firstName} için çıkış kaydedildi.`);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Çıkış kaydedilemedi');
    } finally {
      setProcessingCheckOut(false);
    }
  };

  // ================= Daily Report Helpers =================
  const handleSaveDailyReport = async () => {
    if (!selectedStudentId) return;
    setSavingReport(true);
    try {
      const updated = await saveStudentDailyReport(selectedStudentId, selectedDate, {
        mood: selectedMood,
        meals: {
          breakfast: breakfastPortion,
          lunch: lunchPortion,
          afternoonSnack: snackPortion,
          notes: mealNotes.trim() || undefined,
        },
        naps: {
          startTime: napStartTime,
          endTime: napEndTime,
          quality: napQuality,
        },
        teacherNote: teacherNote.trim() || undefined,
      });

      setDailyReports((prev) => [
        ...prev.filter((r) => r.studentId !== selectedStudentId),
        updated,
      ]);

      const stuName = students.find((s) => s.id === selectedStudentId)?.firstName ?? 'Öğrenci';
      Alert.alert('Kaydedildi', `${stuName} için günlük karne başarıyla güncellendi.`);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Karne kaydedilemedi');
    } finally {
      setSavingReport(false);
    }
  };

  // ================= Incident Helpers =================
  const handleCreateIncident = async () => {
    if (!incidentStudentId) {
      Alert.alert('Eksik Bilgi', 'Lütfen ilgili öğrenciyi seçiniz.');
      return;
    }
    if (!incidentDesc.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen olay açıklamasını yazınız.');
      return;
    }
    setSavingIncident(true);
    try {
      const newInc = await createIncident({
        studentId: incidentStudentId,
        category: incidentCategory,
        occurredAt: new Date(selectedDate),
        description: incidentDesc.trim(),
        actionTaken: incidentAction.trim() || undefined,
        parentNotified: incidentParentNotified,
      });

      setIncidents((prev) => [newInc, ...prev]);
      setIncidentModalOpen(false);
      setIncidentDesc('');
      setIncidentAction('');
      Alert.alert('Kaydedildi', 'Olay & kaza raporu sisteme işlendi.');
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Rapor kaydedilemedi');
    } finally {
      setSavingIncident(false);
    }
  };

  // Attendance stats
  const totalCount = students.length;
  const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;
  const excusedCount = attendanceList.filter((a) => a.status === 'EXCUSED').length;
  const leftCount = attendanceList.filter((a) => a.status === 'LEFT').length;

  const activeStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <ScreenContainer
      icon="clipboard"
      title="Günlük Akış & Takip"
      subtitle="Sınıf yoklaması, karne doldurma ve olay/kaza kayıtları"
    >
      {/* 1. Segmented Control */}
      <View style={styles.segmentContainer}>
        <Pressable
          style={[styles.segmentBtn, subTab === 'attendance' && styles.segmentBtnActive]}
          onPress={() => setSubTab('attendance')}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={subTab === 'attendance' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.segmentText, subTab === 'attendance' && styles.segmentTextActive]}
          >
            Yoklama
          </Text>
        </Pressable>

        <Pressable
          style={[styles.segmentBtn, subTab === 'daily_report' && styles.segmentBtnActive]}
          onPress={() => setSubTab('daily_report')}
        >
          <Ionicons
            name="document-text-outline"
            size={16}
            color={subTab === 'daily_report' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.segmentText, subTab === 'daily_report' && styles.segmentTextActive]}
          >
            Günlük Karne
          </Text>
        </Pressable>

        <Pressable
          style={[styles.segmentBtn, subTab === 'incidents' && styles.segmentBtnActive]}
          onPress={() => setSubTab('incidents')}
        >
          <Ionicons
            name="warning-outline"
            size={16}
            color={subTab === 'incidents' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.segmentText, subTab === 'incidents' && styles.segmentTextActive]}
          >
            Olay / Kaza
          </Text>
        </Pressable>
      </View>

      {/* 2. Date Navigation Bar */}
      <View style={styles.dateBar}>
        <Pressable style={styles.dateNavBtn} onPress={() => shiftDate(-1)}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>

        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              weekday: 'short',
            })}
          </Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Bugün</Text>
            </View>
          )}
        </View>

        <Pressable
          style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]}
          onPress={() => !isToday && shiftDate(1)}
          disabled={isToday}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isToday ? colors.textMuted : colors.primary}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Veriler yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        >
          {/* ======================================================== */}
          {/* SUB-TAB 1: YOKLAMA (ATTENDANCE)                          */}
          {/* ======================================================== */}
          {subTab === 'attendance' && (
            <View style={styles.tabContent}>
              {/* Stat Pills */}
              <View style={styles.statsRow}>
                <View style={[styles.statPill, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={styles.statNumber}>{totalCount}</Text>
                  <Text style={styles.statLabel}>Toplam</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.statNumber, { color: colors.successText }]}>
                    {presentCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.successText }]}>Geldi</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: colors.dangerBg }]}>
                  <Text style={[styles.statNumber, { color: colors.dangerText }]}>
                    {absentCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.dangerText }]}>Yok</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: colors.amberLight }]}>
                  <Text style={[styles.statNumber, { color: colors.amberText }]}>
                    {excusedCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.amberText }]}>İzinli</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: colors.infoBg }]}>
                  <Text style={[styles.statNumber, { color: colors.infoText }]}>{leftCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.infoText }]}>Çıktı</Text>
                </View>
              </View>

              {/* Bulk Check-In Button */}
              <Pressable style={styles.bulkBtn} onPress={handleMarkAllPresent}>
                <Ionicons name="checkmark-done-circle" size={20} color={colors.textInverse} />
                <Text style={styles.bulkBtnText}>Tümünü Geldi Olarak İşaretle</Text>
              </Pressable>

              {/* Student Attendance List */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Öğrenci Listesi ({students.length})</Text>
              </View>

              {students.length === 0 ? (
                <Card>
                  <Text style={styles.emptyText}>Kayıtlı öğrenci bulunamadı.</Text>
                </Card>
              ) : (
                students.map((stu) => {
                  const att = getStudentAttendance(stu.id);
                  const status = att?.status;

                  return (
                    <Card key={stu.id} style={styles.studentCard}>
                      <View style={styles.studentCardTop}>
                        <View style={styles.avatarWrap}>
                          <Text style={styles.avatarText}>
                            {stu.firstName.charAt(0)}
                            {stu.lastName.charAt(0)}
                          </Text>
                        </View>

                        <View style={styles.studentInfo}>
                          <Text style={styles.studentName}>
                            {stu.firstName} {stu.lastName}
                          </Text>
                          <Text style={styles.studentSub}>
                            {(stu as any).classroom?.name ? `${(stu as any).classroom.name} • ` : ''}
                            {status === 'PRESENT' && att?.checkInTime
                              ? `Giriş: ${att.checkInTime}`
                              : status === 'LEFT' && att?.checkOutTime
                                ? `Çıkış: ${att.checkOutTime} (${att.checkOutBy ?? 'Veli'})`
                                : status === 'ABSENT'
                                  ? 'Bugün gelmedi'
                                  : status === 'EXCUSED'
                                    ? 'İzinli / Raporlu'
                                    : 'Yoklama bekleniyor'}
                          </Text>
                        </View>

                        {/* Status Badge */}
                        <View
                          style={[
                            styles.statusBadge,
                            status === 'PRESENT' && styles.statusBadgePresent,
                            status === 'ABSENT' && styles.statusBadgeAbsent,
                            status === 'EXCUSED' && styles.statusBadgeExcused,
                            status === 'LEFT' && styles.statusBadgeLeft,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              status === 'PRESENT' && styles.statusBadgeTextPresent,
                              status === 'ABSENT' && styles.statusBadgeTextAbsent,
                              status === 'EXCUSED' && styles.statusBadgeTextExcused,
                              status === 'LEFT' && styles.statusBadgeTextLeft,
                            ]}
                          >
                            {status === 'PRESENT'
                              ? 'Geldi'
                              : status === 'ABSENT'
                                ? 'Gelmedi'
                                : status === 'EXCUSED'
                                  ? 'İzinli'
                                  : status === 'LEFT'
                                    ? 'Ayrıldı'
                                    : 'Belirsiz'}
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons Row */}
                      <View style={styles.actionBtnRow}>
                        <Pressable
                          style={[
                            styles.miniActionBtn,
                            status === 'PRESENT' && styles.miniActionBtnActivePresent,
                          ]}
                          onPress={() => handleMarkPresent(stu)}
                        >
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={16}
                            color={status === 'PRESENT' ? colors.success : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.miniActionText,
                              status === 'PRESENT' && {
                                color: colors.success,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            Geldi
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.miniActionBtn,
                            status === 'ABSENT' && styles.miniActionBtnActiveAbsent,
                          ]}
                          onPress={() => handleMarkStatus(stu, 'ABSENT')}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={16}
                            color={status === 'ABSENT' ? colors.danger : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.miniActionText,
                              status === 'ABSENT' && {
                                color: colors.danger,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            Gelmedi
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.miniActionBtn,
                            status === 'EXCUSED' && styles.miniActionBtnActiveExcused,
                          ]}
                          onPress={() => handleMarkStatus(stu, 'EXCUSED')}
                        >
                          <Ionicons
                            name="pause-circle-outline"
                            size={16}
                            color={status === 'EXCUSED' ? colors.amberDark : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.miniActionText,
                              status === 'EXCUSED' && {
                                color: colors.amberDark,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            İzinli
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.miniActionBtn,
                            status === 'LEFT' && styles.miniActionBtnActiveLeft,
                          ]}
                          onPress={() => openCheckOutModal(stu)}
                        >
                          <Ionicons
                            name="log-out-outline"
                            size={16}
                            color={status === 'LEFT' ? colors.info : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.miniActionText,
                              status === 'LEFT' && {
                                color: colors.info,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            Çıkış
                          </Text>
                        </Pressable>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          )}

          {/* ======================================================== */}
          {/* SUB-TAB 2: GÜNLÜK KARNE (DAILY REPORT)                   */}
          {/* ======================================================== */}
          {subTab === 'daily_report' && (
            <View style={styles.tabContent}>
              {/* Student Carousel */}
              <Text style={styles.sectionTitle}>Öğrenci Seçiniz</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.studentCarousel}
              >
                {students.map((stu) => {
                  const isSelected = stu.id === selectedStudentId;
                  const hasReport = dailyReports.some((r) => r.studentId === stu.id);

                  return (
                    <Pressable
                      key={stu.id}
                      style={[
                        styles.carouselItem,
                        isSelected && styles.carouselItemActive,
                      ]}
                      onPress={() => setSelectedStudentId(stu.id)}
                    >
                      <View
                        style={[
                          styles.carouselAvatar,
                          isSelected && styles.carouselAvatarActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.carouselAvatarText,
                            isSelected && styles.carouselAvatarTextActive,
                          ]}
                        >
                          {stu.firstName.charAt(0)}
                          {stu.lastName.charAt(0)}
                        </Text>
                        {hasReport && <View style={styles.reportDoneBadge} />}
                      </View>
                      <Text
                        style={[
                          styles.carouselName,
                          isSelected && styles.carouselNameActive,
                        ]}
                        numberOfLines={1}
                      >
                        {stu.firstName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {activeStudent ? (
                <View style={styles.reportFormWrap}>
                  {/* Student Title Banner */}
                  <Card style={styles.activeStudentBanner}>
                    <View style={styles.bannerRow}>
                      <View style={styles.bannerAvatar}>
                        <Text style={styles.bannerAvatarText}>
                          {activeStudent.firstName.charAt(0)}
                          {activeStudent.lastName.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={styles.bannerTitle}>
                          {activeStudent.firstName} {activeStudent.lastName}
                        </Text>
                        <Text style={styles.bannerSub}>
                          {(activeStudent as any).classroom?.name ?? 'Sınıf Belirtilmemiş'} • Günlük
                          Gelişim Raporu
                        </Text>
                      </View>
                    </View>
                  </Card>

                  {/* 1. Duygu Durumu */}
                  <Card style={styles.formCard}>
                    <View style={styles.formCardHeader}>
                      <Text style={styles.formCardTitle}>1. Günün Duygu Durumu (Mood)</Text>
                    </View>
                    <View style={styles.moodGrid}>
                      {MOODS.map((m) => {
                        const isChosen = selectedMood === m.key;
                        return (
                          <Pressable
                            key={m.key}
                            style={[styles.moodBtn, isChosen && styles.moodBtnActive]}
                            onPress={() => setSelectedMood(m.key)}
                          >
                            <Text style={styles.moodEmoji}>{m.emoji}</Text>
                            <Text
                              style={[
                                styles.moodLabel,
                                isChosen && styles.moodLabelActive,
                              ]}
                            >
                              {m.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </Card>

                  {/* 2. Yemek Tüketimi */}
                  <Card style={styles.formCard}>
                    <View style={styles.formCardHeader}>
                      <Text style={styles.formCardTitle}>2. Yemek & Beslenme Durumu</Text>
                    </View>

                    {/* Kahvaltı */}
                    <Text style={styles.mealSubTitle}>🍳 Sabah Kahvaltısı</Text>
                    <View style={styles.portionRow}>
                      {MEAL_PORTIONS.map((p) => (
                        <Pressable
                          key={p.key}
                          style={[
                            styles.portionBtn,
                            breakfastPortion === p.key && styles.portionBtnActive,
                          ]}
                          onPress={() => setBreakfastPortion(p.key)}
                        >
                          <Text
                            style={[
                              styles.portionBtnText,
                              breakfastPortion === p.key && styles.portionBtnTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Öğle Yemeği */}
                    <Text style={[styles.mealSubTitle, { marginTop: spacing.md }]}>
                      🍲 Öğle Yemeği
                    </Text>
                    <View style={styles.portionRow}>
                      {MEAL_PORTIONS.map((p) => (
                        <Pressable
                          key={p.key}
                          style={[
                            styles.portionBtn,
                            lunchPortion === p.key && styles.portionBtnActive,
                          ]}
                          onPress={() => setLunchPortion(p.key)}
                        >
                          <Text
                            style={[
                              styles.portionBtnText,
                              lunchPortion === p.key && styles.portionBtnTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* İkindi */}
                    <Text style={[styles.mealSubTitle, { marginTop: spacing.md }]}>
                      🍎 İkindi Kahvaltısı / Meyve
                    </Text>
                    <View style={styles.portionRow}>
                      {MEAL_PORTIONS.map((p) => (
                        <Pressable
                          key={p.key}
                          style={[
                            styles.portionBtn,
                            snackPortion === p.key && styles.portionBtnActive,
                          ]}
                          onPress={() => setSnackPortion(p.key)}
                        >
                          <Text
                            style={[
                              styles.portionBtnText,
                              snackPortion === p.key && styles.portionBtnTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Beslenme Notu */}
                    <TextInput
                      style={[styles.input, { marginTop: spacing.md }]}
                      placeholder="Yemek notu (örn: Çorbasını çok beğendi, sebzeyi az yedi)"
                      value={mealNotes}
                      onChangeText={setMealNotes}
                      placeholderTextColor={colors.textMuted}
                    />
                  </Card>

                  {/* 3. Uyku Durumu */}
                  <Card style={styles.formCard}>
                    <View style={styles.formCardHeader}>
                      <Text style={styles.formCardTitle}>3. Uyku & Dinlenme</Text>
                    </View>

                    <View style={styles.napTimeRow}>
                      <View style={{ flex: 1, marginRight: spacing.sm }}>
                        <Text style={styles.napLabel}>Başlangıç</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={napStartTime}
                          onChangeText={setNapStartTime}
                          placeholder="13:00"
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={styles.napLabel}>Bitiş</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={napEndTime}
                          onChangeText={setNapEndTime}
                          placeholder="14:30"
                        />
                      </View>
                    </View>

                    <Text style={[styles.napLabel, { marginTop: spacing.md }]}>Uyku Kalitesi</Text>
                    <View style={styles.portionRow}>
                      {NAP_QUALITIES.map((q) => (
                        <Pressable
                          key={q.key}
                          style={[
                            styles.portionBtn,
                            napQuality === q.key && styles.portionBtnActive,
                          ]}
                          onPress={() => setNapQuality(q.key)}
                        >
                          <Text
                            style={[
                              styles.portionBtnText,
                              napQuality === q.key && styles.portionBtnTextActive,
                            ]}
                          >
                            {q.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Card>

                  {/* 4. Öğretmen Notu */}
                  <Card style={styles.formCard}>
                    <View style={styles.formCardHeader}>
                      <Text style={styles.formCardTitle}>4. Öğretmen Değerlendirme Notu</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      multiline
                      numberOfLines={4}
                      placeholder="Günün özeti, etkinlik katılımı, sosyal iletişim ve veliye iletmek istediğiniz özel notlar..."
                      value={teacherNote}
                      onChangeText={setTeacherNote}
                      placeholderTextColor={colors.textMuted}
                    />
                  </Card>

                  {/* Kaydet Butonu */}
                  <Pressable
                    style={[styles.saveReportBtn, savingReport && { opacity: 0.7 }]}
                    onPress={handleSaveDailyReport}
                    disabled={savingReport}
                  >
                    {savingReport ? (
                      <ActivityIndicator color={colors.textInverse} />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.textInverse}
                        />
                        <Text style={styles.saveReportBtnText}>
                          Karneyi Kaydet / Güncelle
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Card>
                  <Text style={styles.emptyText}>Lütfen bir öğrenci seçiniz.</Text>
                </Card>
              )}
            </View>
          )}

          {/* ======================================================== */}
          {/* SUB-TAB 3: OLAY / KAZA (INCIDENTS)                       */}
          {/* ======================================================== */}
          {subTab === 'incidents' && (
            <View style={styles.tabContent}>
              {/* Yeni Olay Ekle Butonu */}
              <Pressable
                style={styles.addIncidentBtn}
                onPress={() => {
                  setIncidentStudentId(students[0]?.id ?? '');
                  setIncidentCategory('DUSME');
                  setIncidentDesc('');
                  setIncidentAction('');
                  setIncidentParentNotified(true);
                  setIncidentModalOpen(true);
                }}
              >
                <Ionicons name="add-circle" size={22} color={colors.textInverse} />
                <Text style={styles.addIncidentBtnText}>+ Yeni Olay / Kaza Raporu Ekle</Text>
              </Pressable>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Günün Olay Raporları ({incidents.length})
                </Text>
              </View>

              {incidents.length === 0 ? (
                <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                  <Text style={{ fontSize: 36, marginBottom: spacing.sm }}>🛡️</Text>
                  <Text style={styles.emptyTitle}>Bugün Kayıtlı Olay Yok</Text>
                  <Text style={styles.emptyText}>
                    Harika bir haber! Seçili tarihte bildirilmiş herhangi bir kaza veya olay
                    bulunmuyor.
                  </Text>
                </Card>
              ) : (
                incidents.map((inc) => {
                  const stu = students.find((s) => s.id === inc.studentId);
                  const catObj = INCIDENT_CATEGORIES.find((c) => c.key === inc.category);

                  return (
                    <Card key={inc.id} style={styles.incidentCard}>
                      <View style={styles.incidentTop}>
                        <View style={styles.incidentBadge}>
                          <Ionicons
                            name={(catObj?.icon as any) ?? 'alert-circle-outline'}
                            size={16}
                            color={colors.amberDark}
                          />
                          <Text style={styles.incidentBadgeText}>
                            {catObj?.label ?? inc.category}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.notifiedBadge,
                            inc.parentNotified
                              ? styles.notifiedBadgeDone
                              : styles.notifiedBadgePending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.notifiedBadgeText,
                              inc.parentNotified
                                ? styles.notifiedBadgeTextDone
                                : styles.notifiedBadgeTextPending,
                            ]}
                          >
                            {inc.parentNotified ? '✓ Veli Bilgilendirildi' : 'Veli Bekliyor'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.incidentStudentName}>
                        {stu ? `${stu.firstName} ${stu.lastName}` : 'Öğrenci'}
                      </Text>

                      <Text style={styles.incidentDesc}>{inc.description}</Text>

                      {inc.actionTaken && (
                        <View style={styles.actionTakenBox}>
                          <Text style={styles.actionTakenTitle}>Alınan Önlem / İlk Yardım:</Text>
                          <Text style={styles.actionTakenText}>{inc.actionTaken}</Text>
                        </View>
                      )}
                    </Card>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* CHECK-OUT MODAL                                          */}
      {/* ======================================================== */}
      <Modal
        visible={checkOutModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckOutModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Öğrenci Çıkışı Kaydet</Text>
              <Pressable onPress={() => setCheckOutModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.modalStudentLabel}>
              {targetStudentForCheckOut?.firstName} {targetStudentForCheckOut?.lastName}
            </Text>

            <Text style={styles.fieldLabel}>Teslim Alan Kişi *</Text>
            <TextInput
              style={styles.modalInput}
              value={checkOutBy}
              onChangeText={setCheckOutBy}
              placeholder="Örn: Ayşe Yılmaz (Annesi)"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Çıkış Saati (HH:mm) *</Text>
            <TextInput
              style={styles.modalInput}
              value={checkOutTime}
              onChangeText={setCheckOutTime}
              placeholder="16:30"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Açıklama / Not</Text>
            <TextInput
              style={styles.modalInput}
              value={checkOutNote}
              onChangeText={setCheckOutNote}
              placeholder="Ek bilgi (varsa)"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setCheckOutModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Vazgeç</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalSaveBtn,
                  processingCheckOut && { opacity: 0.6 },
                ]}
                onPress={handleConfirmCheckOut}
                disabled={processingCheckOut}
              >
                {processingCheckOut ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalSaveText}>Çıkışı Kaydet</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* NEW INCIDENT MODAL                                       */}
      {/* ======================================================== */}
      <Modal
        visible={incidentModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIncidentModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Yeni Olay & Kaza Raporu</Text>
                <Pressable onPress={() => setIncidentModalOpen(false)}>
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
                  const isSel = stu.id === incidentStudentId;
                  return (
                    <Pressable
                      key={stu.id}
                      style={[styles.stuPickChip, isSel && styles.stuPickChipActive]}
                      onPress={() => setIncidentStudentId(stu.id)}
                    >
                      <Text
                        style={[
                          styles.stuPickChipText,
                          isSel && styles.stuPickChipTextActive,
                        ]}
                      >
                        {stu.firstName} {stu.lastName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Kategori Seçimi */}
              <Text style={styles.fieldLabel}>Kategori *</Text>
              <View style={styles.catGrid}>
                {INCIDENT_CATEGORIES.map((cat) => {
                  const isSel = cat.key === incidentCategory;
                  return (
                    <Pressable
                      key={cat.key}
                      style={[styles.catChip, isSel && styles.catChipActive]}
                      onPress={() => setIncidentCategory(cat.key)}
                    >
                      <Text
                        style={[styles.catChipText, isSel && styles.catChipTextActive]}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Açıklama */}
              <Text style={styles.fieldLabel}>Olay Açıklaması *</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholder="Olay nasıl gerçekleşti? (örn: Oyun parkında koşarken düştü, dizi hafif sıyrıldı)"
                value={incidentDesc}
                onChangeText={setIncidentDesc}
                placeholderTextColor={colors.textMuted}
              />

              {/* Alınan Önlem */}
              <Text style={styles.fieldLabel}>Alınan Önlem / İlk Yardım</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                multiline
                numberOfLines={2}
                placeholder="Uygulanan ilk yardım (örn: Batikonla temizlendi ve yara bandı takıldı)"
                value={incidentAction}
                onChangeText={setIncidentAction}
                placeholderTextColor={colors.textMuted}
              />

              {/* Veli Bilgilendirme Toggle */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Veli Bilgilendirildi mi?</Text>
                  <Text style={styles.switchSub}>
                    Veliyi telefonla aradıysanız veya mesaj attıysanız işaretleyiniz
                  </Text>
                </View>
                <Switch
                  value={incidentParentNotified}
                  onValueChange={setIncidentParentNotified}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              {/* Butonlar */}
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setIncidentModalOpen(false)}
                >
                  <Text style={styles.modalCancelText}>Vazgeç</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalBtn,
                    styles.modalSaveBtn,
                    savingIncident && { opacity: 0.6 },
                  ]}
                  onPress={handleCreateIncident}
                  disabled={savingIncident}
                >
                  {savingIncident ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={styles.modalSaveText}>Raporu Kaydet</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Segment Bar
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xl,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.lg,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
  },

  // Date Bar
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  dateNavBtnDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  todayBadge: {
    backgroundColor: colors.amberLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  todayBadgeText: {
    ...typography.captionBold,
    color: colors.amberText,
    fontSize: 11,
  },

  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loaderText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  tabContent: {
    gap: spacing.md,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  statNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  // Bulk Btn
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  bulkBtnText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },

  sectionHeaderRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  // Student Card
  studentCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  studentCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  studentSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  statusBadgePresent: { backgroundColor: colors.successBg },
  statusBadgeAbsent: { backgroundColor: colors.dangerBg },
  statusBadgeExcused: { backgroundColor: colors.amberLight },
  statusBadgeLeft: { backgroundColor: colors.infoBg },

  statusBadgeText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusBadgeTextPresent: { color: colors.successText },
  statusBadgeTextAbsent: { color: colors.dangerText },
  statusBadgeTextExcused: { color: colors.amberText },
  statusBadgeTextLeft: { color: colors.infoText },

  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  miniActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    gap: 4,
  },
  miniActionBtnActivePresent: {
    backgroundColor: colors.successBg,
  },
  miniActionBtnActiveAbsent: {
    backgroundColor: colors.dangerBg,
  },
  miniActionBtnActiveExcused: {
    backgroundColor: colors.amberLight,
  },
  miniActionBtnActiveLeft: {
    backgroundColor: colors.infoBg,
  },
  miniActionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },

  // Daily Report Carousel
  studentCarousel: {
    marginVertical: spacing.sm,
  },
  carouselItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 64,
  },
  carouselItemActive: {},
  carouselAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  carouselAvatarActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  carouselAvatarText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  carouselAvatarTextActive: {
    color: colors.primary,
  },
  reportDoneBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  carouselName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  carouselNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Report Form
  reportFormWrap: {
    gap: spacing.md,
  },
  activeStudentBanner: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerAvatarText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  bannerTitle: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  bannerSub: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },

  formCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  formCardHeader: {
    marginBottom: spacing.md,
  },
  formCardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  // Mood Grid
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodBtn: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  moodLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Meal Section
  mealSubTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  portionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  portionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  portionBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  portionBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  portionBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Nap Row
  napTimeRow: {
    flexDirection: 'row',
  },
  napLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timeInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  saveReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  saveReportBtnText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },

  // Incidents
  addIncidentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amberDark,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  addIncidentBtnText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  incidentCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
    borderColor: colors.amberBorder,
  },
  incidentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  incidentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.amberLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  incidentBadgeText: {
    ...typography.captionBold,
    color: colors.amberText,
    fontSize: 11,
  },
  notifiedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  notifiedBadgeDone: {
    backgroundColor: colors.successBg,
  },
  notifiedBadgePending: {
    backgroundColor: colors.surfaceMuted,
  },
  notifiedBadgeText: {
    ...typography.captionBold,
    fontSize: 10,
  },
  notifiedBadgeTextDone: { color: colors.successText },
  notifiedBadgeTextPending: { color: colors.textSecondary },

  incidentStudentName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  incidentDesc: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionTakenBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
  },
  actionTakenTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  actionTakenText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    ...shadows.lg,
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
  modalStudentLabel: {
    ...typography.bodyBold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
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

  // Chips in Incident Modal
  stuPickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.sm,
  },
  stuPickChipActive: {
    backgroundColor: colors.primary,
  },
  stuPickChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stuPickChipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  catChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  catChipActive: {
    backgroundColor: colors.amberLight,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  catChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: colors.amberText,
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
});
