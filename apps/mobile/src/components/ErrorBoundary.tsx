import { Component, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center' },
  card: { padding: 24, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 14, color: '#4B5563', marginBottom: 16, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  errorText: { color: '#B91C1C', fontSize: 12, fontFamily: 'monospace' },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});