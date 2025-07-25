import { useMemo } from 'react'

export const useProfileData = (user) => {
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
      
      // Match Information
      getMatchAttempts: () => user?.metrics?.availableAttempts || user?.matchAttempts || user?.availableAttempts || 5,
      getTodayMatches: () => user?.metrics?.todayMatches || user?.todayMatches || 0,
      getTotalMatches: () => user?.metrics?.matchesCount || user?.totalMatches || user?.matchesCount || 0,
      getMaxDailyAttempts: () => user?.maxDailyAttempts || 10,
      
      // Privacy Settings
      getProfilePrivacy: () => user?.privacy?.publicAccount ? 'Público' : 'Privado',
      isSearchable: () => user?.privacy?.searchVisibility || user?.searchable || false,
      isLocationShared: () => user?.privacy?.locationPublic || user?.shareLocation || false,
      showInSearch: () => user?.privacy?.showMeInSearch || user?.showMeInSearch || false,
      
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
      const images = userHelpers.getUserImages()
      if (images.length === 0) return null
      return images[0] // always use the first image
    }

    // Calculate age
    const calculateAge = (birthDate) => {
      if (!birthDate) return null
      const today = new Date()
      const birth = new Date(birthDate)
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