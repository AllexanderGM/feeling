import { useEffect, useRef, useCallback } from 'react'
import { useAuth, useUser } from '@hooks'
// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import Header from '@components/layout/Header.jsx'
import CardStack from '@components/ui/userSuggestionCards'

const Home = () => {
  // ========== HOOKS ==========
  const { user, loading: authLoading } = useAuth()
  const { suggestions, suggestionsPagination, fetchUserSuggestions, loading: userLoading } = useUser()

  // ========== STATE ==========
  const hasInitializedRef = useRef(false)

  // ========== COMPUTED VALUES ==========
  const isLoading = authLoading || userLoading

  // ========== CALLBACKS ==========
  // Función para recargar las sugerencias desde el inicio
  const handleRefresh = useCallback(() => {
    fetchUserSuggestions(0, 10)
  }, [fetchUserSuggestions])

  // ========== EFFECTS ==========
  // Cargar sugerencias cuando el componente se monta
  useEffect(() => {
    if (user && !userLoading && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      // Cargar usuarios inicialmente para mejor experiencia
      fetchUserSuggestions(0, 10)
    }
  }, [user, userLoading, fetchUserSuggestions])

  // ========== LOADING & ERROR STATES ==========
  if (isLoading) return <LoadData>Cargando sugerencias...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  // ========== RENDER ==========
  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <Header user={user} onRefresh={handleRefresh} />

      {/* Main Content - CardStack maneja tanto las cards como el EmptyState */}
      <main className='flex-1 flex items-center justify-center mt-10'>
        <CardStack fetchUserSuggestions={fetchUserSuggestions} suggestions={suggestions} suggestionsPagination={suggestionsPagination} />
      </main>
    </div>
  )
}

export default Home
