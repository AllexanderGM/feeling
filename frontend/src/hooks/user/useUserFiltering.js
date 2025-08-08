import { useMemo } from 'react'

const useUserFiltering = (users, currentUser) => {
  return useMemo(() => {
    if (!users?.length) return []

    return users.filter(user => {
      // Si es admin: Ve a clientes regulares y aprobados, y a sí mismo
      if (currentUser?.role === 'ADMIN' || currentUser?.status?.role === 'ADMIN') {
        // Se incluye a sí mismo
        const userEmail = user.email || user.profile?.email
        const currentEmail = currentUser?.email || currentUser?.profile?.email

        if (userEmail === currentEmail) return true

        // Ve solo a clientes regulares (no otros admins)
        // Nota: Los usuarios ya vienen filtrados como aprobados desde el servicio
        return user.role !== 'ADMIN' && userEmail !== 'admin@admin.com'
      }

      return false
    })
  }, [users, currentUser])
}

export default useUserFiltering
