import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // En producción, podrías enviar esto a un servicio de logging
    // como Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgb(13, 13, 13) 0%, rgb(23, 23, 23) 50%, rgb(18, 18, 18) 100%)',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 300,
              marginBottom: '1rem',
              color: '#ff6b6b'
            }}>
              Oops! Algo salió mal
            </h1>
            <p style={{
              color: '#a1a1aa',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Ha ocurrido un error inesperado. Por favor, recarga la página o contacta con soporte si el problema persiste.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, white 0%, rgb(240, 240, 240) 100%)',
                  color: 'rgb(15, 15, 15)',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Recargar Página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Ir al Inicio
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details style={{
                marginTop: '2rem',
                textAlign: 'left',
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  Detalles del Error (solo en desarrollo)
                </summary>
                <pre style={{
                  fontSize: '0.85rem',
                  color: '#ff9999',
                  marginTop: '1rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;