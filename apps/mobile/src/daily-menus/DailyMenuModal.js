import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { getDailyMenu } from '../api/daily-menus';
import { colors, spacing } from '../theme';
export function DailyMenuModal({ date, visible, onClose }) {
    const [loading, setLoading] = useState(false);
    const [menu, setMenu] = useState(null);
    const [warnings, setWarnings] = useState([]);
    useEffect(() => {
        if (visible) {
            setLoading(true);
            getDailyMenu(date)
                .then((res) => {
                setMenu(res.menu);
                setWarnings(res.allergenWarnings);
                setLoading(false);
            })
                .catch(() => {
                setMenu(null);
                setWarnings([]);
                setLoading(false);
            });
        }
    }, [visible, date]);
    return (<Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.flex1}>
                <View style={styles.titleRow}>
                  <Text style={styles.emoji}>🍲</Text>
                  <Text style={styles.modalTitle}>Günün Yemek Menüsü</Text>
                </View>
                <Text style={styles.subtitle}>{date} Beslenme Programı</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {loading ? (<ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }}/>) : !menu ||
            (menu.breakfast.length === 0 &&
                menu.lunch.length === 0 &&
                menu.snack.length === 0) ? (<View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>Menü Henüz Girilmedi</Text>
                <Text style={styles.emptySubtitle}>
                  Bu gün için kayıtlı yemek listesi bulunmamaktadır.
                </Text>
              </View>) : (<View style={styles.content}>
                {/* Allergen Warning Banner */}
                {warnings.length > 0 && (<View style={styles.warningBox}>
                    <Text style={styles.warningTitle}>
                      ⚠️ Alerjen Uyarısı ({warnings.length} Öğrenci)
                    </Text>
                    {warnings.map((w) => (<Text key={w.studentId} style={styles.warningItem}>
                        • <Text style={styles.bold}>{w.studentName}:</Text>{' '}
                        {w.matchedAllergens.join(', ')}
                      </Text>))}
                  </View>)}

                {/* Breakfast Section */}
                {menu.breakfast.length > 0 && (<View style={[styles.mealCard, styles.breakfastCard]}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealEmoji}>🌅</Text>
                      <Text style={styles.mealTitle}>Sabah Kahvaltısı</Text>
                    </View>
                    <View style={styles.itemsList}>
                      {menu.breakfast.map((item, idx) => (<View key={idx} style={styles.itemRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.itemText}>{item}</Text>
                        </View>))}
                    </View>
                  </View>)}

                {/* Lunch Section */}
                {menu.lunch.length > 0 && (<View style={[styles.mealCard, styles.lunchCard]}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealEmoji}>🍲</Text>
                      <Text style={styles.mealTitle}>Öğle Yemeği</Text>
                    </View>
                    <View style={styles.itemsList}>
                      {menu.lunch.map((item, idx) => (<View key={idx} style={styles.itemRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.itemText}>{item}</Text>
                        </View>))}
                    </View>
                  </View>)}

                {/* Snack Section */}
                {menu.snack.length > 0 && (<View style={[styles.mealCard, styles.snackCard]}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealEmoji}>🥪</Text>
                      <Text style={styles.mealTitle}>İkindi Ara Öğünü</Text>
                    </View>
                    <View style={styles.itemsList}>
                      {menu.snack.map((item, idx) => (<View key={idx} style={styles.itemRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.itemText}>{item}</Text>
                        </View>))}
                    </View>
                  </View>)}

                {/* Allergens & Calories info */}
                {(menu.allergens.length > 0 || menu.calories || menu.notes) && (<View style={styles.nutritionBox}>
                    {menu.allergens.length > 0 && (<View style={styles.allergenTagsRow}>
                        <Text style={styles.nutritionLabel}>İçerdiği Alerjenler:</Text>
                        <View style={styles.chipsContainer}>
                          {menu.allergens.map((alg, idx) => (<View key={idx} style={styles.allergenChip}>
                              <Text style={styles.allergenChipText}>{alg}</Text>
                            </View>))}
                        </View>
                      </View>)}

                    {menu.calories && (<Text style={styles.calorieText}>
                        🔥 Toplam Kalori: <Text style={styles.bold}>{menu.calories} kcal</Text>
                      </Text>)}

                    {menu.notes && (<Text style={styles.notesText}>
                        📝 Not: <Text style={{ fontStyle: 'italic' }}>{menu.notes}</Text>
                      </Text>)}
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
        maxHeight: '85%',
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
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.xs,
    },
    emptyEmoji: { fontSize: 36, marginBottom: spacing.xs },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    emptySubtitle: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
    content: { gap: spacing.md },
    warningBox: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FCD34D',
        borderWidth: 1,
        borderRadius: 8,
        padding: spacing.sm + 2,
        gap: 4,
    },
    warningTitle: { fontSize: 12, fontWeight: '700', color: '#92400E' },
    warningItem: { fontSize: 11, color: '#78350F' },
    bold: { fontWeight: '700' },
    mealCard: {
        borderRadius: 10,
        borderWidth: 1,
        padding: spacing.md,
        gap: spacing.xs,
    },
    breakfastCard: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
    lunchCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
    snackCard: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' },
    mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    mealEmoji: { fontSize: 16 },
    mealTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    itemsList: { gap: 3 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    bullet: { fontSize: 14, color: colors.textSecondary },
    itemText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
    nutritionBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: spacing.md,
        gap: 6,
    },
    allergenTagsRow: { gap: 4 },
    nutritionLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    allergenChip: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FECACA',
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    allergenChipText: { fontSize: 10, fontWeight: '700', color: '#991B1B' },
    calorieText: { fontSize: 12, color: colors.textPrimary },
    notesText: { fontSize: 12, color: colors.textSecondary },
});
