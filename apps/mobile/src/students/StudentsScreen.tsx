import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Attendance, AttendanceStatus, Student } from '@kidscare/shared-types';
import { getAttendanceByDate } from '../api/attendance';
import { ApiError } from '../api/client';
import { createStudent, deleteStudent, listStudents } from '../api/students';
import { ActivityGalleryModal } from '../activities/ActivityGalleryModal';
import { AttendanceCheckModal } from '../attendance/AttendanceCheckModal';
import { DailyMenuModal } from '../daily-menus/DailyMenuModal';
import { DailyReportModal } from '../daily-reports/DailyReportModal';
import { StudentPassportModal } from './StudentPassportModal';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, shadows, spacing, typography } from '../theme';

type Status = 'loading' | 'ready' | 'error';
type FilterStatus = 'ALL' | AttendanceStatus;

const ATTENDANCE_BADGES: Record<
  AttendanceStatus,
  { label: string; icon: string; bg: string; text: string }
> = {
  PRESENT: {
    label: 'İçeride',
    icon: 'checkmark-circle',
    bg: colors.successBg,
    text: colors.successText,
  },
  LEFT: {
    label: 'Ayrıldı',
    icon: 'log-out',
    bg: colors.infoBg,
    text: colors.infoText,
  },
  EXCUSED: {
    label: 'İzinli',
    icon: 'pause-circle',
    bg: colors.amberLight,
    text: colors.amberText,
  },
  ABSENT: {
    label: 'Yok',
    icon: 'close-circle',
    bg: colors.surfaceMuted,
    text: colors.textSecondary,
  },
};

export function StudentsScreen(): React.ReactElement {
  const [status, setStatus] = useState<Status>('loading');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passportStudent, setPassportStudent] = useState<Student | null>(null);
  const [trackingStudent, setTrackingStudent] = useState<Student | null>(null);
  const [attendanceStudent, setAttendanceStudent] = useState<Student | null>(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  function reload(): void {
    setStatus('loading');
    Promise.all([listStudents(), getAttendanceByDate(todayStr)])
      .then(([rows, attList]) => {
        setStudents(rows);
        const map: Record<string, Attendance> = {};
        for (const a of attList) {
          map[a.studentId] = a;
        }
        setAttendanceMap(map);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Bilinmeyen hata');
      });
  }

  useEffect(reload, []);

  function handleDelete(s: Student): void {
    function doDelete(): void {
      deleteStudent(s.id)
        .then(() => {
          setStudents((prev) => prev.filter((x) => x.id !== s.id));
        })
        .catch((err: unknown) => {
          Alert.alert('Hata', err instanceof ApiError ? `API ${err.status}` : 'Silinemedi');
        });
    }
    Alert.alert(
      'Öğrenciyi Sil',
      `${s.firstName} ${s.lastName} kaydı silinecektir. Devam etmek istiyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Sil', style: 'destructive', onPress: doDelete },
      ],
    );
  }

  // Filtered Students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q),
      );
    }

    // Attendance status filter
    if (activeFilter !== 'ALL') {
      result = result.filter((s) => {
        const att = attendanceMap[s.id];
        const currentStatus = att?.status ?? 'ABSENT';
        return currentStatus === activeFilter;
      });
    }

    return result.sort(byLastName);
  }, [students, attendanceMap, searchQuery, activeFilter]);

  // Statistics
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const allergicCount = students.filter(
    (s) => s.passport?.allergies && s.passport.allergies.length > 0,
  ).length;

  return (
    <ScreenContainer
      icon="people"
      title="Öğrenci Yönetimi"
      subtitle="Kayıtlı öğrenciler, devam durumu ve sağlık pasaportları"
    >
      {/* Top Action Bar */}
      <View style={styles.topActionBar}>
        <View style={styles.topActionLeft}>
          <Pressable style={styles.subActionBtn} onPress={() => setGalleryModalOpen(true)}>
            <Ionicons name="images-outline" size={16} color={colors.primary} />
            <Text style={styles.subActionText}>Galeri</Text>
          </Pressable>

          <Pressable style={styles.subActionBtn} onPress={() => setMenuModalOpen(true)}>
            <Ionicons name="restaurant-outline" size={16} color={colors.amberDark} />
            <Text style={[styles.subActionText, { color: colors.amberDark }]}>Menü</Text>
          </Pressable>
        </View>

        <Pressable style={styles.primaryAddBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={18} color={colors.textInverse} />
          <Text style={styles.primaryAddText}>Yeni Öğrenci</Text>
        </Pressable>
      </View>

      {/* KPI Stats Bar */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={styles.statValue}>{totalCount}</Text>
          <Text style={styles.statLabel}>Toplam Kayıt</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.successBg }]}>
          <Text style={[styles.statValue, { color: colors.successText }]}>{presentCount}</Text>
          <Text style={[styles.statLabel, { color: colors.successText }]}>İçeride</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.amberLight }]}>
          <Text style={[styles.statValue, { color: colors.amberText }]}>{allergicCount}</Text>
          <Text style={[styles.statLabel, { color: colors.amberText }]}>Alerjisi Olan</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="İsim veya soyisim ile ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <Pressable
          style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tümü ({students.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, activeFilter === 'PRESENT' && styles.filterChipActive]}
          onPress={() => setActiveFilter('PRESENT')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'PRESENT' && styles.filterChipTextActive,
            ]}
          >
            🟢 İçeride ({presentCount})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, activeFilter === 'ABSENT' && styles.filterChipActive]}
          onPress={() => setActiveFilter('ABSENT')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'ABSENT' && styles.filterChipTextActive,
            ]}
          >
            ⚪ Gelmedi
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, activeFilter === 'EXCUSED' && styles.filterChipActive]}
          onPress={() => setActiveFilter('EXCUSED')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'EXCUSED' && styles.filterChipTextActive,
            ]}
          >
            🟡 İzinli
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, activeFilter === 'LEFT' && styles.filterChipActive]}
          onPress={() => setActiveFilter('LEFT')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'LEFT' && styles.filterChipTextActive,
            ]}
          >
            🔵 Ayrıldı
          </Text>
        </Pressable>
      </ScrollView>

      {/* Content State */}
      {status === 'loading' && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Öğrenci listesi yükleniyor...</Text>
        </View>
      )}

      {status === 'error' && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>
            {errorMsg ?? 'Öğrenci verileri alınırken bir problem oluştu.'}
          </Text>
          <Pressable style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </Pressable>
        </Card>
      )}

      {status === 'ready' && filteredStudents.length === 0 && (
        <Card>
          <EmptyState
            icon={searchQuery ? '🔍' : '👶'}
            title={searchQuery ? 'Sonuç Bulunamadı' : 'Henüz Öğrenci Kaydı Yok'}
            description={
              searchQuery
                ? `"${searchQuery}" aramasıyla eşleşen bir öğrenci bulunamadı.`
                : 'Kreşe kayıtlı öğrenci bulunmuyor. Yeni öğrenci ekleyerek başlayabilirsiniz.'
            }
            actionLabel={searchQuery ? 'Aramayı Temizle' : '+ Yeni Öğrenci Ekle'}
            onAction={searchQuery ? () => setSearchQuery('') : () => setModalOpen(true)}
          />
        </Card>
      )}

      {status === 'ready' && filteredStudents.length > 0 && (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const att = attendanceMap[item.id];
            const attStatus: AttendanceStatus = att?.status ?? 'ABSENT';
            const attInfo = ATTENDANCE_BADGES[attStatus];

            return (
              <Card key={item.id} style={styles.studentCard}>
                {/* Header Row: Avatar, Names, Badges */}
                <View style={styles.studentCardTop}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                      {item.firstName.charAt(0)}
                      {item.lastName.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.studentInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.studentName}>
                        {item.firstName} {item.lastName}
                      </Text>
                      {item.passport?.bloodType && item.passport.bloodType !== 'UNKNOWN' && (
                        <View style={styles.bloodBadge}>
                          <Text style={styles.bloodBadgeText}>🩸 {item.passport.bloodType}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.studentSub}>
                      {item.dateOfBirth
                        ? `${new Date(item.dateOfBirth).toLocaleDateString('tr-TR')} · `
                        : ''}
                      {item.gender ?? 'Belirtilmedi'}
                    </Text>
                  </View>

                  {/* Attendance Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: attInfo.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: attInfo.text }]}>
                      {attInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Allergen Warning Pill */}
                {item.passport?.allergies && item.passport.allergies.length > 0 && (
                  <View style={styles.allergyBanner}>
                    <Ionicons name="warning-outline" size={14} color={colors.amberDark} />
                    <Text style={styles.allergyText} numberOfLines={1}>
                      Alerjiler: {item.passport.allergies.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Notes (if any) */}
                {item.notes && (
                  <Text style={styles.notesText} numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}

                {/* Action Buttons Row */}
                <View style={styles.actionBtnRow}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => setAttendanceStudent(item)}
                  >
                    <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Yoklama</Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => setPassportStudent(item)}
                  >
                    <Ionicons name="medical-outline" size={14} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Pasaport</Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => setTrackingStudent(item)}
                  >
                    <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Karne</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.danger} />
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* New Student Modal */}
      <NewStudentModal
        visible={modalOpen}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSaved={(s) => {
          setStudents((prev) => [...prev, s].sort(byLastName));
          setModalOpen(false);
          Alert.alert('Başarılı', `${s.firstName} ${s.lastName} sisteme eklendi.`);
        }}
        onError={setErrorMsg}
        onSavingChange={setSaving}
      />

      {/* Student Passport Modal */}
      <StudentPassportModal
        student={passportStudent}
        visible={passportStudent !== null}
        onClose={() => setPassportStudent(null)}
        onSaved={(updatedPassport) => {
          if (passportStudent) {
            const updated: Student = { ...passportStudent, passport: updatedPassport };
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setPassportStudent(updated);
          }
        }}
      />

      {/* Daily Report Modal */}
      <DailyReportModal
        student={trackingStudent}
        date={todayStr}
        visible={trackingStudent !== null}
        onClose={() => setTrackingStudent(null)}
      />

      {/* Attendance Check Modal */}
      <AttendanceCheckModal
        student={attendanceStudent}
        date={todayStr}
        visible={attendanceStudent !== null}
        onClose={() => setAttendanceStudent(null)}
        onAttendanceUpdated={(att) => {
          setAttendanceMap((prev) => ({ ...prev, [att.studentId]: att }));
        }}
      />

      {/* Daily Menu Modal */}
      <DailyMenuModal
        date={todayStr}
        visible={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
      />

      {/* Activity Gallery Modal */}
      <ActivityGalleryModal
        visible={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        userRole="TEACHER"
      />
    </ScreenContainer>
  );
}

function byLastName(a: Student, b: Student): number {
  const ln = a.lastName.localeCompare(b.lastName, 'tr');
  return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName, 'tr');
}

function NewStudentModal({
  visible,
  saving,
  onClose,
  onSaved,
  onError,
  onSavingChange,
}: {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSaved: (s: Student) => void;
  onError: (msg: string) => void;
  onSavingChange: (b: boolean) => void;
}): React.ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSave(): Promise<void> {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Eksik Bilgi', 'Öğrencinin adı ve soyadı zorunludur.');
      return;
    }
    if (saving) return;
    onSavingChange(true);
    try {
      const payload: Parameters<typeof createStudent>[0] = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || (new Date().toISOString().split('T')[0] ?? ''),
      };
      if (gender.trim()) payload.gender = gender.trim();
      if (notes.trim()) payload.notes = notes.trim();
      const created = await createStudent(payload);
      onSaved(created);
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setGender('');
      setNotes('');
    } catch (err) {
      onError(err instanceof ApiError ? `API ${err.status}` : 'Kaydetme başarısız');
    } finally {
      onSavingChange(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Öğrenci Ekle</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Field label="Öğrenci Adı *" value={firstName} onChange={setFirstName} />
            <Field label="Öğrenci Soyadı *" value={lastName} onChange={setLastName} />
            <Field
              label="Doğum Tarihi (YYYY-AA-GG)"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              placeholder="Örn: 2021-04-15"
            />
            <Field
              label="Cinsiyet"
              value={gender}
              onChange={setGender}
              placeholder="Kız / Erkek"
            />
            <Field
              label="Özel Notlar"
              value={notes}
              onChange={setNotes}
              placeholder="Özel ilgi alanı veya notlar..."
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancelBtn} onPress={onClose}>
                <Text style={styles.modalCancelText}>Vazgeç</Text>
              </Pressable>

              <Pressable
                style={[styles.modalSubmitBtn, saving && { opacity: 0.6 }]}
                onPress={() => void handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.modalSubmitText}>Öğrenciyi Kaydet</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}): React.ReactElement {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.modalInput, multiline && styles.modalInputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topActionLeft: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  subActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  subActionText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    gap: 4,
    ...shadows.xs,
  },
  primaryAddText: {
    ...typography.captionBold,
    color: colors.textInverse,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  statValue: {
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

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },

  // Filter Chips
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterContainer: {
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  // Center / Loading
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  errorCard: {
    borderColor: colors.dangerBg,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    backgroundColor: colors.dangerBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  retryBtnText: {
    ...typography.captionBold,
    color: colors.dangerText,
  },

  // Student Card
  studentCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
  bloodBadge: {
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  bloodBadgeText: {
    ...typography.tiny,
    color: colors.dangerText,
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  statusBadgeText: {
    ...typography.captionBold,
    fontSize: 11,
  },

  allergyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.amberLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.sm,
    gap: 4,
  },
  allergyText: {
    ...typography.tiny,
    color: colors.amberText,
    flex: 1,
  },

  notesText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },

  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    gap: 4,
  },
  actionBtnText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  deleteBtn: {
    flex: 0,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.dangerBg,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.lg,
    maxHeight: '90%',
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
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 4,
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
  modalInputMultiline: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
});
