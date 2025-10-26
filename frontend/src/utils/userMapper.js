/**
 * Utilidades para mapear datos de usuario entre backend y frontend
 */

/**
 * Mapea la nueva estructura de usuario del backend al formato esperado por el frontend
 * @param {Object} backendUser - Usuario en formato backend (UserStandardResponseDTO)
 * @returns {Object} Usuario en formato frontend
 */
export const mapBackendUserToFrontend = backendUser => {
  if (!backendUser) {
    return null
  }

  // Si ya viene en formato plano (fallback)
  if (!backendUser.status && !backendUser.profile && !backendUser.user) {
    return backendUser
  }

  const { status, profile, privacy, notifications, metrics, auth } = backendUser
  // UserResponseDTO usa 'user' en lugar de 'profile'
  const userData = backendUser.user || profile || {}

  const mappedUser = {
    // ID del usuario
    id: backendUser.id || userData?.id,

    // Sección de user (datos del perfil)
    user: {
      id: userData?.id,
      name: userData?.name || userData?.firstName || '',
      lastName: userData?.lastName || '',
      username: userData?.username,
      email: userData?.email || status?.email,
      phone: userData?.phone,
      phoneCode: userData?.phoneCode,
      document: userData?.document,
      dateOfBirth: userData?.dateOfBirth || userData?.birthDate,
      age: userData?.age,
      address: userData?.address,
      city: userData?.city,
      locality: userData?.locality,
      country: userData?.country,
      department: userData?.department,
      image: userData?.mainImage || userData?.image,
      mainImage: userData?.mainImage || userData?.image,
      images: userData?.images || [],
      categoryInterest: userData?.categoryInterest,
      description: userData?.description || userData?.bio,
      gender: userData?.gender,
      genderId: userData?.genderId,
      profession: userData?.profession,
      height: userData?.height,
      eyeColor: userData?.eyeColor,
      eyeColorId: userData?.eyeColorId,
      hairColor: userData?.hairColor,
      hairColorId: userData?.hairColorId,
      bodyType: userData?.bodyType,
      bodyTypeId: userData?.bodyTypeId,
      maritalStatus: userData?.maritalStatus,
      maritalStatusId: userData?.maritalStatusId,
      education: userData?.education,
      educationLevelId: userData?.educationLevelId,
      tags: userData?.tags || [],
      religion: userData?.religion,
      religionId: userData?.religionId,
      church: userData?.church,
      churchId: userData?.churchId,
      spiritualMoments: userData?.spiritualMoments,
      spiritualPractices: userData?.spiritualPractices,
      sexualRole: userData?.sexualRole,
      sexualRoleId: userData?.sexualRoleId,
      relationshipType: userData?.relationshipType,
      relationshipId: userData?.relationshipId,
      agePreferenceMin: userData?.agePreferenceMin,
      agePreferenceMax: userData?.agePreferenceMax,
      locationPreferenceRadius: userData?.locationPreferenceRadius
    },

    // Sección de status
    status: {
      role: status?.role || 'CLIENT',
      verified: status?.verified || false,
      approved: status?.approved || false,
      approvalStatus: status?.approvalStatus,
      profileComplete: status?.profileComplete || false,
      configurationCompleted: status?.configurationCompleted || false,
      active: status?.active !== false,
      createdAt: status?.registrationDate || status?.createdAt,
      registeredAt: status?.registrationDate || status?.createdAt,
      lastActive: status?.lastActive,
      availableAttempts: status?.availableAttempts || 0,
      accountDeactivated: status?.accountDeactivated || false,
      deactivationDate: status?.deactivationDate,
      deactivationReason: status?.deactivationReason,
      dismissed: status?.dismissed || false,
      favorite: status?.favorite || false,
      hasAcceptedMatch: status?.hasAcceptedMatch || false,
      hasPendingMatch: status?.hasPendingMatch || false
    },

    // Sección de metrics
    metrics: {
      profileViews: metrics?.profileViews || 0,
      likesReceived: metrics?.likesReceived || 0,
      matchesCount: metrics?.matchesCount || 0,
      matchesAvailable: metrics?.matchesAvailable || 0,
      popularityScore: metrics?.popularityScore || 0,
      profileCompleteness: metrics?.profileCompleteness || userData?.completeness || 0
    },

    // Sección de privacy
    privacy: {
      publicAccount: privacy?.publicAccount,
      searchVisibility: privacy?.searchVisibility,
      locationPublic: privacy?.locationPublic,
      showAge: privacy?.showAge,
      showLocation: privacy?.showLocation,
      showPhone: privacy?.showPhone,
      showMeInSearch: privacy?.showMeInSearch,
      allowNotifications: privacy?.allowNotifications
    },

    // Sección de notifications
    notifications: {
      notificationsEmailEnabled: notifications?.notificationsEmailEnabled,
      notificationsPhoneEnabled: notifications?.notificationsPhoneEnabled,
      notificationsMatchesEnabled: notifications?.notificationsMatchesEnabled,
      notificationsEventsEnabled: notifications?.notificationsEventsEnabled,
      notificationsLoginEnabled: notifications?.notificationsLoginEnabled,
      notificationsPaymentsEnabled: notifications?.notificationsPaymentsEnabled
    },

    // Sección de auth
    auth: {
      userAuthProvider: auth?.userAuthProvider,
      externalId: auth?.externalId,
      externalAvatarUrl: auth?.externalAvatarUrl,
      lastExternalSync: auth?.lastExternalSync
    },

    // Sección de matches
    matches: backendUser.matches || {},

    // Campos adicionales para compatibilidad (acceso directo)
    name: userData?.name || userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || status?.email,
    role: status?.role || 'CLIENT',
    verified: status?.verified || false,
    approved: status?.approved || false,
    profileComplete: status?.profileComplete || false,
    image: userData?.mainImage || userData?.image,
    mainImage: userData?.mainImage || userData?.image,
    fullName: `${userData?.name || ''} ${userData?.lastName || ''}`.trim(),
    initials: `${userData?.name?.[0] || ''}${userData?.lastName?.[0] || ''}`.toUpperCase()
  }

  return mappedUser
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
