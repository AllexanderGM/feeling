import { useMemo } from 'react'

export const useProfileData = user => {
  // Basic user info helpers - memoized for performance
  const userHelpers = useMemo(() => {
    if (!user) return {}

    return {
      // Personal Information
      getUserName: () => user?.profile?.name || user?.name || '',
      getUserLastName: () => user?.profile?.lastName || user?.lastName || '',
      getUserEmail: () => user?.profile?.email || user?.email || '',
      getUserImages: () => user?.profile?.images || user?.images || [],
      getUserCountry: () => user?.profile?.country || user?.country || '',
      getUserCity: () => user?.profile?.city || user?.city || '',
      getUserId: () => user?.id || '',

      // Status Information
      isUserVerified: () => user?.status?.verified || user?.verified || false,
      isUserApproved: () => user?.status?.approved || user?.approved || false,
      isProfileComplete: () => user?.status?.profileComplete || user?.profileComplete || false,
      getUserCreatedAt: () => user?.status?.createdAt || user?.createdAt,
      getUserLastActive: () => user?.status?.lastActive || user?.lastActive,

      // Match Information (from backend matches DTO)
      getMatchAttempts: () => user?.matches?.availableAttempts || user?.status?.availableAttempts || 0,
      getTodayMatches: () => user?.matches?.todayMatches || 0,
      getTotalMatches: () => user?.matches?.totalMatches || user?.metrics?.matchesCount || 0,
      getMaxDailyAttempts: () => user?.matches?.maxDailyAttempts || 10,

      // Match Stats (from backend matches DTO)
      getPendingSentMatches: () => user?.matches?.pendingSent || 0,
      getPendingReceivedMatches: () => user?.matches?.pendingReceived || 0,
      getAcceptedMatches: () => user?.matches?.accepted || 0,
      getFavoritesCount: () => user?.matches?.favorites || 0,
      getRemainingAttempts: () => user?.matches?.availableAttempts || 0,

      // Additional Profile Information
      getUserGender: () => user?.profile?.gender || null,
      getUserTags: () => user?.profile?.tags || [],
      getUserAgePreferenceMin: () => user?.profile?.agePreferenceMin || 18,
      getUserAgePreferenceMax: () => user?.profile?.agePreferenceMax || 65,
      getUserLocationPreferenceRadius: () => user?.profile?.locationPreferenceRadius || 50,
      getUserPhone: () => user?.profile?.phone || null,
      getUserPhoneCode: () => user?.profile?.phoneCode || null,
      getUserDescription: () => user?.profile?.description || null,
      getUserDepartment: () => user?.profile?.department || null,
      getUserLocality: () => user?.profile?.locality || null,
      getUserDocument: () => user?.profile?.document || null,

      // Privacy Settings
      getProfilePrivacy: () => (user?.privacy?.publicAccount ? 'Público' : 'Privado'),
      isSearchable: () => user?.privacy?.searchVisibility || user?.searchable || false,
      isLocationShared: () => user?.privacy?.locationPublic || user?.shareLocation || false,
      showInSearch: () => user?.privacy?.showMeInSearch || user?.showMeInSearch || false,
      showAge: () => user?.privacy?.showAge || false,
      showLocation: () => user?.privacy?.showLocation || false,
      showPhone: () => user?.privacy?.showPhone || false,

      // Notification Settings
      isEmailNotificationsEnabled: () => user?.notifications?.emailEnabled || false,
      isPhoneNotificationsEnabled: () => user?.notifications?.phoneEnabled || false,
      isMatchNotificationsEnabled: () => user?.notifications?.matchesEnabled || false,
      isEventNotificationsEnabled: () => user?.notifications?.eventsEnabled || false,
      isLoginNotificationsEnabled: () => user?.notifications?.loginEnabled || false,
      isPaymentNotificationsEnabled: () => user?.notifications?.paymentsEnabled || false,

      // Metrics
      getProfileViews: () => user?.metrics?.profileViews || 0,
      getLikesReceived: () => user?.metrics?.likesReceived || 0,
      getPopularityScore: () => user?.metrics?.popularityScore || 0,
      getProfileCompletenessPercentage: () => user?.metrics?.profileCompletenessPercentage || 0,

      // Auth Information
      getAuthProvider: () => user?.auth?.userAuthProvider || null,
      getExternalId: () => user?.auth?.externalId || null,
      getExternalAvatarUrl: () => user?.auth?.externalAvatarUrl || null,
      getLastExternalSync: () => user?.auth?.lastExternalSync || null,

      // Account Information
      getAccountType: () => user?.accountType || 'Básica',
      getRegion: () => user?.region || 'América',
      isAccountActive: () => !(user?.account?.accountDeactivated || false)
    }
  }, [user])

  // Profile data calculations - memoized for performance
  const profileData = useMemo(() => {
    if (!user || !userHelpers.getUserImages) return null

    // Get main image
    const getMainImage = () => {
      // Try to get mainImage from backend first
      const mainImage = user?.profile?.mainImage
      if (mainImage) return mainImage

      // Fallback to first image in array
      const images = userHelpers.getUserImages()
      if (images.length === 0) return null
      return images[0]
    }

    // Calculate age
    const calculateAge = birthDate => {
      if (!birthDate) return null

      let birth
      // Handle array format from backend [year, month, day]
      if (Array.isArray(birthDate) && birthDate.length >= 3) {
        birth = new Date(birthDate[0], birthDate[1] - 1, birthDate[2]) // month is 0-indexed in JS
      } else {
        birth = new Date(birthDate)
      }

      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }

    const birthDate = user?.profile?.dateOfBirth || user?.birthDate || user?.dateOfBirth
    return {
      mainImage: getMainImage(),
      age: calculateAge(birthDate)
    }
  }, [user, userHelpers])

  return {
    ...userHelpers,
    profileData
  }
}

export default useProfileData
