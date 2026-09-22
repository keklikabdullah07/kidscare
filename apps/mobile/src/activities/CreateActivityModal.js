import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { createActivity } from '../api/activities';
const PRESET_PHOTOS = [
    {
        name: '🎨 Sanat',
        url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop',
    },
    {
        name: '🌳 Bahçe',
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop',
    },
    {
        name: '🎵 Müzik',
        url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop',
    },
    {
        name: '🧩 Oyun',
        url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',
    },
    {
        name: '📚 Masal',
        url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop',
    },
];
const AVAILABLE_TAGS = ['Oyun', 'Sanat', 'Resim', 'Müzik', 'Bahçe', 'Gelişim', 'Etkinlik'];
export function CreateActivityModal({ visible, onClose, onCreated, defaultClassroom = 'Papatyalar Sınıfı', }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [classroom, setClassroom] = useState(defaultClassroom || 'Papatyalar Sınıfı');
    const [selectedUrls, setSelectedUrls] = useState(PRESET_PHOTOS[0]?.url ? [PRESET_PHOTOS[0].url] : []);
    const [customUrl, setCustomUrl] = useState('');
    const [selectedTags, setSelectedTags] = useState(['Sanat', 'Etkinlik']);
    const [submitting, setSubmitting] = useState(false);
    function togglePreset(url) {
        if (selectedUrls.includes(url)) {
            if (selectedUrls.length > 1) {
                setSelectedUrls(selectedUrls.filter((u) => u !== url));
            }
            else {
                Alert.alert('Uyarı', 'En az 1 fotoğraf seçmelisiniz.');
            }
        }
        else {
            setSelectedUrls([...selectedUrls, url]);
        }
    }
    function addCustomUrl() {
        if (!customUrl.trim())
            return;
        if (!selectedUrls.includes(customUrl.trim())) {
            setSelectedUrls([...selectedUrls, customUrl.trim()]);
            setCustomUrl('');
        }
    }
    function toggleTag(tag) {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        }
        else {
            setSelectedTags([...selectedTags, tag]);
        }
    }
    async function handleSave() {
        if (!title.trim()) {
            Alert.alert('Hata', 'Lütfen etkinlik için bir başlık girin.');
            return;
        }
        if (selectedUrls.length === 0) {
            Alert.alert('Hata', 'Lütfen en az bir fotoğraf ekleyin.');
            return;
        }
        try {
            setSubmitting(true);
            const post = await createActivity({
                title: title.trim(),
                description: description.trim() || undefined,
                classroom: classroom.trim() || undefined,
                mediaUrls: selectedUrls,
                tags: selectedTags,
            });
            onCreated(post);
            onClose();
        }
        catch (err) {
            Alert.alert('Hata', err instanceof Error ? err.message : 'Etkinlik paylaşılamadı');
        }
        finally {
            setSubmitting(false);
        }
    }
    return (<Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={submitting}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            void handleSave();
        }} disabled={submitting} style={styles.saveBtn}>
            {submitting ? (<ActivityIndicator size="small" color="#FFFFFF"/>) : (<Text style={styles.saveBtnText}>Paylaş</Text>)}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={styles.label}>Etkinlik Başlığı *</Text>
          <TextInput style={styles.input} placeholder="Örn: 🎨 Suluboya ve Renkli Yapraklar" value={title} onChangeText={setTitle} editable={!submitting}/>

          {/* Classroom */}
          <Text style={styles.label}>Sınıf</Text>
          <TextInput style={styles.input} placeholder="Örn: Papatyalar Sınıfı" value={classroom} onChangeText={setClassroom} editable={!submitting}/>

          {/* Description */}
          <Text style={styles.label}>Açıklama / Günün Notu</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Çocuklar bugün neler yaptı, neler öğrendi?" value={description} onChangeText={setDescription} multiline numberOfLines={4} editable={!submitting}/>

          {/* Preset Photos Selection */}
          <Text style={styles.label}>Fotoğraflar Seçin ({selectedUrls.length} seçildi)</Text>
          <Text style={styles.hint}>
            Galeriden hızlı fotoğraf seçin veya alt kısımdan URL ekleyin:
          </Text>
          <View style={styles.presetsGrid}>
            {PRESET_PHOTOS.map((preset, idx) => {
            const selected = selectedUrls.includes(preset.url);
            return (<TouchableOpacity key={idx} activeOpacity={0.8} style={[styles.presetCard, selected && styles.presetCardSelected]} onPress={() => togglePreset(preset.url)}>
                  <Image source={{ uri: preset.url }} style={styles.presetImage}/>
                  <View style={styles.presetLabel}>
                    <Text style={styles.presetText}>{preset.name}</Text>
                    {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                </TouchableOpacity>);
        })}
          </View>

          {/* Custom URL Input */}
          <View style={styles.customUrlRow}>
            <TextInput style={[styles.input, styles.urlInput]} placeholder="Özel Fotoğraf URL'si ekle..." value={customUrl} onChangeText={setCustomUrl} autoCapitalize="none" editable={!submitting}/>
            <TouchableOpacity style={styles.addUrlBtn} onPress={addCustomUrl}>
              <Text style={styles.addUrlBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <Text style={styles.label}>Etiketler</Text>
          <View style={styles.tagsContainer}>
            {AVAILABLE_TAGS.map((tag, idx) => {
            const isSelected = selectedTags.includes(tag);
            return (<TouchableOpacity key={idx} style={[styles.tagChip, isSelected && styles.tagChipActive]} onPress={() => toggleTag(tag)}>
                  <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>#{tag}</Text>
                </TouchableOpacity>);
        })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>);
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cancelText: {
        fontSize: 16,
        color: '#64748B',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    saveBtn: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 6,
        marginTop: 14,
    },
    hint: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: '#0F172A',
    },
    textArea: {
        height: 90,
        textAlignVertical: 'top',
    },
    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    presetCard: {
        width: '31%',
        height: 95,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    presetCardSelected: {
        borderColor: '#4F46E5',
    },
    presetImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    presetLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    presetText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    checkMark: {
        color: '#22C55E',
        fontWeight: '900',
        fontSize: 12,
    },
    customUrlRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    urlInput: {
        flex: 1,
    },
    addUrlBtn: {
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    addUrlBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6,
    },
    tagChip: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagChipActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    tagText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    tagTextActive: {
        color: '#FFFFFF',
    },
});
