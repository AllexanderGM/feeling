import ErrorProvider from '@context/ErrorProvider'
import AuthProvider from '@context/AuthProvider'
import ErrorDisplay from '@components/layout/ErrorDisplay'
import { ErrorBoundary } from '@utils/ErrorBoundary'

const GeneralProvider = ({ children }) => {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <AuthProvider>{children}</AuthProvider>
      </ErrorBoundary>
      <ErrorDisplay />
    </ErrorProvider>
  )
}

export default GeneralProvider
