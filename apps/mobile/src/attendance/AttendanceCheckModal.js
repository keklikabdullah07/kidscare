import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { checkInStudent, checkOutStudent, getStudentAttendance, updateStudentAttendance, } from '../api/attendance';
import { ApiError } from '../api/client';
import { colors, spacing } from '../theme';
const STATUS_CONFIG = {
    PRESENT: {
        label: 'Giriş Yaptı (Mevcut)',
        emoji: '🟢',
        color: '#065F46',
        bg: '#D1FAE5',
    },
    LEFT: {
        label: 'Teslim Edildi (Ayrıldı)',
        emoji: '🔵',
        color: '#1E40AF',
        bg: '#DBEAFE',
    },
    EXCUSED: {
        label: 'İzinli / Raporlu',
        emoji: '🟡',
        color: '#92400E',
        bg: '#FEF3C7',
    },
    ABSENT: {
        label: 'Gelmedi',
        emoji: '⚪',
        color: '#4B5563',
        bg: '#F3F4F6',
    },
};
export function AttendanceCheckModal({ student, date, visible, onClose, onAttendanceUpdated, }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [attendance, setAttendance] = useState(null);
    // Check-out form states
    const [showCheckOutForm, setShowCheckOutForm] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState('');
    const [customPerson, setCustomPerson] = useState('');
    const [pickupNote, setPickupNote] = useState('');
    // Check-in form states
    const [checkInBy, setCheckInBy] = useState('');
    useEffect(() => {
        if (visible && student) {
            setLoading(true);
            setShowCheckOutForm(false);
            setSelectedContactId('');
            setCustomPerson('');
            setPickupNote('');
            setCheckInBy('');
            getStudentAttendance(student.id, date)
                .then((data) => {
                setAttendance(data);
                setLoading(false);
            })
                .catch(() => {
                setAttendance(null);
                setLoading(false);
            });
        }
    }, [visible, student, date]);
    if (!student)
        return <></>;
    const currentStatus = attendance?.status ?? 'ABSENT';
    const statusInfo = STATUS_CONFIG[currentStatus];
    const contacts = student.passport?.emergencyContacts ?? [];
    const authorizedContacts = contacts.filter((c) => c.isAuthorizedPickup);
    function getNowTimeString() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    async function handleQuickCheckIn() {
        if (!student || saving)
            return;
        setSaving(true);
        try {
            const saved = await checkInStudent(student.id, date, {
                checkInTime: getNowTimeString(),
                checkInBy: checkInBy.trim() || undefined,
            });
            setAttendance(saved);
            onAttendanceUpdated?.(saved);
            Alert.alert('Başarılı', 'Öğrenci girişi kaydedildi.');
        }
        catch (err) {
            Alert.alert('Hata', err instanceof ApiError ? `API ${err.status}` : 'Giriş kaydedilemedi');
        }
        finally {
            setSaving(false);
        }
    }
    async function handleCompleteCheckOut() {
        if (!student || saving)
            return;
        let who = '';
        let contactId = undefined;
        if (selectedContactId && selectedContactId !== 'CUSTOM') {
            const found = contacts.find((c) => (c.id || c.name) === selectedContactId);
            if (found) {
                who = `${found.name} (${found.relationship})`;
                contactId = found.id;
            }
        }
        else {
            who = customPerson.trim();
        }
        if (!who) {
            Alert.alert('Eksik Bilgi', 'Lütfen çocuğu teslim alan kişiyi belirtin.');
            return;
        }
        setSaving(true);
        try {
            const saved = await checkOutStudent(student.id, date, {
                checkOutTime: getNowTimeString(),
                checkOutBy: who,
                pickupContactId: contactId,
                pickupNote: pickupNote.trim() || undefined,
            });
            setAttendance(saved);
            setShowCheckOutForm(false);
            onAttendanceUpdated?.(saved);
            Alert.alert('Başarılı', 'Güvenli çıkış teslimatı tamamlandı.');
        }
        catch (err) {
            Alert.alert('Hata', err instanceof ApiError ? `API ${err.status}` : 'Çıkış kaydedilemedi');
        }
        finally {
            setSaving(false);
        }
    }
    async function handleStatusChange(newStatus) {
        if (!student || saving)
            return;
        setSaving(true);
        try {
            const saved = await updateStudentAttendance(student.id, date, {
                status: newStatus,
                ...(newStatus === 'ABSENT' || newStatus === 'EXCUSED'
                    ? { checkInTime: null, checkOutTime: null }
                    : {}),
            });
            setAttendance(saved);
            onAttendanceUpdated?.(saved);
        }
        catch (err) {
            Alert.alert('Hata', err instanceof ApiError ? `API ${err.status}` : 'Durum güncellenemedi');
        }
        finally {
            setSaving(false);
        }
    }
    const isCustomPickup = selectedContactId === 'CUSTOM' || (!selectedContactId && authorizedContacts.length === 0);
    return (<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.flex1}>
                <View style={styles.titleRow}>
                  <Text style={styles.emoji}>🛡️</Text>
                  <Text style={styles.modalTitle}>
                    {student.firstName} {student.lastName}
                  </Text>
                </View>
                <Text style={styles.subtitle}>Giriş-Çıkış & Güvenli Teslimat ({date})</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {loading ? (<ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }}/>) : (<View style={styles.content}>
                {/* Current Status Box */}
                <View style={[styles.statusBox, { backgroundColor: statusInfo.bg }]}>
                  <Text style={styles.statusBoxLabel}>Güncel Durum:</Text>
                  <Text style={[styles.statusBoxValue, { color: statusInfo.color }]}>
                    {statusInfo.emoji} {statusInfo.label}
                  </Text>

                  {attendance?.checkInTime && (<Text style={styles.timeInfoText}>
                      🕒 Giriş: {attendance.checkInTime}{' '}
                      {attendance.checkInBy ? `(${attendance.checkInBy})` : ''}
                    </Text>)}
                  {attendance?.checkOutTime && (<Text style={styles.timeInfoText}>
                      🔒 Çıkış: {attendance.checkOutTime} · Teslim Alan: {attendance.checkOutBy}
                    </Text>)}
                  {attendance?.pickupNote && (<Text style={styles.noteText}>Not: {attendance.pickupNote}</Text>)}
                </View>

                {/* Quick Action Buttons */}
                {!showCheckOutForm && (<View style={styles.actionGrid}>
                    {currentStatus !== 'PRESENT' && currentStatus !== 'LEFT' && (<View style={styles.checkInSection}>
                        <Text style={styles.inputLabel}>Getiren Kişi (Opsiyonel):</Text>
                        <TextInput style={styles.input} value={checkInBy} onChangeText={setCheckInBy} placeholder="Örn: Anne, Servis"/>
                        <Pressable style={[styles.mainBtn, styles.checkInBtn]} onPress={() => void handleQuickCheckIn()} disabled={saving}>
                          <Text style={styles.mainBtnText}>🟢 Giriş Yap (Mevcut)</Text>
                        </Pressable>
                      </View>)}

                    {currentStatus === 'PRESENT' && (<Pressable style={[styles.mainBtn, styles.checkOutBtn]} onPress={() => setShowCheckOutForm(true)} disabled={saving}>
                        <Text style={styles.mainBtnText}>🔒 Güvenli Teslim Et & Çıkış Yap</Text>
                      </Pressable>)}

                    {currentStatus === 'LEFT' && (<Pressable style={[styles.mainBtn, styles.secondaryBtn]} onPress={() => setShowCheckOutForm(true)} disabled={saving}>
                        <Text style={styles.secondaryBtnText}>✏️ Teslim Bilgilerini Düzenle</Text>
                      </Pressable>)}

                    <View style={styles.statusBtnRow}>
                      {currentStatus !== 'EXCUSED' && (<Pressable style={[styles.statusBtn, styles.excusedBtn]} onPress={() => void handleStatusChange('EXCUSED')} disabled={saving}>
                          <Text style={styles.excusedBtnText}>🟡 İzinli</Text>
                        </Pressable>)}
                      {currentStatus !== 'ABSENT' && (<Pressable style={[styles.statusBtn, styles.absentBtn]} onPress={() => void handleStatusChange('ABSENT')} disabled={saving}>
                          <Text style={styles.absentBtnText}>⚪ Gelmedi</Text>
                        </Pressable>)}
                    </View>
                  </View>)}

                {/* Check Out Verification Form */}
                {showCheckOutForm && (<View style={styles.checkOutForm}>
                    <Text style={styles.sectionHeader}>
                      📋 Pasaporttaki Yetkili Teslim Alıcılar
                    </Text>

                    {authorizedContacts.length > 0 ? (authorizedContacts.map((c, idx) => {
                    const contactKey = c.id || c.name || `c-${idx}`;
                    const isSelected = selectedContactId === contactKey;
                    return (<Pressable key={contactKey} style={[styles.contactCard, isSelected && styles.contactCardSelected]} onPress={() => setSelectedContactId(contactKey)}>
                            <View style={styles.radioCircle}>
                              {isSelected && <View style={styles.radioDot}/>}
                            </View>
                            <View style={styles.flex1}>
                              <Text style={styles.contactName}>
                                {c.name} <Text style={styles.contactRel}>({c.relationship})</Text>
                              </Text>
                              <Text style={styles.contactPhone}>📞 {c.phone || 'Telefon yok'}</Text>
                            </View>
                            <View style={styles.authBadge}>
                              <Text style={styles.authBadgeText}>✓ Yetkili</Text>
                            </View>
                          </Pressable>);
                })) : (<View style={styles.noContactsWarning}>
                        <Text style={styles.noContactsText}>
                          ⚠️ Pasaportta yetkili teslim alıcı bulunamadı.
                        </Text>
                      </View>)}

                    {/* Custom Person Option */}
                    <Pressable style={[
                    styles.contactCard,
                    selectedContactId === 'CUSTOM' && styles.contactCardCustom,
                ]} onPress={() => setSelectedContactId('CUSTOM')}>
                      <View style={styles.radioCircle}>
                        {selectedContactId === 'CUSTOM' && <View style={styles.radioDot}/>}
                      </View>
                      <View style={styles.flex1}>
                        <Text style={styles.contactName}>➕ Başka Bir Kişi (Özel Teslim)</Text>
                        <Text style={styles.contactRel}>Pasaport harici veli/akraba</Text>
                      </View>
                    </Pressable>

                    {/* Custom Person Details */}
                    {isCustomPickup && (<View style={styles.customBox}>
                        <Text style={styles.customBoxTitle}>⚠️ Yetki Doğrulama & Veli Onayı</Text>
                        <Text style={styles.inputLabel}>Teslim Alan Kişi & Yakınlığı:</Text>
                        <TextInput style={styles.input} value={customPerson} onChangeText={setCustomPerson} placeholder="Örn: Merve Kaya (Teyze)"/>
                        <Text style={styles.inputLabel}>Veli İzin Notu:</Text>
                        <TextInput style={[styles.input, styles.inputMultiline]} value={pickupNote} onChangeText={setPickupNote} placeholder="Örn: Anne telefonla arayarak onay verdi." multiline/>
                      </View>)}

                    {/* Check Out Action Buttons */}
                    <View style={styles.checkoutActions}>
                      <Pressable style={styles.cancelBtn} onPress={() => setShowCheckOutForm(false)} disabled={saving}>
                        <Text style={styles.cancelBtnText}>Vazgeç</Text>
                      </Pressable>
                      <Pressable style={[styles.mainBtn, styles.checkOutBtn, { flex: 1 }]} onPress={() => void handleCompleteCheckOut()} disabled={saving}>
                        <Text style={styles.mainBtnText}>
                          {saving ? 'Kaydediliyor…' : '🔒 Çıkışı Onayla'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>)}
              </View>)}
          </ScrollView>
        </View>
      </View>
    </Modal>);
}
const styles = StyleSheet.create({
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.sm,
        marginBottom: spacing.md,
    },
    flex1: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    emoji: { fontSize: 18 },
    modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
    subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    closeBtn: { padding: 4 },
    closeText: { fontSize: 18, color: colors.textMuted },
    content: { gap: spacing.md },
    statusBox: {
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusBoxLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    statusBoxValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
    timeInfoText: { fontSize: 12, color: colors.textPrimary, marginTop: 4, fontWeight: '500' },
    noteText: { fontSize: 11, color: '#92400E', fontStyle: 'italic', marginTop: 2 },
    actionGrid: { gap: spacing.sm },
    checkInSection: { gap: 6, marginBottom: 4 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        fontSize: 13,
        backgroundColor: '#FAFAFA',
    },
    inputMultiline: { minHeight: 48, textAlignVertical: 'top' },
    mainBtn: {
        paddingVertical: spacing.sm + 2,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkInBtn: { backgroundColor: '#059669' },
    checkOutBtn: { backgroundColor: '#2563EB' },
    secondaryBtn: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB' },
    mainBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    secondaryBtnText: { color: colors.textPrimary, fontWeight: '600', fontSize: 13 },
    statusBtnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
    statusBtn: {
        flex: 1,
        paddingVertical: spacing.xs + 2,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
    },
    excusedBtn: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
    excusedBtnText: { color: '#92400E', fontWeight: '600', fontSize: 12 },
    absentBtn: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
    absentBtnText: { color: '#4B5563', fontWeight: '600', fontSize: 12 },
    checkOutForm: { gap: spacing.sm },
    sectionHeader: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.sm + 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: '#FFFFFF',
    },
    contactCardSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
    contactCardCustom: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563EB' },
    contactName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    contactRel: { fontSize: 12, fontWeight: 'normal', color: colors.textSecondary },
    contactPhone: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    authBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    authBadgeText: { color: '#065F46', fontSize: 10, fontWeight: '700' },
    noContactsWarning: {
        backgroundColor: '#FEF3C7',
        padding: spacing.sm,
        borderRadius: 6,
    },
    noContactsText: { color: '#92400E', fontSize: 12 },
    customBox: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 8,
        padding: spacing.sm,
        gap: 6,
    },
    customBoxTitle: { fontSize: 12, fontWeight: '700', color: '#92400E' },
    checkoutActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    cancelBtn: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
});
