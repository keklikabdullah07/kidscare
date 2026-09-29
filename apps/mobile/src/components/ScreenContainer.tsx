import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { useResponsive } from '../utils/responsive';

interface ScreenContainerProps {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightAction?: ReactNode;
  scrollable?: boolean;
  children: ReactNode;
}

export function ScreenContainer({
  title,
  subtitle,
  icon,
  rightAction,
  scrollable = true,
  children,
}: ScreenContainerProps): React.ReactElement {
  const { contentMaxWidth, horizontalPadding, isSmallPhone } = useResponsive();

  const content = (
    <View
      style={[
        styles.innerContainer,
        {
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
        },
      ]}
    >
      {(title || rightAction) && (
        <View style={[styles.header, isSmallPhone && { marginBottom: spacing.md }]}>
          <View style={styles.leftGroup}>
            {icon && (
              <View style={[styles.iconBadge, isSmallPhone && { width: 38, height: 38, borderRadius: 12 }]}>
                <Ionicons name={icon} size={isSmallPhone ? 18 : 22} color={colors.textInverse} />
              </View>
            )}
            <View style={styles.titleWrapper}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    isSmallPhone && { fontSize: 18, letterSpacing: -0.2 },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    isSmallPhone && { fontSize: 11 },
                  ]}
                  numberOfLines={2}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction && <View style={styles.actionWrapper}>{rightAction}</View>}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl + 80, // Extra padding for elevated bottom tabs
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md + 2, // 14px rounded-2xl
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.xs,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionWrapper: {
    marginLeft: spacing.md,
  },
});
