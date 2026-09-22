import { useState } from 'react';
import { Dimensions, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export function ImageViewerModal({ visible, images, initialIndex = 0, title, onClose, }) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    return (<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕ Kapat</Text>
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {images.length > 0 ? `${activeIndex + 1} / ${images.length}` : ''}
          </Text>
        </View>

        {title ? (<View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
          </View>) : null}

        {/* Horizontal Swiper */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(index);
        }} contentOffset={{ x: initialIndex * SCREEN_WIDTH, y: 0 }} style={styles.scroll}>
          {images.map((url, idx) => (<View key={`${url}-${idx}`} style={styles.imageContainer}>
              <Image source={{ uri: url }} style={styles.image} resizeMode="contain"/>
            </View>))}
        </ScrollView>

        {/* Thumbnail Indicator Dots */}
        {images.length > 1 && (<View style={styles.pagination}>
            {images.map((_, idx) => (<View key={idx} style={[styles.dot, idx === activeIndex ? styles.dotActive : styles.dotInactive]}/>))}
          </View>)}
      </SafeAreaView>
    </Modal>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        zIndex: 10,
    },
    closeBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    closeBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    counterText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    titleText: {
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    scroll: {
        flex: 1,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.72,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 24,
        backgroundColor: '#38BDF8',
    },
    dotInactive: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
});
