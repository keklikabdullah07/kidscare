import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  ActivityPost,
  DailyMenu,
  DevelopmentObservationDto,
  HomeActivitySuggestionDto,
  ParentChildOverview,
} from '@kidscare/shared-types';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { getDailyMenu } from '../api/daily-menus';
import { getActivities } from '../api/activities';
import { listHomeActivities, listObservations } from '../api/development';
import { fetchParentChildrenOverview } from '../api/parent';
import { DailyMenuModal } from '../daily-menus/DailyMenuModal';
import { ActivityGalleryModal } from '../activities/ActivityGalleryModal';
import { colors, radii, shadows, spacing, typography } from '../theme';

export function ParentExploreTab(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [childrenData, setChildrenData] = useState<ParentChildOverview[]>([]);
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [activities, setActivities] = useState<ActivityPost[]>([]);
  const [observations, setObservations] = useState<DevelopmentObservationDto[]>([]);
  const [homeSuggestions, setHomeSuggestions] = useState<HomeActivitySuggestionDto[]>([]);

  // Modals
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  const loadData = async () => {
    try {
      const [childRes, menuRes, actRes, sugRes] = await Promise.all([
        fetchParentChildrenOverview(todayStr).catch(() => []),
        getDailyMenu(todayStr).catch(() => ({ menu: null, allergenWarnings: [] })),
        getActivities({ limit: 4 }).catch(() => []),
        listHomeActivities().catch(() => []),
      ]);

      setChildrenData(childRes);
      setDailyMenu(menuRes.menu);
      setActivities(actRes);
      setHomeSuggestions(sugRes);

      const stuId = childRes[0]?.student?.id;
      if (stuId) {
        const obsRes = await listObservations({ studentId: stuId }).catch(() => []);
        setObservations(obsRes);
      }
    } catch {
      // quiet handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const activeChild = childrenData[0]?.student;

  return (
    <ScreenContainer
      icon="sparkles"
      title="Keşfet & Gelişim"
      subtitle="Yemek listesi, sınıf albümü ve gelişim gözlemleri"
      scrollable={false}
    >
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Bülten yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        >
          {/* ======================================================== */}
          {/* 1. GÜNLÜK YEMEK MENÜSÜ                                   */}
          {/* ======================================================== */}
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20 }}>🍲</Text>
              <Text style={styles.sectionTitle}>Günün Yemek Menüsü</Text>
            </View>
            <Pressable onPress={() => setMenuModalVisible(true)}>
              <Text style={styles.seeAllLink}>Tüm Menü →</Text>
            </Pressable>
          </View>

          <Card variant="primary" style={styles.menuCard}>
            {dailyMenu ? (
              <View style={styles.menuItemsList}>
                <View style={styles.mealRow}>
                  <View style={styles.mealIconBadge}>
                    <Text style={{ fontSize: 16 }}>🍳</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealTitle}>Sabah Kahvaltısı</Text>
                    <Text style={styles.mealFoods}>
                      {Array.isArray(dailyMenu.breakfast) && dailyMenu.breakfast.length > 0
                        ? dailyMenu.breakfast.join(', ')
                        : 'Menü henüz girilmedi.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.mealRow}>
                  <View style={styles.mealIconBadge}>
                    <Text style={{ fontSize: 16 }}>🥣</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealTitle}>Öğle Yemeği</Text>
                    <Text style={styles.mealFoods}>
                      {Array.isArray(dailyMenu.lunch) && dailyMenu.lunch.length > 0
                        ? dailyMenu.lunch.join(', ')
                        : 'Menü henüz girilmedi.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.mealRow}>
                  <View style={styles.mealIconBadge}>
                    <Text style={{ fontSize: 16 }}>🍎</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealTitle}>İkindi Beslenmesi</Text>
                    <Text style={styles.mealFoods}>
                      {Array.isArray(dailyMenu.snack) && dailyMenu.snack.length > 0
                        ? dailyMenu.snack.join(', ')
                        : 'Menü henüz girilmedi.'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyMenuBox}>
                <Text style={styles.emptyMenuEmoji}>🍽️</Text>
                <Text style={styles.emptyMenuText}>
                  Bugün için özel menü kaydı bulunmuyor. Detaylar için idareye danışabilirsiniz.
                </Text>
              </View>
            )}

            <Pressable
              style={styles.menuDetailBtn}
              onPress={() => setMenuModalVisible(true)}
            >
              <Ionicons name="nutrition-outline" size={16} color={colors.primary} />
              <Text style={styles.menuDetailBtnText}>
                Alerjen Bilgileri & Aylık Takvim
              </Text>
            </Pressable>
          </Card>

          {/* ======================================================== */}
          {/* 2. ETKİNLİK & FOTOĞRAF GALERİSİ                          */}
          {/* ======================================================== */}
          <View style={[styles.sectionHeaderRow, { marginTop: spacing.xl }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20 }}>📸</Text>
              <Text style={styles.sectionTitle}>Sınıf Etkinlik Albümü</Text>
            </View>
            <Pressable onPress={() => setGalleryModalVisible(true)}>
              <Text style={styles.seeAllLink}>Tüm Albüm →</Text>
            </Pressable>
          </View>

          <Card onPress={() => setGalleryModalVisible(true)}>
            {activities.length > 0 ? (
              <View>
                <View style={styles.galleryGrid}>
                  {activities.slice(0, 4).map((act) => {
                    const firstPhoto = act.mediaUrls?.[0];
                    return (
                      <View key={act.id} style={styles.galleryThumbWrap}>
                        {firstPhoto ? (
                          <Image source={{ uri: firstPhoto }} style={styles.galleryThumb} />
                        ) : (
                          <View
                            style={[
                              styles.galleryThumb,
                              {
                                backgroundColor: colors.primaryLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                            ]}
                          >
                            <Text style={{ fontSize: 24 }}>🎨</Text>
                          </View>
                        )}
                        <View style={styles.galleryThumbOverlay}>
                          <Text style={styles.galleryThumbTag} numberOfLines={1}>
                            {act.tags?.[0] ?? 'Etkinlik'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.galleryFooter}>
                  <Text style={styles.galleryCaption} numberOfLines={2}>
                    {activities[0]?.title || 'Bugün sınıfta harika oyunlar oynandı!'}
                  </Text>
                  <Text style={styles.galleryLinkText}>
                    Albümü aç ve fotoğrafları incele →
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyGalleryBox}>
                <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>🎨</Text>
                <Text style={styles.emptyGalleryTitle}>Henüz Fotoğraf Paylaşılmadı</Text>
                <Text style={styles.emptyGalleryText}>
                  Öğretmenlerimiz gün içindeki etkinlik karelerini yükledikçe burada görebilirsiniz.
                </Text>
              </View>
            )}
          </Card>

          {/* ======================================================== */}
          {/* 3. GELİŞİM GÖZLEMLERİ & BECERİ KAZANIMLARI               */}
          {/* ======================================================== */}
          <View style={[styles.sectionHeaderRow, { marginTop: spacing.xl }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20 }}>📈</Text>
              <Text style={styles.sectionTitle}>
                {activeChild?.firstName
                  ? `${activeChild.firstName}'in Gelişim Yolculuğu`
                  : 'Gelişim & Kazanım Takibi'}
              </Text>
            </View>
          </View>

          {observations.length > 0 ? (
            <View style={{ gap: spacing.md }}>
              {observations.map((obs) => (
                <Card key={obs.id}>
                  <View style={styles.obsHeader}>
                    <View style={styles.domainBadge}>
                      <Text style={styles.domainBadgeText}>
                        {obs.domain === 'BILISSEL'
                          ? 'Bilişsel Gelişim'
                          : obs.domain === 'MOTOR'
                            ? 'Motor Beceriler'
                            : obs.domain === 'DIL'
                              ? 'Dil & İletişim'
                              : obs.domain === 'SOSYAL_DUYGUSAL'
                                ? 'Sosyal-Duygusal'
                                : obs.domain === 'SANAT'
                                  ? 'Sanat & Yaratıcılık'
                                  : 'Özbakım Becerileri'}
                      </Text>
                    </View>
                    <Text style={styles.obsDate}>
                      {new Date(obs.observedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>

                  <Text style={styles.obsTitle}>{obs.skillName}</Text>
                  <Text style={styles.obsNotes}>{obs.observation}</Text>
                </Card>
              ))}
            </View>
          ) : (
            <Card>
              <View style={styles.emptyObsBox}>
                <Ionicons name="sparkles-outline" size={28} color={colors.amberDark} />
                <Text style={styles.emptyObsTitle}>Yeni Gözlemler Hazırlanıyor</Text>
                <Text style={styles.emptyObsText}>
                  Öğretmenlerimiz çocuğunuzun bilişsel, motor ve sosyal kazanımlarını düzenli
                  olarak gözlemler ve karne dönemlerinde buraya ekler.
                </Text>
              </View>

              {/* Ev Etkinlik Önerileri */}
              {homeSuggestions.length > 0 && (
                <View style={styles.suggestionWrap}>
                  <Text style={styles.suggestionHeader}>💡 Evde Yapabileceğiniz Öneriler</Text>
                  {homeSuggestions.slice(0, 2).map((sug) => (
                    <View key={sug.id} style={styles.sugItem}>
                      <Text style={styles.sugTitle}>• {sug.title}</Text>
                      <Text style={styles.sugDesc}>{sug.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          )}
        </ScrollView>
      )}

      {/* Daily Menu Modal */}
      <DailyMenuModal
        date={todayStr}
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />

      {/* Activity Gallery Modal */}
      <ActivityGalleryModal
        visible={galleryModalVisible}
        onClose={() => setGalleryModalVisible(false)}
        userRole="PARENT"
        classroom={activeChild?.classroomId ?? undefined}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loaderText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAllLink: {
    ...typography.captionBold,
    color: colors.primary,
  },

  // Menu Card
  menuCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  menuItemsList: {
    gap: spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mealIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  mealTitle: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  mealFoods: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyMenuBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyMenuEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyMenuText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.primaryBorder,
    gap: 6,
  },
  menuDetailBtnText: {
    ...typography.captionBold,
    color: colors.primary,
  },

  // Gallery
  galleryGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  galleryThumbWrap: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
  },
  galleryThumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  galleryThumbTag: {
    ...typography.tiny,
    color: colors.textInverse,
    textAlign: 'center',
  },
  galleryFooter: {
    marginTop: spacing.md,
  },
  galleryCaption: {
    ...typography.body,
    color: colors.textPrimary,
  },
  galleryLinkText: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 4,
  },
  emptyGalleryBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyGalleryTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  emptyGalleryText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Observations
  obsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  domainBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  domainBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
  obsDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  obsTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  obsNotes: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyObsBox: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emptyObsTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptyObsText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  suggestionWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  suggestionHeader: {
    ...typography.captionBold,
    color: colors.amberDark,
    marginBottom: spacing.xs,
  },
  sugItem: {
    marginTop: spacing.xs,
  },
  sugTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  sugDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
