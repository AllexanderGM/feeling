import { useMemo } from 'react'

const useUserStats = (users) => {
  return useMemo(() => {
    if (!users?.length) return null

    return users.reduce(
      (acc, user) => {
        acc.total++

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          acc.admins++
        } else {
          acc.users++
        }

        if (user.verified) {
          acc.verified++
        } else {
          acc.unverified++
        }

        return acc
      },
      {
        total: 0,
        admins: 0,
        users: 0,
        verified: 0,
        unverified: 0
      }
    )
  }, [users])
}

export default useUserStats