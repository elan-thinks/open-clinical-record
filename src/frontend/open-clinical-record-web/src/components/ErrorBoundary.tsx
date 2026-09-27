import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches React render errors so the user sees a recoverable message
 * instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[OCR ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error.message || 'Unknown error';
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0c1310',
            color: '#eef3ef',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Something went wrong</div>
            <p style={{ color: '#a7bdae', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
              The UI hit an unexpected error. Try reloading. If it keeps happening, clear site data
              for this origin and sign in again.
            </p>
            <pre
              style={{
                textAlign: 'left',
                background: '#121a15',
                border: '1px solid #1e2b23',
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                color: '#e8778a',
                overflow: 'auto',
                marginBottom: 16,
              }}
            >
              {msg}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: '#3ddc97',
                color: '#04140c',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 9,
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: 8,
              }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch {
                  /* ignore */
                }
                window.location.href = '/login';
              }}
              style={{
                background: 'transparent',
                color: '#a7bdae',
                border: '1px solid #1e2b23',
                padding: '10px 16px',
                borderRadius: 9,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Clear session &amp; sign in
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
