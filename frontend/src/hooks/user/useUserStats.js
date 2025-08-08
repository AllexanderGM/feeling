import { useMemo } from 'react'

const useUserStats = users => {
  return useMemo(() => {
    if (!users?.length) {
      return {
        total: 0,
        admins: 0,
        users: 0,
        verified: 0,
        unverified: 0,
        approved: 0,
        pending: 0,
        profilesComplete: 0,
        profilesIncomplete: 0,
        averageCompleteness: 0
      }
    }

    const stats = users.reduce(
      (acc, user) => {
        acc.total++

        // Compatibilidad con ambas estructuras: nueva (user.role) y antigua (user.status?.role)
        const userRole = user.role || user.status?.role || 'CLIENT'
        const isVerified = user.verified !== undefined ? user.verified : user.status?.verified || false
        const isApproved = user.approved !== undefined ? user.approved : user.status?.approved || false
        const isProfileComplete = user.profileComplete !== undefined ? user.profileComplete : user.status?.profileComplete || false

        if (userRole === 'ADMIN') {
          acc.admins++
        } else {
          acc.users++
        }

        if (isVerified) {
          acc.verified++
        } else {
          acc.unverified++
        }

        if (isApproved) {
          acc.approved++
        } else {
          acc.pending++
        }

        if (isProfileComplete) {
          acc.profilesComplete++
        } else {
          acc.profilesIncomplete++
        }

        // Calcular completitud promedio
        const completeness = user.profileCompleteness || user.profile?.completeness || 0
        acc.totalCompleteness += completeness

        return acc
      },
      {
        total: 0,
        admins: 0,
        users: 0,
        verified: 0,
        unverified: 0,
        approved: 0,
        pending: 0,
        profilesComplete: 0,
        profilesIncomplete: 0,
        totalCompleteness: 0
      }
    )

    // Calcular la completitud promedio después del reduce
    stats.averageCompleteness = stats.total > 0 ? Math.round(stats.totalCompleteness / stats.total) : 0

    return stats
  }, [users])
}

export default useUserStats
