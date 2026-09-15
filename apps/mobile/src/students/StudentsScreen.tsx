import { useEffect, useState } from 'react';
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
import type { Attendance, AttendanceStatus, Student } from '@kidscare/shared-types';
import { getAttendanceByDate } from '../api/attendance';
import { ApiError } from '../api/client';
import { createStudent, deleteStudent, listStudents } from '../api/students';
import { ActivityGalleryModal } from '../activities/ActivityGalleryModal';
import { AttendanceCheckModal } from '../attendance/AttendanceCheckModal';
import { useAuth } from '../auth/AuthContext';
import { DailyMenuModal } from '../daily-menus/DailyMenuModal';
import { DailyReportModal } from '../daily-reports/DailyReportModal';
import { colors, spacing } from '../theme';
import { StudentPassportModal } from './StudentPassportModal';

type Status = 'loading' | 'ready' | 'error';

const ATTENDANCE_BADGES: Record<
  AttendanceStatus,
  { label: string; emoji: string; bg: string; text: string }
> = {
  PRESENT: { label: 'İçeride', emoji: '🟢', bg: '#D1FAE5', text: '#065F46' },
  LEFT: { label: 'Ayrıldı', emoji: '🔵', bg: '#DBEAFE', text: '#1E40AF' },
  EXCUSED: { label: 'İzinli', emoji: '🟡', bg: '#FEF3C7', text: '#92400E' },
  ABSENT: { label: 'Yok', emoji: '⚪', bg: '#F3F4F6', text: '#6B7280' },
};

export function StudentsScreen(): React.ReactElement {
  const { logout, state } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
    Alert.alert('Öğrenciyi sil', `${s.firstName} ${s.lastName} silinecek. Emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: doDelete },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.flex1}>
          <Text style={styles.welcome}>
            Hoş geldin,{' '}
            <Text style={styles.bold}>
              {state.status === 'authenticated' ? state.user.email || state.user.id : ''}
            </Text>
          </Text>
        </View>
        <Pressable onPress={() => void logout()}>
          <Text style={styles.logout}>Çıkış</Text>
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.title}>Öğrenciler ({students.length})</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.galleryButton} onPress={() => setGalleryModalOpen(true)}>
            <Text style={styles.galleryButtonText}>📸 Galeri</Text>
          </Pressable>
          <Pressable style={styles.menuButton} onPress={() => setMenuModalOpen(true)}>
            <Text style={styles.menuButtonText}>🍲 Menü</Text>
          </Pressable>
          <Pressable style={styles.addButton} onPress={() => setModalOpen(true)}>
            <Text style={styles.addButtonText}>+ Ekle</Text>
          </Pressable>
        </View>
      </View>

      {errorMsg && (
        <Text style={styles.error} role="alert">
          {errorMsg}
        </Text>
      )}

      {status === 'loading' && <ActivityIndicator size="large" color={colors.primary} />}
      {status === 'error' && <Text style={styles.error}>Öğrenciler yüklenemedi.</Text>}
      {status === 'ready' && students.length === 0 && (
        <Text style={styles.empty}>Henüz öğrenci yok. Yukarıdan ekleyin.</Text>
      )}
      {status === 'ready' && students.length > 0 && (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const att = attendanceMap[item.id];
            const attStatus: AttendanceStatus = att?.status ?? 'ABSENT';
            const attInfo = ATTENDANCE_BADGES[attStatus];

            return (
              <Pressable
                style={styles.row}
                onLongPress={() => handleDelete(item)}
                onPress={() => setTrackingStudent(item)}
              >
                <View style={styles.flex1}>
                  <View style={styles.nameRow}>
                    <Text style={styles.rowName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    {item.passport?.bloodType && item.passport.bloodType !== 'UNKNOWN' && (
                      <View style={styles.bloodPill}>
                        <Text style={styles.bloodPillText}>🩸 {item.passport.bloodType}</Text>
                      </View>
                    )}
                    {item.passport?.allergies && item.passport.allergies.length > 0 && (
                      <View style={styles.allergyPill}>
                        <Text style={styles.allergyPillText}>
                          ⚠️ {item.passport.allergies.length} Alerji
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rowMeta}>
                    {item.dateOfBirth} · {item.gender ?? '—'}
                  </Text>
                  {item.notes && (
                    <Text style={styles.rowNotes} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  )}
                </View>
                <View style={styles.rightCol}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.attBadge, { backgroundColor: attInfo.bg }]}>
                      <Text style={[styles.attBadgeText, { color: attInfo.text }]}>
                        {attInfo.emoji} {attInfo.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: item.isActive ? colors.successBg : '#E5E7EB' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: item.isActive ? colors.successText : colors.textMuted },
                        ]}
                      >
                        {item.isActive ? 'Aktif' : 'Pasif'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionBtnRow}>
                    <Pressable
                      style={styles.attendanceBtn}
                      onPress={() => setAttendanceStudent(item)}
                    >
                      <Text style={styles.attendanceBtnText}>🛡️ Yoklama</Text>
                    </Pressable>
                    <Pressable style={styles.passportBtn} onPress={() => setPassportStudent(item)}>
                      <Text style={styles.passportBtnText}>📋 Pasaport</Text>
                    </Pressable>
                    <Pressable style={styles.trackingBtn} onPress={() => setTrackingStudent(item)}>
                      <Text style={styles.trackingBtnText}>🌟 Günlük</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <NewStudentModal
        visible={modalOpen}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSaved={(s) => {
          setStudents((prev) => [...prev, s].sort(byLastName));
          setModalOpen(false);
        }}
        onError={setErrorMsg}
        onSavingChange={setSaving}
      />

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

      <DailyReportModal
        student={trackingStudent}
        date={todayStr}
        visible={trackingStudent !== null}
        onClose={() => setTrackingStudent(null)}
      />

      <AttendanceCheckModal
        student={attendanceStudent}
        date={todayStr}
        visible={attendanceStudent !== null}
        onClose={() => setAttendanceStudent(null)}
        onAttendanceUpdated={(att) => {
          setAttendanceMap((prev) => ({ ...prev, [att.studentId]: att }));
        }}
      />

      <DailyMenuModal
        date={todayStr}
        visible={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
      />

      <ActivityGalleryModal
        visible={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        userRole={state.status === 'authenticated' ? state.user.role : undefined}
      />
    </View>
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
    if (saving) return;
    onSavingChange(true);
    try {
      const payload: Parameters<typeof createStudent>[0] = {
        firstName,
        lastName,
        dateOfBirth,
      };
      if (gender) payload.gender = gender;
      if (notes) payload.notes = notes;
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
            <Text style={styles.modalTitle}>Yeni öğrenci</Text>
            <Field label="Ad" value={firstName} onChange={setFirstName} />
            <Field label="Soyad" value={lastName} onChange={setLastName} />
            <Field
              label="Doğum tarihi (YYYY-AA-GG)"
              value={dateOfBirth}
              onChange={setDateOfBirth}
            />
            <Field label="Cinsiyet" value={gender} onChange={setGender} />
            <Field label="Notlar" value={notes} onChange={setNotes} multiline />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonTextSecondary}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => void handleSave()}
                disabled={saving}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {saving ? 'Kaydediliyor…' : 'Ekle'}
                </Text>
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
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}): React.ReactElement {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  flex1: { flex: 1 },
  welcome: { fontSize: 13, color: colors.textSecondary },
  bold: { fontWeight: '600', color: colors.textPrimary },
  logout: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  toolbarActions: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  galleryButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  galleryButtonText: { color: '#4338CA', fontWeight: '700', fontSize: 13 },
  menuButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  menuButtonText: { color: '#92400E', fontWeight: '700', fontSize: 13 },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  addButtonText: { color: colors.surface, fontWeight: '600', fontSize: 14 },

  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  error: { color: colors.danger, paddingHorizontal: spacing.md, marginBottom: spacing.sm },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rowName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  bloodPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bloodPillText: { color: '#991B1B', fontWeight: '700', fontSize: 11 },
  allergyPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  allergyPillText: { color: '#92400E', fontWeight: '600', fontSize: 11 },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowNotes: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  badgeRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  attBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attBadgeText: { fontSize: 10, fontWeight: '700' },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  actionBtnRow: { flexDirection: 'row', gap: 4 },
  attendanceBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: '#ECFDF5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  attendanceBtnText: { fontSize: 11, color: '#047857', fontWeight: '600' },
  passportBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  passportBtnText: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  trackingBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  trackingBtnText: { fontSize: 11, color: '#92400E', fontWeight: '600' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  modalButtonPrimary: { backgroundColor: colors.primary },
  modalButtonSecondary: { backgroundColor: colors.bg },
  modalButtonTextPrimary: { color: colors.surface, fontWeight: '600' },
  modalButtonTextSecondary: { color: colors.textPrimary, fontWeight: '600' },

  field: { marginBottom: spacing.md },
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
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
});
