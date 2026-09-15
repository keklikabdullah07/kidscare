import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ActivityPost } from '@kidscare/shared-types';
import { deleteActivity, getActivities } from '../api/activities';
import { ActivityCard } from './ActivityCard';
import { CreateActivityModal } from './CreateActivityModal';

export interface ActivityGalleryModalProps {
  visible: boolean;
  onClose: () => void;
  userRole?: string | undefined;
  classroom?: string | undefined;
}

const TAG_FILTERS = ['Hepsi', 'Sanat', 'Oyun', 'Bahçe', 'Müzik', 'Resim'];

export function ActivityGalleryModal({
  visible,
  onClose,
  userRole,
  classroom,
}: ActivityGalleryModalProps): React.ReactElement {
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Hepsi');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const canPost = userRole === 'TEACHER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getActivities({
        classroom: classroom || undefined,
        tag: selectedTag === 'Hepsi' ? undefined : selectedTag,
      });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classroom, selectedTag]);

  useEffect(() => {
    if (visible) {
      void loadPosts();
    }
  }, [visible, loadPosts]);

  async function handleDelete(id: string) {
    try {
      await deleteActivity(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Kapat</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📸 Etkinlik & Fotoğraf Galerisi</Text>
          {canPost ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModalVisible(true)}>
              <Text style={styles.addBtnText}>+ Paylaş</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Filter Chips Bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {TAG_FILTERS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedTag(tag)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tag === 'Hepsi' ? '🌟 Hepsi' : `#${tag}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Posts Content */}
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Etkinlik fotoğrafları yükleniyor…</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void loadPosts();
                }}
              />
            }
          >
            {posts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📷</Text>
                <Text style={styles.emptyTitle}>Henüz fotoğraf paylaşılmadı</Text>
                <Text style={styles.emptyDesc}>
                  Öğretmenler sınıftan anları paylaştığında burada görünecektir.
                </Text>
              </View>
            ) : (
              posts.map((post) => (
                <ActivityCard
                  key={post.id}
                  post={post}
                  canDelete={canPost}
                  onDelete={(id) => {
                    void handleDelete(id);
                  }}
                />
              ))
            )}
          </ScrollView>
        )}

        {/* Create Activity Modal */}
        <CreateActivityModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          defaultClassroom={classroom}
          onCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
