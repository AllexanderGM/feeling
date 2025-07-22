import { useMemo } from 'react'

const useUserFiltering = (users, currentUser) => {
  return useMemo(() => {
    if (!users?.length) return []

    return users.filter(user => {
      // Si es admin: Ve a clientes regulares y a sí mismo
      if (currentUser?.status?.role === 'ADMIN') {
        // Se incluye a sí mismo
        if (user.profile?.email === currentUser?.profile?.email) return true
        // Ve solo a clientes regulares (no otros admins)
        return user.status?.role !== 'ADMIN' && user.profile?.email !== 'admin@admin.com'
      }

      return false
    })
  }, [users, currentUser])
}

export default useUserFiltering
