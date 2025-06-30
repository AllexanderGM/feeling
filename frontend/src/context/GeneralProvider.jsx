import { ErrorProvider } from '@context/ErrorContext'
import { AuthProvider } from '@context/AuthContext'
import { ErrorBoundary } from '@components/layout/ErrorBoundary'

const GeneralProvider = ({ children }) => {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <AuthProvider>{children}</AuthProvider>
      </ErrorBoundary>
    </ErrorProvider>
  )
}

export default GeneralProvider
