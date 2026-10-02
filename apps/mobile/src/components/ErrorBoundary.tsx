import { Component, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.card}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Beklenmeyen bir hata oluştu</Text>
          <Text style={styles.body}>
            Uygulama geçici olarak yanıt veremedi. Aşağıdaki butonla yeniden deneyebilirsin.
          </Text>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{this.state.error.message}</Text>
          </View>
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={this.reset}>
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  card: { padding: spacing.xxl, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radii.sm,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  errorText: { color: colors.dangerText, fontSize: 12, fontFamily: 'monospace' },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  buttonText: { color: colors.textInverse, fontWeight: '600', fontSize: 14 },
});
