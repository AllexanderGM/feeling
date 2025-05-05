import React from 'react'
import ErrorContext from '@context/ErrorContext'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Error capturado por el límite de errores:', error, info)

    // Si existe el contexto de error, usarlo
    if (this.context && this.context.handleError) {
      this.context.handleError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Algo salió mal</h2>
          <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#171717',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              fontFamily: '"BEBAS NEUE", sans-serif'
            }}>
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.contextType = ErrorContext
