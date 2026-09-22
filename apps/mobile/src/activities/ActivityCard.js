import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageViewerModal } from './ImageViewerModal';
export function ActivityCard({ post, onDelete, canDelete }) {
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const formattedDate = new Date(post.activityDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        weekday: 'short',
    });
    function handleImagePress(index) {
        setSelectedImageIndex(index);
        setViewerVisible(true);
    }
    return (<View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.metaRow}>
            {post.classroom ? (<View style={styles.classroomBadge}>
                <Text style={styles.classroomText}>{post.classroom}</Text>
              </View>) : null}
            <Text style={styles.dateText}>📅 {formattedDate}</Text>
          </View>
        </View>

        {canDelete && onDelete ? (<TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(post.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>) : null}
      </View>

      {/* Description */}
      {post.description ? <Text style={styles.description}>{post.description}</Text> : null}

      {/* Media Grid / Preview */}
      {post.mediaUrls.length > 0 ? (<View style={styles.mediaContainer}>
          {post.mediaUrls.length === 1 ? (<TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(0)} style={styles.singleImageWrapper}>
              <Image source={{ uri: post.mediaUrls[0] }} style={styles.singleImage}/>
            </TouchableOpacity>) : (<View style={styles.multiGrid}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(0)} style={styles.gridLeft}>
                <Image source={{ uri: post.mediaUrls[0] }} style={styles.gridImageLarge}/>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(1)} style={styles.gridRight}>
                <Image source={{ uri: post.mediaUrls[1] }} style={styles.gridImageSmall}/>
                {post.mediaUrls.length > 2 ? (<View style={styles.moreOverlay}>
                    <Text style={styles.moreText}>+{post.mediaUrls.length - 2}</Text>
                  </View>) : null}
              </TouchableOpacity>
            </View>)}
        </View>) : null}

      {/* Tag Chips */}
      {post.tags.length > 0 ? (<View style={styles.tagsRow}>
          {post.tags.map((tag, idx) => (<View key={idx} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>))}
        </View>) : null}

      {/* Fullscreen Viewer */}
      <ImageViewerModal visible={viewerVisible} images={post.mediaUrls} initialIndex={selectedImageIndex} title={post.title} onClose={() => setViewerVisible(false)}/>
    </View>);
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flex: 1,
        paddingRight: 8,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    classroomBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    classroomText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4F46E5',
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    deleteBtn: {
        padding: 4,
    },
    deleteBtnText: {
        fontSize: 16,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: '#334155',
        marginBottom: 12,
    },
    mediaContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    singleImageWrapper: {
        width: '100%',
        height: 220,
        backgroundColor: '#F1F5F9',
    },
    singleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    multiGrid: {
        flexDirection: 'row',
        height: 200,
        gap: 4,
    },
    gridLeft: {
        flex: 2,
        height: '100%',
        backgroundColor: '#F1F5F9',
    },
    gridImageLarge: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridRight: {
        flex: 1,
        height: '100%',
        position: 'relative',
        backgroundColor: '#F1F5F9',
    },
    gridImageSmall: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    moreOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tagChip: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
});
