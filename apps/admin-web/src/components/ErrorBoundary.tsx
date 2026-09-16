import { Component, type ReactNode } from 'react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Beklenmeyen bir hata oluştu</h1>
          <p className="text-sm text-gray-600 mb-4">
            Uygulama geçici olarak yanıt veremedi. Aşağıdaki butonla yeniden deneyebilirsiniz.
          </p>
          <pre className="text-xs text-left text-red-700 bg-red-50 p-3 rounded mb-4 overflow-auto max-h-32">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={this.reset}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }
}