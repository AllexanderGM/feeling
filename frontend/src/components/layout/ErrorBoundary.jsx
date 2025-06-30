import React from 'react'
import { Button, Card, CardBody, Divider } from '@heroui/react'
import ErrorContext from '@context/ErrorContext'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por Error Boundary:', {
      error: error,
      errorInfo: errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    })

    this.setState({ errorInfo })

    try {
      if (this.context && typeof this.context.handleError === 'function') {
        this.context.handleError(error, 'alert')
      }
    } catch (contextError) {
      console.warn('No se pudo usar ErrorContext desde ErrorBoundary:', contextError)
    }
  }

  logErrorToService = (error, errorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      console.log('Error data for logging service:', errorData)
    } catch (loggingError) {
      console.error('Error al enviar log:', loggingError)
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary)
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
          <div className="max-w-lg w-full">
            {/* Header similar al formulario */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">¡Oops! Algo salió mal</h1>
              <p className="text-gray-400">Ha ocurrido un error inesperado en la aplicación</p>
            </div>

            {/* Card principal con estilo similar */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <CardBody className="p-8 space-y-6">
                {/* Ícono de error circular como foto de perfil */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-4 border-red-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-400 text-5xl">emergency_heat</span>
                    </div>
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 animate-pulse"></div>
                  </div>

                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Error de aplicación</h2>
                    <p className="text-gray-400 text-sm">No te preocupes, puedes intentar algunas opciones para continuar.</p>
                  </div>
                </div>

                <Divider className="bg-gray-600/50" />

                {/* Sección de acciones - similar al layout de formulario */}
                <div className="space-y-4">
                  <h3 className="text-gray-300 text-center font-medium">Opciones disponibles</h3>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant="solid"
                        color="primary"
                        startContent={<span className="material-symbols-outlined">refresh</span>}
                        onPress={() => window.location.reload()}>
                        Recargar página
                      </Button>

                      <Button
                        variant="ghost"
                        startContent={<span className="material-symbols-outlined">home</span>}
                        onPress={() => (window.location.href = '/')}>
                        Ir al inicio
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Información adicional con estilo similar a los tips */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-400 text-xl">info</span>
                    <div>
                      <p className="text-blue-400 text-sm font-medium mb-1">Información</p>
                      <p className="text-blue-300/80 text-xs">
                        Si el problema persiste, intenta cerrar y abrir la aplicación nuevamente, o contacta con soporte técnico si
                        continúas experimentando dificultades.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles técnicos para desarrollo */}
                {import.meta.env && import.meta.env.MODE === 'development' && this.state.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <details className="text-left">
                      <summary className="cursor-pointer text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-sm">code</span>
                        Detalles técnicos (solo en desarrollo)
                      </summary>
                      <div className="bg-gray-900/50 rounded p-3 border border-gray-700">
                        <pre className="text-xs text-red-300 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                          {this.state.error.toString()}
                          {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Footer similar al del formulario */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">Error capturado automáticamente • Feeling App</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.contextType = ErrorContext

// HOC para usar Error Boundary más fácilmente
export const withErrorBoundary = (Component, fallback) => {
  const WrappedComponent = props => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook para componentes funcionales
export const useErrorHandler = () => {
  return error => {
    throw error
  }
}
