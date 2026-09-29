import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ParentChildOverview, StudentPassport } from '@kidscare/shared-types';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/Card';
import { ScreenContainer } from '../components/ScreenContainer';
import { fetchParentChildrenOverview } from '../api/parent';
import { colors, radii, spacing, typography } from '../theme';

export function ParentProfileTab(): React.ReactElement {
  const { logout, state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childrenData, setChildrenData] = useState<ParentChildOverview[]>([]);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  const loadData = async () => {
    try {
      const data = await fetchParentChildrenOverview(todayStr).catch(() => []);
      setChildrenData(data);
    } catch {
      // quiet
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

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const activeChild = childrenData[0]?.student;
  const passport: StudentPassport | undefined = activeChild?.passport ?? undefined;

  return (
    <ScreenContainer
      icon="person"
      title="Profil & Hesap"
      subtitle="Veli ve öğrenci bilgileri, güvenlik ve ayarlar"
      scrollable={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {/* Veli Bilgisi */}
        <Card variant="primary" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {state.status === 'authenticated' && state.user.email
                  ? state.user.email.slice(0, 2).toUpperCase()
                  : 'VL'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.userName}>
                {state.status === 'authenticated' ? state.user.email : 'Veli'}
              </Text>
              <Text style={styles.userRole}>Öğrenci Velisi • Demo Kreş</Text>
            </View>
          </View>
        </Card>

        {/* Kayıtlı Öğrenci Kartı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👶 Kayıtlı Öğrenci</Text>
        </View>

        {loading ? (
          <View style={{ padding: spacing.lg, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : activeChild ? (
          <Card style={styles.childCard}>
            <View style={styles.childHeader}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>
                  {activeChild.firstName.charAt(0)}
                  {activeChild.lastName.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>
                  {activeChild.firstName} {activeChild.lastName}
                </Text>
                <Text style={styles.childSub}>
                  {(activeChild as any).classroom?.name ?? 'Sınıf Belirtilmemiş'}
                </Text>
              </View>
            </View>

            <View style={styles.childDetailRow}>
              <Text style={styles.childDetailLabel}>Doğum Tarihi:</Text>
              <Text style={styles.childDetailVal}>
                {activeChild.dateOfBirth
                  ? new Date(activeChild.dateOfBirth).toLocaleDateString('tr-TR')
                  : '-'}
              </Text>
            </View>
            <View style={styles.childDetailRow}>
              <Text style={styles.childDetailLabel}>Cinsiyet:</Text>
              <Text style={styles.childDetailVal}>{activeChild.gender ?? 'Belirtilmedi'}</Text>
            </View>
          </Card>
        ) : (
          <Card>
            <Text style={styles.emptyText}>Kayıtlı öğrenci bilgisine ulaşılamadı.</Text>
          </Card>
        )}

        {/* Öğrenci Sağlık Pasaportu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🩺 Öğrenci Sağlık Pasaportu</Text>
        </View>

        <Card style={styles.passportCard}>
          <View style={styles.passportRow}>
            <Text style={styles.passportLabel}>Kan Grubu:</Text>
            <Text style={styles.passportValue}>{passport?.bloodType ?? '0 Rh(+)'}</Text>
          </View>

          <View style={styles.passportRow}>
            <Text style={styles.passportLabel}>Bilinen Alerjiler:</Text>
            <Text
              style={[
                styles.passportValue,
                passport?.allergies && passport.allergies.length > 0
                  ? { color: colors.danger, fontWeight: '700' }
                  : {},
              ]}
            >
              {passport?.allergies && passport.allergies.length > 0
                ? passport.allergies.join(', ')
                : 'Bilinen alerji yok'}
            </Text>
          </View>

          <View style={styles.passportRow}>
            <Text style={styles.passportLabel}>Kronik Rahatsızlık:</Text>
            <Text style={styles.passportValue}>
              {passport?.chronicConditions && passport.chronicConditions.length > 0
                ? passport.chronicConditions.join(', ')
                : 'Yok'}
            </Text>
          </View>

          <View style={styles.passportRow}>
            <Text style={styles.passportLabel}>Acil Durum Doktoru:</Text>
            <Text style={styles.passportValue}>
              {passport?.doctorName
                ? `${passport.doctorName} (${passport.doctorPhone || 'Tel Yok'})`
                : 'Belirtilmedi'}
            </Text>
          </View>

          {passport?.specialNotes && (
            <View style={[styles.passportRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.passportLabel}>Özel Notlar:</Text>
              <Text style={styles.passportValue}>{passport.specialNotes}</Text>
            </View>
          )}
        </Card>

        {/* Çıkış Yap Butonu */}
        <Card
          onPress={handleLogout}
          variant="muted"
          style={{ marginTop: spacing.xl, borderColor: colors.dangerBg }}
        >
          <View style={styles.logoutRow}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Hesaptan Güvenli Çıkış Yap</Text>
          </View>
        </Card>

        <Text style={styles.versionFooter}>KidsCare Mobile v2.0 • Impeccable Design</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.textInverse,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontSize: 16,
  },
  userRole: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  childCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  childAvatarText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  childName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  childSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  childDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  childDetailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  childDetailVal: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },

  passportCard: {
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  passportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  passportLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  passportValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.danger,
  },

  versionFooter: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
