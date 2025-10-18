import { ErrorProvider } from '@contexts/ErrorContext'
import { AuthProvider } from '@contexts/AuthContext'
import { MatchProvider } from '@contexts/MatchContext'
import { ErrorBoundary } from '@components/layout/ErrorBoundary'

const GeneralProvider = ({ children }) => {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <AuthProvider>
          <MatchProvider>{children}</MatchProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ErrorProvider>
  )
}

export default GeneralProvider
