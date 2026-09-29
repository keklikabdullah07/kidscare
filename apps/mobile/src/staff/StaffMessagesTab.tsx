import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  ParentRequest,
  Student,
} from '@kidscare/shared-types';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { useAuth } from '../auth/AuthContext';
import { listStudents } from '../api/students';
import {
  createConversation,
  listConversations,
  listMessages,
  listParentRequests,
  resolveParentRequest,
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

export function StaffMessagesTab(): React.ReactElement {
  const { state: authState } = useAuth();
  const myUserId = authState.status === 'authenticated' ? authState.user.id : '';

  const [activeSegment, setActiveSegment] = useState<'chats' | 'requests'>('chats');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Active Chat State
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgDraft, setMsgDraft] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Announcement modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annSubject, setAnnSubject] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [savingAnn, setSavingAnn] = useState(false);

  async function loadData(): Promise<void> {
    try {
      const [convs, reqs, studs] = await Promise.all([
        listConversations().catch(() => []),
        listParentRequests().catch(() => []),
        listStudents().catch(() => []),
      ]);
      setConversations(convs);
      setRequests(reqs);
      setStudents(studs);
    } catch (err) {
      console.error('Error loading staff messages data:', err);
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

  async function handleResolveRequest(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    setBusyId(id);
    try {
      await resolveParentRequest(id, { status });
      Alert.alert('Tamamlandı', `Talep ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`);
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function handleBroadcastAnnouncement(): Promise<void> {
    if (!annSubject.trim() || !annBody.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen duyuru başlığını ve metnini yazın.');
      return;
    }
    const targetStudentId = students[0]?.id;
    if (!targetStudentId) {
      Alert.alert('Hata', 'Öğrenci bulunamadı.');
      return;
    }
    setSavingAnn(true);
    try {
      await createConversation({
        subject: `📢 ${annSubject.trim()}`,
        category: 'DUYURU',
        participantIds: [],
        studentId: targetStudentId,
        initialMessage: annBody.trim(),
      });
      setAnnouncementModalOpen(false);
      setAnnSubject('');
      setAnnBody('');
      Alert.alert('Başarılı', 'Duyuru yayınlandı.');
      void loadData();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Duyuru gönderilemedi');
    } finally {
      setSavingAnn(false);
    }
  }

  return (
    <ScreenContainer
      icon="chatbubbles"
      title="İletişim & Talepler"
      subtitle="Veli mesajları, izin talepleri ve okul duyuruları"
    >
      {/* Segment Switcher */}
      <View style={styles.segmentContainer}>
        <Pressable
          style={[styles.segmentBtn, activeSegment === 'chats' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('chats')}
        >
          <Text
            style={[styles.segmentBtnText, activeSegment === 'chats' && styles.segmentBtnTextActive]}
          >
            💬 Veli Sohbetleri ({conversations.length})
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
            📑 Gelen Talepler ({requests.filter((r) => r.status === 'PENDING').length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : activeSegment === 'chats' ? (
        /* SOHBETLER */
        <>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>Aktif Konuşmalar</Text>
            <Pressable
              style={({ pressed }) => [styles.actionPillBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setAnnouncementModalOpen(true)}
            >
              <Ionicons name="megaphone-outline" size={16} color={colors.textInverse} />
              <Text style={styles.actionPillText}>Duyuru Yayınla</Text>
            </Pressable>
          </View>

          {conversations.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyBox}>
                <Ionicons name="chatbubbles-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Gelen Mesaj Yok</Text>
                <Text style={styles.emptyDesc}>Velilerden gelen aktif bir mesaj bulunmuyor.</Text>
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
        /* GELEN TALEPLER */
        <>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>Gelen Veli İzin & Talepleri</Text>
          </View>

          {requests.length === 0 ? (
            <Card variant="muted">
              <View style={styles.emptyBox}>
                <Ionicons name="clipboard-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Bekleyen Talep Yok</Text>
                <Text style={styles.emptyDesc}>Velilerden gelen bekleyen bir talep bulunmuyor.</Text>
              </View>
            </Card>
          ) : (
            requests.map((req) => {
              const isPending = req.status === 'PENDING';
              const isBusy = busyId === req.id;
              const studentName = students.find((s) => s.id === req.studentId)
                ? `${students.find((s) => s.id === req.studentId)!.firstName} ${students.find((s) => s.id === req.studentId)!.lastName}`
                : undefined;

              return (
                <Card key={req.id} variant={isPending ? 'accent' : 'default'}>
                  <View style={styles.reqHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reqSubject}>{req.subject}</Text>
                      {studentName && <Text style={styles.studentSub}>Öğrenci: {studentName}</Text>}
                    </View>
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
                          : 'Onay Bekliyor'}
                      </Text>
                    </View>
                  </View>
                  {req.description && <Text style={styles.reqDesc}>{req.description}</Text>}
                  <Text style={styles.reqDate}>
                    Tarih: {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                  </Text>

                  {isPending && (
                    <View style={styles.reqActionButtons}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.approveBtn,
                          isBusy && { opacity: 0.6 },
                          pressed && { opacity: 0.88 },
                        ]}
                        onPress={() => void handleResolveRequest(req.id, 'APPROVED')}
                        disabled={isBusy}
                      >
                        <Text style={styles.approveBtnText}>✓ Talebi Onayla</Text>
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          styles.rejectBtn,
                          isBusy && { opacity: 0.6 },
                          pressed && { opacity: 0.88 },
                        ]}
                        onPress={() => void handleResolveRequest(req.id, 'REJECTED')}
                        disabled={isBusy}
                      >
                        <Text style={styles.rejectBtnText}>Reddet</Text>
                      </Pressable>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </>
      )}

      {/* FULL CHAT MODAL */}
      <Modal visible={activeChat !== null} animationType="slide">
        <View style={styles.chatModalContainer}>
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

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatTextInput}
                value={msgDraft}
                onChangeText={setMsgDraft}
                placeholder="Velimize cevap yazın..."
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

      {/* MODAL: DUYURU YAYINLA */}
      <Modal visible={announcementModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📢 Genel Okul / Sınıf Duyurusu</Text>
              <Pressable onPress={() => setAnnouncementModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Duyuru Başlığı *</Text>
            <TextInput
              style={styles.modalInput}
              value={annSubject}
              onChangeText={setAnnSubject}
              placeholder="Örn: 23 Nisan Bayram Kutlama Programı"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Duyuru İçeriği *</Text>
            <TextInput
              style={[styles.modalInput, { height: 90 }]}
              value={annBody}
              onChangeText={setAnnBody}
              multiline
              placeholder="Tüm velilerin göreceği duyuru detaylarını buraya yazın..."
              placeholderTextColor={colors.textMuted}
            />

            <Pressable
              style={({ pressed }) => [
                styles.modalSubmitBtn,
                savingAnn && { opacity: 0.6 },
                pressed && { opacity: 0.88 },
              ]}
              onPress={() => void handleBroadcastAnnouncement()}
              disabled={savingAnn}
            >
              {savingAnn ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.modalSubmitText}>Duyuruyu Yayınla</Text>
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reqSubject: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  studentSub: {
    ...typography.tiny,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
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
  reqActionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  approveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  approveBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textInverse,
  },
  rejectBtn: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.danger,
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
