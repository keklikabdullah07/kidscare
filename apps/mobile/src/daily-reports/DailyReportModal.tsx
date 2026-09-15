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
import type {
  DailyReport,
  DailyReportInput,
  MealPortion,
  NapQuality,
  PottyEntry,
  PottyType,
  Student,
  StudentMood,
} from '@kidscare/shared-types';
import { ApiError } from '../api/client';
import { getStudentDailyReport, saveStudentDailyReport } from '../api/daily-reports';
import { colors, spacing } from '../theme';

const MOODS: { key: StudentMood; label: string; emoji: string }[] = [
  { key: 'HAPPY', label: 'Mutlu', emoji: '😄' },
  { key: 'CALM', label: 'Sakin', emoji: '😌' },
  { key: 'ENERGETIC', label: 'Enerjik', emoji: '⚡' },
  { key: 'TIRED', label: 'Yorgun', emoji: '🥱' },
  { key: 'CRANKY', label: 'Huysuz', emoji: '😣' },
  { key: 'SAD', label: 'Üzgün', emoji: '😢' },
];

const MEAL_PORTIONS: { key: MealPortion; label: string }[] = [
  { key: 'ALL', label: 'Hepsi' },
  { key: 'HALF', label: 'Yarım' },
  { key: 'LITTLE', label: 'Az' },
  { key: 'NONE', label: 'Yemedi' },
];

const NAP_QUALITIES: { key: NapQuality; label: string }[] = [
  { key: 'GOOD', label: 'Rahat / İyi' },
  { key: 'INTERRUPTED', label: 'Bölük Pörçük' },
  { key: 'NONE', label: 'Uyumadı' },
];

const POTTY_TYPES: { key: PottyType; label: string; emoji: string }[] = [
  { key: 'POTTY', label: 'Tuvalet', emoji: '🚽' },
  { key: 'WET', label: 'Islak Bez', emoji: '💧' },
  { key: 'DIRTY', label: 'Kirli Bez', emoji: '🧻' },
  { key: 'ACCIDENT', label: 'Kaza', emoji: '⚠️' },
];

const QUICK_ACTIVITIES = [
  'Serbest Oyun',
  'Görsel Sanatlar',
  'Müzik & Ritim',
  'Bahçe Zamanı',
  'Hikaye & Masal',
  'Jimnastik / Spor',
  'İngilizce',
  'Montessori & Akıl Oyunları',
];

interface Props {
  student: Student | null;
  date: string;
  visible: boolean;
  onClose: () => void;
  onSaved?: (report: DailyReport) => void;
}

export function DailyReportModal({
  student,
  date,
  visible,
  onClose,
  onSaved,
}: Props): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [mood, setMood] = useState<StudentMood | undefined>(undefined);
  const [breakfast, setBreakfast] = useState<MealPortion | undefined>(undefined);
  const [lunch, setLunch] = useState<MealPortion | undefined>(undefined);
  const [snack, setSnack] = useState<MealPortion | undefined>(undefined);
  const [mealNotes, setMealNotes] = useState('');

  const [napStart, setNapStart] = useState('');
  const [napEnd, setNapEnd] = useState('');
  const [napQuality, setNapQuality] = useState<NapQuality | undefined>(undefined);
  const [napNotes, setNapNotes] = useState('');

  const [pottyEntries, setPottyEntries] = useState<PottyEntry[]>([]);
  const [pottyTime, setPottyTime] = useState('');
  const [pottyType, setPottyType] = useState<PottyType>('POTTY');

  const [activities, setActivities] = useState<string[]>([]);
  const [teacherNote, setTeacherNote] = useState('');

  useEffect(() => {
    if (!student || !visible) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getStudentDailyReport(student.id, date)
      .then((report) => {
        if (cancelled) return;
        if (report) {
          setMood(report.mood ?? undefined);
          setBreakfast(report.meals?.breakfast ?? undefined);
          setLunch(report.meals?.lunch ?? undefined);
          setSnack(report.meals?.afternoonSnack ?? undefined);
          setMealNotes(report.meals?.notes ?? '');

          setNapStart(report.naps?.startTime ?? '');
          setNapEnd(report.naps?.endTime ?? '');
          setNapQuality(report.naps?.quality ?? undefined);
          setNapNotes(report.naps?.notes ?? '');

          setPottyEntries(report.potty ?? []);
          setActivities(report.activities ?? []);
          setTeacherNote(report.teacherNote ?? '');
        } else {
          setMood(undefined);
          setBreakfast(undefined);
          setLunch(undefined);
          setSnack(undefined);
          setMealNotes('');
          setNapStart('13:00');
          setNapEnd('14:30');
          setNapQuality('GOOD');
          setNapNotes('');
          setPottyEntries([]);
          setActivities([]);
          setTeacherNote('');
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Yüklenemedi');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [student, date, visible]);

  function toggleActivity(act: string): void {
    setActivities((prev) => (prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]));
  }

  function addPotty(): void {
    if (!pottyTime.trim()) return;
    const newEntry: PottyEntry = {
      id: `p-${Date.now()}`,
      time: pottyTime.trim(),
      type: pottyType,
    };
    setPottyEntries((prev) => [...prev, newEntry]);
    setPottyTime('');
  }

  function removePotty(id: string): void {
    setPottyEntries((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSave(): Promise<void> {
    if (!student || saving) return;
    setSaving(true);
    try {
      const payload: DailyReportInput = {
        mood,
        meals: {
          breakfast,
          lunch,
          afternoonSnack: snack,
          notes: mealNotes.trim() || undefined,
        },
        naps: {
          startTime: napStart.trim() || undefined,
          endTime: napEnd.trim() || undefined,
          quality: napQuality,
          notes: napNotes.trim() || undefined,
        },
        potty: pottyEntries,
        activities,
        teacherNote: teacherNote.trim() || undefined,
      };

      const saved = await saveStudentDailyReport(student.id, date, payload);
      if (onSaved) onSaved(saved);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Günlük rapor kaydedildi.');
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof ApiError ? `API ${err.status}` : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  if (!student) return <></>;

  const selectedMoodObj = MOODS.find((m) => m.key === mood);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.flex1}>
              <Text style={styles.headerTitle}>🌟 Günlük Takip ({date})</Text>
              <Text style={styles.headerSub}>
                {student.firstName} {student.lastName}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Mode switch */}
              <View style={styles.tabRow}>
                <Pressable
                  style={[styles.tab, !isEditing && styles.tabActive]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={[styles.tabText, !isEditing && styles.tabTextActive]}>
                    Özet Görünüm
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, isEditing && styles.tabActive]}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={[styles.tabText, isEditing && styles.tabTextActive]}>
                    ✏️ Düzenle
                  </Text>
                </Pressable>
              </View>

              {!isEditing ? (
                /* View Mode */
                <View style={styles.sectionContainer}>
                  {/* Mood Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardLabel}>Günün Ruh Hali</Text>
                    {selectedMoodObj ? (
                      <View style={styles.moodRow}>
                        <Text style={styles.moodEmoji}>{selectedMoodObj.emoji}</Text>
                        <Text style={styles.moodTitle}>{selectedMoodObj.label}</Text>
                      </View>
                    ) : (
                      <Text style={styles.mutedText}>Mod henüz girilmedi.</Text>
                    )}
                  </View>

                  {/* Meals Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>🍽️ Beslenme & Yemek</Text>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>Sabah Kahvaltısı:</Text>
                      <Text style={styles.itemValue}>
                        {breakfast ? formatMeal(breakfast) : '—'}
                      </Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>Öğle Yemeği:</Text>
                      <Text style={styles.itemValue}>{lunch ? formatMeal(lunch) : '—'}</Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>İkindi Ara Öğün:</Text>
                      <Text style={styles.itemValue}>{snack ? formatMeal(snack) : '—'}</Text>
                    </View>
                    {mealNotes ? <Text style={styles.subNote}>Not: {mealNotes}</Text> : null}
                  </View>

                  {/* Nap Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>😴 Uyku Takibi</Text>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>Uyku Süresi:</Text>
                      <Text style={styles.itemValue}>
                        {napStart && napEnd ? `${napStart} - ${napEnd}` : '—'}
                      </Text>
                    </View>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemLabel}>Uyku Kalitesi:</Text>
                      <Text style={styles.itemValue}>
                        {napQuality ? formatNap(napQuality) : '—'}
                      </Text>
                    </View>
                  </View>

                  {/* Potty Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>🚻 Tuvalet & Bez ({pottyEntries.length})</Text>
                    {pottyEntries.length > 0 ? (
                      <View style={styles.tagWrap}>
                        {pottyEntries.map((p) => {
                          const info = POTTY_TYPES.find((pt) => pt.key === p.type);
                          return (
                            <View key={p.id} style={styles.pill}>
                              <Text style={styles.pillText}>
                                {info?.emoji} {p.time} ({info?.label})
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={styles.mutedText}>Kayıt bulunmuyor.</Text>
                    )}
                  </View>

                  {/* Activities Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                      🎨 Günün Aktiviteleri ({activities.length})
                    </Text>
                    {activities.length > 0 ? (
                      <View style={styles.tagWrap}>
                        {activities.map((a) => (
                          <View key={a} style={styles.activityPill}>
                            <Text style={styles.activityPillText}>✓ {a}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.mutedText}>Etkinlik seçilmedi.</Text>
                    )}
                  </View>

                  {/* Teacher Note */}
                  {teacherNote ? (
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>📝 Öğretmen Gün Sonu Notu</Text>
                      <Text style={styles.notesText}>"{teacherNote}"</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                /* Edit Mode */
                <View style={styles.sectionContainer}>
                  {/* Mood Picker */}
                  <Text style={styles.fieldLabel}>Ruh Hali Seçimi</Text>
                  <View style={styles.moodGrid}>
                    {MOODS.map((m) => {
                      const sel = mood === m.key;
                      return (
                        <Pressable
                          key={m.key}
                          style={[styles.moodBtn, sel && styles.moodBtnActive]}
                          onPress={() => setMood(m.key)}
                        >
                          <Text style={styles.moodBtnEmoji}>{m.emoji}</Text>
                          <Text style={[styles.moodBtnText, sel && styles.moodBtnTextActive]}>
                            {m.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Meals */}
                  <Text style={styles.fieldLabel}>Sabah Kahvaltısı</Text>
                  <View style={styles.tagWrap}>
                    {MEAL_PORTIONS.map((mp) => (
                      <Pressable
                        key={mp.key}
                        style={[styles.choiceBtn, breakfast === mp.key && styles.choiceBtnActive]}
                        onPress={() => setBreakfast(mp.key)}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            breakfast === mp.key && styles.choiceBtnTextActive,
                          ]}
                        >
                          {mp.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Öğle Yemeği</Text>
                  <View style={styles.tagWrap}>
                    {MEAL_PORTIONS.map((mp) => (
                      <Pressable
                        key={mp.key}
                        style={[styles.choiceBtn, lunch === mp.key && styles.choiceBtnActive]}
                        onPress={() => setLunch(mp.key)}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            lunch === mp.key && styles.choiceBtnTextActive,
                          ]}
                        >
                          {mp.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>İkindi Ara Öğün</Text>
                  <View style={styles.tagWrap}>
                    {MEAL_PORTIONS.map((mp) => (
                      <Pressable
                        key={mp.key}
                        style={[styles.choiceBtn, snack === mp.key && styles.choiceBtnActive]}
                        onPress={() => setSnack(mp.key)}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            snack === mp.key && styles.choiceBtnTextActive,
                          ]}
                        >
                          {mp.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Uyuma Saati (SS:DD)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={napStart}
                    onChangeText={setNapStart}
                    placeholder="13:00"
                  />
                  <Text style={styles.fieldLabel}>Uyanma Saati (SS:DD)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={napEnd}
                    onChangeText={setNapEnd}
                    placeholder="14:30"
                  />
                  <Text style={styles.fieldLabel}>Uyku Kalitesi</Text>
                  <View style={styles.tagWrap}>
                    {NAP_QUALITIES.map((nq) => (
                      <Pressable
                        key={nq.key}
                        style={[styles.choiceBtn, napQuality === nq.key && styles.choiceBtnActive]}
                        onPress={() => setNapQuality(nq.key)}
                      >
                        <Text
                          style={[
                            styles.choiceBtnText,
                            napQuality === nq.key && styles.choiceBtnTextActive,
                          ]}
                        >
                          {nq.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Potty */}
                  <Text style={styles.fieldLabel}>Tuvalet / Bez Kaydı Ekle</Text>
                  <View style={styles.pottyAddBox}>
                    <TextInput
                      style={styles.textInput}
                      value={pottyTime}
                      onChangeText={setPottyTime}
                      placeholder="Saat (Örn: 10:30)"
                    />
                    <View style={styles.tagWrap}>
                      {POTTY_TYPES.map((pt) => (
                        <Pressable
                          key={pt.key}
                          style={[styles.choiceBtn, pottyType === pt.key && styles.choiceBtnActive]}
                          onPress={() => setPottyType(pt.key)}
                        >
                          <Text
                            style={[
                              styles.choiceBtnText,
                              pottyType === pt.key && styles.choiceBtnTextActive,
                            ]}
                          >
                            {pt.emoji} {pt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Pressable style={styles.addBtn} onPress={addPotty}>
                      <Text style={styles.addBtnText}>+ Tuvalet Kaydı Ekle</Text>
                    </Pressable>
                  </View>

                  {pottyEntries.map((p) => {
                    const info = POTTY_TYPES.find((pt) => pt.key === p.type);
                    return (
                      <View key={p.id} style={styles.pottyRow}>
                        <Text style={styles.pottyText}>
                          {info?.emoji} {p.time} - {info?.label}
                        </Text>
                        <Pressable onPress={() => removePotty(p.id)}>
                          <Text style={styles.deleteText}>Sil</Text>
                        </Pressable>
                      </View>
                    );
                  })}

                  {/* Activities multi-select */}
                  <Text style={styles.fieldLabel}>Günün Aktiviteleri</Text>
                  <View style={styles.tagWrap}>
                    {QUICK_ACTIVITIES.map((qa) => {
                      const sel = activities.includes(qa);
                      return (
                        <Pressable
                          key={qa}
                          style={[styles.choiceBtn, sel && styles.activityBtnActive]}
                          onPress={() => toggleActivity(qa)}
                        >
                          <Text style={[styles.choiceBtnText, sel && styles.choiceBtnTextActive]}>
                            {sel ? `✓ ${qa}` : `+ ${qa}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Teacher Note */}
                  <Text style={styles.fieldLabel}>Öğretmen Notu & Veli Mesajı</Text>
                  <TextInput
                    style={[styles.textInput, styles.multiline]}
                    value={teacherNote}
                    onChangeText={setTeacherNote}
                    multiline
                    numberOfLines={3}
                    placeholder="Günün nasıl geçtiği hakkında veliye özel not..."
                  />

                  {/* Save Button */}
                  <Pressable
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={() => void handleSave()}
                    disabled={saving}
                  >
                    <Text style={styles.saveBtnText}>
                      {saving ? 'Kaydediliyor…' : 'Günlük Raporu Kaydet'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function formatMeal(portion: MealPortion): string {
  switch (portion) {
    case 'ALL':
      return 'Hepsini Yedi (Tam)';
    case 'HALF':
      return 'Yarısını Yedi';
    case 'LITTLE':
      return 'Az Yedi';
    case 'NONE':
      return 'Yemedi';
  }
}

function formatNap(q: NapQuality): string {
  switch (q) {
    case 'GOOD':
      return 'Rahat / Kesintisiz';
    case 'INTERRUPTED':
      return 'Bölük Pörçük';
    case 'NONE':
      return 'Uyumadı';
  }
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  flex1: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  closeBtn: { padding: spacing.xs },
  closeBtnText: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  center: { padding: spacing.xl, alignItems: 'center' },
  scrollContent: { padding: spacing.md },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: { backgroundColor: colors.surface, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  tabTextActive: { color: colors.textPrimary, fontWeight: '700' },

  sectionContainer: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardLabel: { fontSize: 12, color: colors.textSecondary },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  moodEmoji: { fontSize: 28 },
  moodTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  mutedText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  itemLabel: { fontSize: 13, color: colors.textSecondary },
  itemValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  subNote: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 4 },

  pill: {
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: { fontSize: 12, color: colors.textPrimary, fontWeight: '500' },
  activityPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  activityPillText: { fontSize: 12, color: '#6B21A8', fontWeight: '600' },
  notesText: { fontSize: 13, color: colors.textPrimary, fontStyle: 'italic', lineHeight: 18 },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.xs },
  moodBtn: {
    width: '31%',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  moodBtnActive: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  moodBtnEmoji: { fontSize: 20 },
  moodBtnText: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  moodBtnTextActive: { color: colors.primary, fontWeight: '700' },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choiceBtn: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  activityBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  choiceBtnText: { fontSize: 12, color: colors.textPrimary },
  choiceBtnTextActive: { color: colors.surface, fontWeight: '700' },

  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },

  pottyAddBox: {
    backgroundColor: colors.bg,
    padding: spacing.sm,
    borderRadius: 6,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  addBtn: {
    backgroundColor: '#374151',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  addBtnText: { color: colors.surface, fontSize: 12, fontWeight: '600' },
  pottyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pottyText: { fontSize: 12, color: colors.textPrimary },
  deleteText: { color: colors.danger, fontSize: 12, fontWeight: '600' },

  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.surface, fontWeight: '700', fontSize: 14 },
});
