import { ErrorProvider } from '@context/ErrorContext'
import ErrorDisplay from '@components/layout/ErrorDisplay'
import { ErrorBoundary } from '@utils/ErrorBoundary'
import { AuthProvider } from '@context/AuthContext.jsx'
import { FavoritesProvider } from '@context/FavoritesContext.jsx'
import { SearchProvider } from '@context/SearchContext.jsx'
import { CreateTourProvider } from '@context/CreateTourContext.jsx'

const GeneralProvider = ({ children }) => {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <AuthProvider>
          {/*       <FavoritesProvider>
        <SearchProvider> */}
          <CreateTourProvider>{children}</CreateTourProvider>
          {/*         </SearchProvider>
      </FavoritesProvider> */}
        </AuthProvider>
      </ErrorBoundary>
      <ErrorDisplay />
    </ErrorProvider>
  )
}

export default GeneralProvider
