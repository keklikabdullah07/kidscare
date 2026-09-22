import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { ApiError } from '../api/client';
import { getStudentPassport, updateStudentPassport } from '../api/students';
import { colors, spacing } from '../theme';
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', 'UNKNOWN'];
const QUICK_ALLERGIES = ['Fıstık', 'Süt / Laktoz', 'Yumurta', 'Gluten', 'Balık', 'Polen'];
export function StudentPassportModal({ student, visible, onClose, onSaved, }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [bloodType, setBloodType] = useState('UNKNOWN');
    const [allergies, setAllergies] = useState([]);
    const [customAllergy, setCustomAllergy] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [chronicConditions, setChronicConditions] = useState([]);
    const [regularMedications, setRegularMedications] = useState([]);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [doctorName, setDoctorName] = useState('');
    const [doctorPhone, setDoctorPhone] = useState('');
    const [specialNotes, setSpecialNotes] = useState('');
    // Contact input state
    const [cName, setCName] = useState('');
    const [cRel, setCRel] = useState('');
    const [cPhone, setCPhone] = useState('');
    useEffect(() => {
        if (!student || !visible)
            return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        getStudentPassport(student.id)
            .then((p) => {
            if (cancelled)
                return;
            setBloodType(p.bloodType || 'UNKNOWN');
            setAllergies(p.allergies || []);
            setDietaryRestrictions(p.dietaryRestrictions || []);
            setChronicConditions(p.chronicConditions || []);
            setRegularMedications(p.regularMedications || []);
            setEmergencyContacts(p.emergencyContacts || []);
            setDoctorName(p.doctorName || '');
            setDoctorPhone(p.doctorPhone || '');
            setSpecialNotes(p.specialNotes || '');
            setLoading(false);
        })
            .catch((err) => {
            if (cancelled)
                return;
            setError(err instanceof Error ? err.message : 'Yüklenemedi');
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [student, visible]);
    function toggleAllergy(item) {
        setAllergies((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
    }
    function addCustomAllergy() {
        if (!customAllergy.trim() || allergies.includes(customAllergy.trim()))
            return;
        setAllergies((prev) => [...prev, customAllergy.trim()]);
        setCustomAllergy('');
    }
    function addContact() {
        if (!cName.trim() || !cPhone.trim())
            return;
        const newContact = {
            id: `ec-${Date.now()}`,
            name: cName.trim(),
            relationship: cRel.trim() || 'Veli',
            phone: cPhone.trim(),
            isAuthorizedPickup: true,
        };
        setEmergencyContacts((prev) => [...prev, newContact]);
        setCName('');
        setCRel('');
        setCPhone('');
    }
    function removeContact(id) {
        setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
    }
    async function handleSave() {
        if (!student || saving)
            return;
        setSaving(true);
        try {
            const payload = {
                bloodType,
                allergies,
                dietaryRestrictions,
                chronicConditions,
                regularMedications,
                emergencyContacts,
                doctorName: doctorName.trim() || undefined,
                doctorPhone: doctorPhone.trim() || undefined,
                specialNotes: specialNotes.trim() || undefined,
            };
            const updated = await updateStudentPassport(student.id, payload);
            onSaved(updated);
            setIsEditing(false);
            Alert.alert('Başarılı', 'Öğrenci pasaportu güncellendi.');
        }
        catch (err) {
            Alert.alert('Hata', err instanceof ApiError ? `API ${err.status}` : 'Kaydedilemedi');
        }
        finally {
            setSaving(false);
        }
    }
    if (!student)
        return <></>;
    return (<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.flex1}>
              <Text style={styles.headerTitle}>📋 Öğrenci Pasaportu</Text>
              <Text style={styles.headerSub}>
                {student.firstName} {student.lastName} ({student.dateOfBirth})
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {loading ? (<View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary}/>
            </View>) : (<ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Mode switch */}
              <View style={styles.tabRow}>
                <Pressable style={[styles.tab, !isEditing && styles.tabActive]} onPress={() => setIsEditing(false)}>
                  <Text style={[styles.tabText, !isEditing && styles.tabTextActive]}>
                    Özet Görünüm
                  </Text>
                </Pressable>
                <Pressable style={[styles.tab, isEditing && styles.tabActive]} onPress={() => setIsEditing(true)}>
                  <Text style={[styles.tabText, isEditing && styles.tabTextActive]}>
                    ✏️ Düzenle
                  </Text>
                </Pressable>
              </View>

              {!isEditing ? (
            /* View Mode */
            <View style={styles.sectionContainer}>
                  {/* Blood & Doctor Card */}
                  <View style={styles.card}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Kan Grubu</Text>
                      <View style={styles.bloodBadge}>
                        <Text style={styles.bloodText}>🩸 {bloodType}</Text>
                      </View>
                    </View>
                    {doctorName ? (<View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Doktor</Text>
                        <Text style={styles.cardValue}>
                          {doctorName} ({doctorPhone || 'Tel yok'})
                        </Text>
                      </View>) : null}
                  </View>

                  {/* Allergies Card */}
                  <View style={[styles.card, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.cardTitle, { color: '#991B1B' }]}>
                      ⚠️ Alerjiler ({allergies.length})
                    </Text>
                    {allergies.length > 0 ? (<View style={styles.tagWrap}>
                        {allergies.map((a) => (<View key={a} style={styles.allergyTag}>
                            <Text style={styles.allergyTagText}>{a}</Text>
                          </View>))}
                      </View>) : (<Text style={styles.mutedText}>Kayıtlı alerji yok.</Text>)}
                  </View>

                  {/* Emergency Contacts Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>📞 Acil Durum & Teslim Alıcılar</Text>
                    {emergencyContacts.length > 0 ? (emergencyContacts.map((c) => (<View key={c.id} style={styles.contactItem}>
                          <View>
                            <Text style={styles.contactName}>
                              {c.name} ({c.relationship})
                            </Text>
                            <Text style={styles.contactPhone}>{c.phone}</Text>
                          </View>
                          {c.isAuthorizedPickup && (<View style={styles.pickupBadge}>
                              <Text style={styles.pickupText}>✓ Teslim Yetkili</Text>
                            </View>)}
                        </View>))) : (<Text style={styles.mutedText}>Acil durum kişisi eklenmedi.</Text>)}
                  </View>

                  {/* Special Notes Card */}
                  {specialNotes ? (<View style={styles.card}>
                      <Text style={styles.cardTitle}>📝 Öğretmen Notları</Text>
                      <Text style={styles.notesText}>{specialNotes}</Text>
                    </View>) : null}
                </View>) : (
            /* Edit Mode */
            <View style={styles.sectionContainer}>
                  {/* Blood Type Picker */}
                  <Text style={styles.fieldLabel}>Kan Grubu</Text>
                  <View style={styles.tagWrap}>
                    {BLOOD_TYPES.map((bt) => (<Pressable key={bt} style={[styles.choiceBtn, bloodType === bt && styles.choiceBtnActive]} onPress={() => setBloodType(bt)}>
                        <Text style={[
                        styles.choiceBtnText,
                        bloodType === bt && styles.choiceBtnTextActive,
                    ]}>
                          {bt}
                        </Text>
                      </Pressable>))}
                  </View>

                  {/* Allergies editor */}
                  <Text style={styles.fieldLabel}>Alerjiler</Text>
                  <View style={styles.tagWrap}>
                    {QUICK_ALLERGIES.map((qa) => {
                    const sel = allergies.includes(qa);
                    return (<Pressable key={qa} style={[styles.choiceBtn, sel && styles.allergyBtnActive]} onPress={() => toggleAllergy(qa)}>
                          <Text style={[styles.choiceBtnText, sel && styles.choiceBtnTextActive]}>
                            {sel ? `✓ ${qa}` : `+ ${qa}`}
                          </Text>
                        </Pressable>);
                })}
                  </View>
                  <View style={styles.rowInputWrap}>
                    <TextInput style={styles.flexInput} value={customAllergy} onChangeText={setCustomAllergy} placeholder="Başka alerji ekle..."/>
                    <Pressable style={styles.miniBtn} onPress={addCustomAllergy}>
                      <Text style={styles.miniBtnText}>Ekle</Text>
                    </Pressable>
                  </View>

                  {/* Doctor Fields */}
                  <Text style={styles.fieldLabel}>Doktor Adı</Text>
                  <TextInput style={styles.textInput} value={doctorName} onChangeText={setDoctorName} placeholder="Örn: Dr. Ayşe Kaya"/>
                  <Text style={styles.fieldLabel}>Doktor Telefonu</Text>
                  <TextInput style={styles.textInput} value={doctorPhone} onChangeText={setDoctorPhone} placeholder="+90 5XX XXX XX XX" keyboardType="phone-pad"/>

                  {/* Emergency Contacts Add */}
                  <Text style={styles.fieldLabel}>Acil Durum Kişisi Ekle</Text>
                  <View style={styles.contactAddBox}>
                    <TextInput style={styles.textInput} value={cName} onChangeText={setCName} placeholder="Ad Soyad"/>
                    <TextInput style={styles.textInput} value={cRel} onChangeText={setCRel} placeholder="Yakınlık (Anne, Baba vb.)"/>
                    <TextInput style={styles.textInput} value={cPhone} onChangeText={setCPhone} placeholder="Telefon Numarası" keyboardType="phone-pad"/>
                    <Pressable style={styles.addContactBtn} onPress={addContact}>
                      <Text style={styles.addContactBtnText}>+ Kişi Ekle</Text>
                    </Pressable>
                  </View>

                  {emergencyContacts.map((c) => (<View key={c.id} style={styles.contactItem}>
                      <Text style={styles.contactName}>
                        {c.name} ({c.relationship}) - {c.phone}
                      </Text>
                      <Pressable onPress={() => removeContact(c.id)}>
                        <Text style={styles.deleteText}>Sil</Text>
                      </Pressable>
                    </View>))}

                  {/* Special Notes */}
                  <Text style={styles.fieldLabel}>Öğretmene Özel Hatırlatma Notları</Text>
                  <TextInput style={[styles.textInput, styles.multiline]} value={specialNotes} onChangeText={setSpecialNotes} multiline numberOfLines={3} placeholder="Uyku, beslenme veya pedagojik özel notlar..."/>

                  {/* Save Button */}
                  <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={() => void handleSave()} disabled={saving}>
                    <Text style={styles.saveBtnText}>
                      {saving ? 'Kaydediliyor…' : 'Pasaportu Kaydet'}
                    </Text>
                  </Pressable>
                </View>)}
            </ScrollView>)}
        </View>
      </View>
    </Modal>);
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
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLabel: { fontSize: 13, color: colors.textSecondary },
    cardValue: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
    bloodBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bloodText: { color: '#991B1B', fontWeight: '700', fontSize: 13 },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    allergyTag: {
        backgroundColor: '#F87171',
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: 12,
    },
    allergyTagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    mutedText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    contactName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
    contactPhone: { fontSize: 12, color: colors.primary, marginTop: 1 },
    pickupBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    pickupText: { fontSize: 10, color: '#166534', fontWeight: '700' },
    notesText: { fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    choiceBtn: {
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    choiceBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    allergyBtnActive: { backgroundColor: colors.danger, borderColor: colors.danger },
    choiceBtnText: { fontSize: 12, color: colors.textPrimary },
    choiceBtnTextActive: { color: colors.surface, fontWeight: '700' },
    rowInputWrap: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
    flexInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        fontSize: 12,
        backgroundColor: colors.surface,
    },
    miniBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        borderRadius: 6,
    },
    miniBtnText: { color: colors.surface, fontSize: 12, fontWeight: '600' },
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
    contactAddBox: {
        backgroundColor: colors.bg,
        padding: spacing.sm,
        borderRadius: 6,
        marginBottom: spacing.xs,
    },
    addContactBtn: {
        backgroundColor: '#374151',
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 2,
    },
    addContactBtnText: { color: colors.surface, fontSize: 12, fontWeight: '600' },
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
