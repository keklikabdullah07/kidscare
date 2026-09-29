import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle, View } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'muted' | 'accent' | 'primary';
}

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
}: CardProps): React.ReactElement {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'muted':
        return {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        };
      case 'accent':
        return {
          backgroundColor: colors.amberLight,
          borderColor: colors.amberBorder,
        };
      case 'primary':
        return {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primaryBorder,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        };
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          getVariantStyle(),
          shadows.card,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, getVariantStyle(), shadows.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
