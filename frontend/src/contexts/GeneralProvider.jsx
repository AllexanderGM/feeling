import { ErrorProvider } from '@contexts/ErrorContext'
import { AuthProvider } from '@contexts/AuthContext'
import { MatchProvider } from '@contexts/MatchContext'
import { UserApprovalProvider } from '@contexts/UserApprovalContext'
import { ErrorBoundary } from '@components/layout/ErrorBoundary'

const GeneralProvider = ({ children }) => {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <UserApprovalProvider>
          <AuthProvider>
            <MatchProvider>{children}</MatchProvider>
          </AuthProvider>
        </UserApprovalProvider>
      </ErrorBoundary>
    </ErrorProvider>
  )
}

export default GeneralProvider
