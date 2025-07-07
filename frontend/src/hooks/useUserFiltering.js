import { useMemo } from 'react'

const useUserFiltering = (users, currentUser) => {
  return useMemo(() => {
    if (!users?.length) return []

    return users.filter(user => {
      // Si es superadmin, ve a todos incluyéndose a sí mismo
      if (currentUser?.role === 'SUPER_ADMIN') return true

      // Si es admin regular: Ve a clientes regulares y a sí mismo
      if (currentUser?.role === 'ADMIN') {
        // Se incluye a sí mismo
        if (user.email === currentUser?.email) return true
        // Ve solo a clientes regulares (no otros admins)
        return user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.email !== 'admin@admin.com'
      }

      return false
    })
  }, [users, currentUser])
}

export default useUserFiltering
