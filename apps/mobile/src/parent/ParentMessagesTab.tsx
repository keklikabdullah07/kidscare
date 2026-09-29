import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  Conversation,
  ConversationCategory,
  Message,
  ParentChildOverview,
  ParentRequest,
  ParentRequestType,
} from '@kidscare/shared-types';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { fetchParentChildrenOverview } from '../api/parent';
import {
  createConversation,
  createParentRequest,
  listConversations,
  listMessages,
  listParentRequests,
  sendMessage,
} from '../api/messaging';

const CATEGORY_ICONS: Record<ConversationCategory, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  ACIL: { icon: 'alert-circle', color: colors.danger },
  SAGLIK: { icon: 'medkit', color: colors.danger },
  IZIN: { icon: 'calendar', color: colors.amber },
  TESLIM: { icon: 'car', color: colors.primary },
  GUNLUK_BILGI: { icon: 'chatbubble-ellipses', color: colors.primary },
  DUYURU: { icon: 'megaphone', color: colors.amberDark },
  ODEME: { icon: 'card', color: colors.success },
  RANDEVU: { icon: 'time', color: colors.primaryDark },
};

export function ParentMessagesTab(): React.ReactElement {
  const { state: authState } = useAuth();
  const myUserId = authState.status === 'authenticated' ? authState.user.id : '';

  const [activeSegment, setActiveSegment] = useState<'chats' | 'requests'>('chats');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [children, setChildren] = useState<ParentChildOverview[]>([]);

  // Active Chat State
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgDraft, setMsgDraft] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // New Chat Modal
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<ConversationCategory>('GUNLUK_BILGI');
  const [newBody, setNewBody] = useState('');
  const [savingChat, setSavingChat] = useState(false);

  // New Request Modal
  const [newReqModalOpen, setNewReqModalOpen] = useState(false);
  const [reqType, setReqType] = useState<ParentRequestType>('IZIN');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [savingReq, setSavingReq] = useState(false);

  async function loadData(): Promise<void> {
    try {
      const [convs, reqs, kids] = await Promise.all([
        listConversations().catch(() => []),
        listParentRequests().catch(() => []),
        fetchParentChildrenOverview().catch(() => []),
      ]);
      setConversations(convs);
      setRequests(reqs);
      setChildren(kids);
    } catch (err) {
      console.error('Error loading messaging data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    void loadData();
  };

  async function openConversation(conv: Conversation): Promise<void> {
    setActiveChat(conv);
    setLoadingMessages(true);
    try {
      const msgs = await listMessages(conv.id);
      setChatMessages(msgs);
    } catch (err) {
      Alert.alert('Hata', 'Mesajlar yüklenemedi.');
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSendMessage(): Promise<void> {
    if (!activeChat || !msgDraft.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      const sent = await sendMessage(activeChat.id, { content: msgDraft.trim() });
      setChatMessages((prev) => [...prev, sent]);
      setMsgDraft('');
    } catch (err) {
      Alert.alert('Hata', 'Mesaj iletilemedi.');
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleCreateConversation(): Promise<void> {
    if (!newSubject.trim() || !newBody.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen konu başlığı ve mesajınızı yazın.');
      return;
    }
    const studentId = children[0]?.student?.id;
    if (!studentId) {
      Alert.alert('Hata', 'Kayıtlı öğrenci bulunamadı.');
      return;
    }
    setSavingChat(true);
    try {
      const created = await createConversation({
        subject: newSubject.trim(),
        category: newCategory,
        participantIds: [],
        studentId,
        initialMessage: newBody.trim(),
      });
      setNewChatModalOpen(false);
      setNewSubject('');
      setNewBody('');
      Alert.alert('Başarılı', 'Sohbet konusu öğretmene iletildi.');
      void loadData();
      void openConversation(created);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Mesaj başlatılamadı');
    } finally {
      setSavingChat(false);
    }
  }

  async function handleCreateRequest(): Promise<void> {
    if (!reqSubject.trim() || !reqDesc.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen talep konusu ve açıklamasını giriniz.');
      return;
    }
    const studentId = children[0]?.student?.id;
    if (!studentId) {
      Alert.alert('Hata', 'Kayıtlı öğrenci bulunamadı.');
      return;
    }
    setSavingReq(true);
    try {
      await createParentRequest({
        studentId,
        type: reqType,
        subject: reqSubject.trim(),
        description: reqDesc.trim(),
      });
      setNewReqModalOpen(false);
      setReqSubject('');
      setReqDesc('');
      Alert.alert('Başarılı', 'Talebiniz kreş idaresine iletildi.');
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Talep iletilemedi');
    } finally {
      setSavingReq(false);
    }
  }

  return (
    <ScreenContainer
      icon="chatbubbles"
      title="İletişim & Mesajlar"
      subtitle="Öğretmeninizle anlık mesajlaşın ve taleplerinizi iletin"
    >
      {/* Segment Switcher: Sohbetler vs İzin/Talepler */}
      <View style={styles.segmentContainer}>
        <Pressable
          style={[styles.segmentBtn, activeSegment === 'chats' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('chats')}
        >
          <Text
            style={[styles.segmentBtnText, activeSegment === 'chats' && styles.segmentBtnTextActive]}
          >
            💬 Sohbetler ({conversations.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, activeSegment === 'requests' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('requests')}
        >
          <Text
            style={[
              styles.segmentBtnText,
              activeSegment === 'requests' && styles.segmentBtnTextActive,
            ]}
          >
            📑 İzin & Talepler ({requests.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : activeSegment === 'chats' ? (
        /* SOHBETLER LİSTESİ */
        <>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>Mesaj Konuları</Text>
            <Pressable
              style={({ pressed }) => [styles.actionPillBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setNewChatModalOpen(true)}
            >
              <Ionicons name="create-outline" size={16} color={colors.textInverse} />
              <Text style={styles.actionPillText}>Yeni Mesaj</Text>
            </Pressable>
          </View>

          {conversations.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubbles-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Henüz Mesajınız Yok</Text>
                <Text style={styles.emptyDesc}>
                  Öğretmeninize günlük bilgi sormak veya mesaj göndermek için 'Yeni Mesaj' butonunu
                  kullanabilirsiniz.
                </Text>
              </View>
            </Card>
          ) : (
            conversations.map((conv) => {
              const meta = CATEGORY_ICONS[conv.category] || CATEGORY_ICONS.GUNLUK_BILGI;
              return (
                <Card key={conv.id} onPress={() => void openConversation(conv)}>
                  <View style={styles.convRow}>
                    <View style={[styles.convIconBox, { backgroundColor: colors.surfaceMuted }]}>
                      <Ionicons name={meta.icon} size={22} color={meta.color} />
                    </View>
                    <View style={styles.convInfo}>
                      <View style={styles.convHeader}>
                        <Text style={styles.convSubject} numberOfLines={1}>
                          {conv.subject}
                        </Text>
                        <Text style={styles.convTime}>
                          {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                      <Text style={styles.convCategoryBadge}>
                        {conv.category.replace('_', ' ')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </Card>
              );
            })
          )}
        </>
      ) : (
        /* VELİ TALEPLERİ LİSTESİ */
        <>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>İzin ve Özel Taleplerim</Text>
            <Pressable
              style={({ pressed }) => [
                styles.actionPillBtn,
                { backgroundColor: colors.amberDark },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setNewReqModalOpen(true)}
            >
              <Ionicons name="add" size={16} color={colors.textInverse} />
              <Text style={styles.actionPillText}>Talep Oluştur</Text>
            </Pressable>
          </View>

          {requests.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyBox}>
                <Ionicons name="clipboard-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Kayıtlı Talep Yok</Text>
                <Text style={styles.emptyDesc}>
                  Erken alma, devamsızlık izni veya özel isteklerinizi buradan idareye bildirebilirsiniz.
                </Text>
              </View>
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id}>
                <View style={styles.reqHeader}>
                  <Text style={styles.reqSubject}>{req.subject}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          req.status === 'APPROVED'
                            ? colors.successBg
                            : req.status === 'REJECTED'
                            ? colors.dangerBg
                            : colors.amberLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            req.status === 'APPROVED'
                              ? colors.successText
                              : req.status === 'REJECTED'
                              ? colors.dangerText
                              : colors.amberText,
                        },
                      ]}
                    >
                      {req.status === 'APPROVED'
                        ? 'Onaylandı'
                        : req.status === 'REJECTED'
                        ? 'Reddedildi'
                        : 'Bekliyor'}
                    </Text>
                  </View>
                </View>
                {req.description && <Text style={styles.reqDesc}>{req.description}</Text>}
                <Text style={styles.reqDate}>
                  Tarih: {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </Card>
            ))
          )}
        </>
      )}

      {/* FULL CHAT MODAL */}
      <Modal visible={activeChat !== null} animationType="slide">
        <View style={styles.chatModalContainer}>
          {/* Chat Header */}
          <View style={styles.chatHeaderBar}>
            <Pressable onPress={() => setActiveChat(null)} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
            </Pressable>
            <View style={styles.chatHeaderTitles}>
              <Text style={styles.chatHeaderSubject} numberOfLines={1}>
                {activeChat?.subject}
              </Text>
              <Text style={styles.chatHeaderCategory}>{activeChat?.category}</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Messages List */}
          {loadingMessages ? (
            <View style={styles.chatLoadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={chatMessages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatMessagesContent}
              renderItem={({ item }) => {
                const isMe = item.senderId === myUserId;
                return (
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.myMessageBubble : styles.otherMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.myMessageText : styles.otherMessageText,
                      ]}
                    >
                      {item.content}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isMe ? styles.myMessageTime : styles.otherMessageTime,
                      ]}
                    >
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                );
              }}
            />
          )}

          {/* Bottom Send Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatTextInput}
                value={msgDraft}
                onChangeText={setMsgDraft}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <Pressable
                style={[
                  styles.chatSendBtn,
                  (!msgDraft.trim() || sendingMsg) && { opacity: 0.5 },
                ]}
                onPress={() => void handleSendMessage()}
                disabled={!msgDraft.trim() || sendingMsg}
              >
                {sendingMsg ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Ionicons name="send" size={18} color={colors.textInverse} />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL: YENİ MESAJ BAŞLAT */}
      <Modal visible={newChatModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✉️ Yeni Mesaj Konusu</Text>
              <Pressable onPress={() => setNewChatModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Konu Başlığı *</Text>
            <TextInput
              style={styles.modalInput}
              value={newSubject}
              onChangeText={setNewSubject}
              placeholder="Örn: Beslenme hakkında bilgi"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
              {(['GUNLUK_BILGI', 'SAGLIK', 'IZIN', 'TESLIM', 'ACIL'] as ConversationCategory[]).map(
                (cat) => {
                  const isSel = newCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={[styles.categoryChip, isSel && styles.categoryChipActive]}
                    >
                      <Text style={[styles.categoryChipText, isSel && styles.categoryChipTextActive]}>
                        {cat.replace('_', ' ')}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </ScrollView>

            <Text style={styles.inputLabel}>İlk Mesajınız *</Text>
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              value={newBody}
              onChangeText={setNewBody}
              multiline
              placeholder="Öğretmene iletmek istediğiniz detaylı mesajınızı yazın..."
              placeholderTextColor={colors.textMuted}
            />

            <Pressable
              style={({ pressed }) => [
                styles.modalSubmitBtn,
                savingChat && { opacity: 0.6 },
                pressed && { opacity: 0.88 },
              ]}
              onPress={() => void handleCreateConversation()}
              disabled={savingChat}
            >
              {savingChat ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.modalSubmitText}>Mesajı Gönder</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL: YENİ İZİN / TALEP */}
      <Modal visible={newReqModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📑 Yeni İzin / Özel Talep</Text>
              <Pressable onPress={() => setNewReqModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Talep Türü</Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginVertical: 4 }}>
              {(['IZIN', 'BILGI_TALEP', 'DEGISIKLIK'] as ParentRequestType[]).map((t) => {
                const isSel = reqType === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setReqType(t)}
                    style={[styles.categoryChip, isSel && styles.categoryChipActive]}
                  >
                    <Text style={[styles.categoryChipText, isSel && styles.categoryChipTextActive]}>
                      {t === 'IZIN' ? 'İzin Talebi' : t === 'BILGI_TALEP' ? 'Bilgi' : 'Değişiklik'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Konu *</Text>
            <TextInput
              style={styles.modalInput}
              value={reqSubject}
              onChangeText={setReqSubject}
              placeholder="Örn: 2 Günlük İzin Bildirimi"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Açıklama / Detay</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              value={reqDesc}
              onChangeText={setReqDesc}
              multiline
              placeholder="Gerekçe ve tarihleri buraya yazabilirsiniz..."
              placeholderTextColor={colors.textMuted}
            />

            <Pressable
              style={({ pressed }) => [
                styles.modalSubmitBtn,
                { backgroundColor: colors.amberDark },
                savingReq && { opacity: 0.6 },
                pressed && { opacity: 0.88 },
              ]}
              onPress={() => void handleCreateRequest()}
              disabled={savingReq}
            >
              {savingReq ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.modalSubmitText}>Talebi İlet</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  segmentBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listHeaderTitle: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    gap: 4,
  },
  actionPillText: {
    ...typography.tiny,
    fontWeight: '700',
    color: colors.textInverse,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 18,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  convIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  convInfo: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convSubject: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  convTime: {
    ...typography.tiny,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  convCategoryBadge: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reqSubject: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusBadgeText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  reqDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reqDate: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  // Chat Modal Styles
  chatModalContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatHeaderTitles: {
    flex: 1,
    alignItems: 'center',
  },
  chatHeaderSubject: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  chatHeaderCategory: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  chatLoadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMessagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  messageBubble: {
    maxWidth: '78%',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.textInverse,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    ...typography.tiny,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: colors.textMuted,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  chatTextInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.tiny,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.textInverse,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  modalSubmitText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
});
