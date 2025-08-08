/**
 * Utilidades para mapear datos de usuario entre backend y frontend
 */

/**
 * Mapea la nueva estructura de usuario del backend al formato esperado por el frontend
 * @param {Object} backendUser - Usuario en formato backend (UserStandardResponseDTO)
 * @returns {Object} Usuario en formato frontend
 */
export const mapBackendUserToFrontend = backendUser => {
  if (!backendUser) return null

  // Si ya viene en formato plano (fallback)
  if (!backendUser.status && !backendUser.profile) {
    return backendUser
  }

  const { status, profile, privacy, notifications, metrics, auth, account } = backendUser

  return {
    // Información básica del perfil
    id: backendUser.id || profile?.id,
    name: profile?.name || profile?.firstName || '',
    lastName: profile?.lastName || '',
    username: profile?.username,
    email: profile?.email || status?.email,
    phone: profile?.phone,
    document: profile?.document,

    // Fechas
    dateOfBirth: profile?.birthDate || profile?.dateOfBirth,
    birthDate: profile?.birthDate || profile?.dateOfBirth,
    createdAt: status?.registrationDate || status?.createdAt,
    registeredAt: status?.registrationDate || status?.createdAt,

    // Ubicación
    address: profile?.address,
    city: profile?.city,
    locality: profile?.locality,
    country: profile?.country,

    // Estado del usuario
    role: status?.role || 'CLIENT',
    verified: status?.verified || false,
    approved: status?.approved || false,
    profileComplete: status?.profileComplete || false,
    active: status?.active !== false,

    // Imágenes y multimedia
    image: profile?.mainImage || profile?.image,
    mainImage: profile?.mainImage || profile?.image,
    images: profile?.images || [],
    externalAvatarUrl: auth?.externalAvatarUrl,

    // Intereses y categorías
    categoryInterest: profile?.categoryInterest,
    description: profile?.description || profile?.bio,

    // Métricas y estadísticas
    profileViews: metrics?.profileViews || 0,
    likesReceived: metrics?.likesReceived || 0,
    matchesCount: metrics?.matchesCount || 0,
    matchesAvailable: metrics?.matchesAvailable || 0,
    popularityScore: metrics?.popularityScore || 0,
    profileCompleteness: metrics?.profileCompleteness || profile?.completeness || 0,

    // Configuración de privacidad
    publicAccount: privacy?.publicAccount,
    searchVisibility: privacy?.searchVisibility,
    locationPublic: privacy?.locationPublic,
    showAge: privacy?.showAge,
    showLocation: privacy?.showLocation,
    showPhone: privacy?.showPhone,
    showMeInSearch: privacy?.showMeInSearch,

    // Configuración de notificaciones
    notificationsEmailEnabled: notifications?.notificationsEmailEnabled,
    notificationsPhoneEnabled: notifications?.notificationsPhoneEnabled,
    notificationsMatchesEnabled: notifications?.notificationsMatchesEnabled,
    notificationsEventsEnabled: notifications?.notificationsEventsEnabled,
    notificationsLoginEnabled: notifications?.notificationsLoginEnabled,
    notificationsPaymentsEnabled: notifications?.notificationsPaymentsEnabled,

    // Información de autenticación
    userAuthProvider: auth?.userAuthProvider,
    externalId: auth?.externalId,
    lastExternalSync: auth?.lastExternalSync,

    // Estado de la cuenta
    accountDeactivated: account?.accountDeactivated || false,
    deactivationDate: account?.deactivationDate,
    deactivationReason: account?.deactivationReason,

    // Campos adicionales para compatibilidad
    fullName: `${profile?.name || ''} ${profile?.lastName || ''}`.trim(),
    initials: `${profile?.name?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase()
  }
}

/**
 * Mapea una lista de usuarios del backend al frontend
 * @param {Array} backendUsers - Lista de usuarios en formato backend
 * @returns {Array} Lista de usuarios en formato frontend
 */
export const mapBackendUsersToFrontend = backendUsers => {
  if (!Array.isArray(backendUsers)) return []
  return backendUsers.map(mapBackendUserToFrontend).filter(Boolean)
}

/**
 * Mapea una respuesta paginada de usuarios del backend al frontend
 * @param {Object} backendResponse - Respuesta paginada del backend
 * @returns {Object} Respuesta paginada con usuarios mapeados
 */
export const mapBackendUsersPaginatedResponse = backendResponse => {
  if (!backendResponse) return null

  // Si es una respuesta paginada
  if (backendResponse.content && Array.isArray(backendResponse.content)) {
    return {
      ...backendResponse,
      content: mapBackendUsersToFrontend(backendResponse.content)
    }
  }

  // Si es una respuesta simple (array)
  if (Array.isArray(backendResponse)) {
    return mapBackendUsersToFrontend(backendResponse)
  }

  // Si es un usuario individual
  return mapBackendUserToFrontend(backendResponse)
}
