import { memo } from 'react'
import { Chip, Avatar } from '@heroui/react'
import { UserIcon } from 'lucide-react'
import TableActionCell from '@components/ui/TableActionCell.jsx'
import { USER_ROLE_COLORS, USER_INTEREST_COLORS } from '@constants/tableConstants.js'

const UserTableCell = memo(({ user, columnKey, currentUser, onEdit, onDelete }) => {
  const cellValue = user[columnKey]

  switch (columnKey) {
    case 'name': {
      const hasImage = user.mainImage || user.image || (user.images && user.images[0]) || user.externalAvatarUrl
      const isCurrentUser = user.email === currentUser?.email

      return (
        <div className="flex items-center gap-3">
          {hasImage ? (
            <Avatar
              radius="lg"
              src={hasImage}
              alt={`${user.name || 'Usuario'}`}
              className="w-10 h-10"
              onError={e => {
                console.warn('🖼️ Image failed to load for user:', user.id, 'URL:', e.target.src)
              }}
            />
          ) : (
            <Avatar radius="lg" className="w-10 h-10 bg-default-100" icon={<UserIcon className="w-6 h-6 text-default-500" />} />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{`${user.name || 'Usuario'} ${user.lastName || ''}`.trim()}</p>
              {isCurrentUser && (
                <Chip size="sm" color="primary" variant="flat">
                  Tú
                </Chip>
              )}
            </div>
            <p className="text-xs text-default-500">{user.email}</p>
          </div>
        </div>
      )
    }
    case 'categoryInterest':
      return (
        <Chip className="capitalize" color={USER_INTEREST_COLORS[user.categoryInterest] || 'default'} size="sm" variant="flat">
          {user.categoryInterest || 'No especificado'}
        </Chip>
      )
    case 'location':
      return (
        <div className="flex flex-col">
          <p className="text-bold text-sm">{user.country || 'No especificado'}</p>
          <p className="text-bold text-sm text-default-400">{user.city || ''}</p>
          {user.locality && <p className="text-sm text-default-400">{user.locality}</p>}
        </div>
      )
    case 'verified':
      return (
        <Chip className="capitalize" color={user.verified ? 'success' : 'warning'} size="sm" variant="flat">
          {user.verified ? 'Verificado' : 'Pendiente'}
        </Chip>
      )
    case 'profileComplete':
      return (
        <Chip className="capitalize" color={user.profileComplete ? 'success' : 'warning'} size="sm" variant="flat">
          {user.profileComplete ? 'Completo' : 'Incompleto'}
        </Chip>
      )
    case 'age': {
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

      const age = calculateAge(user.birthDate || user.dateOfBirth)
      
      return (
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-foreground">
            {age ? `${age}` : 'N/A'}
          </span>
          <p className="text-xs text-default-500">años</p>
        </div>
      )
    }
    case 'matches':
      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
            <span className="text-sm font-semibold text-foreground">
              {user.matchesAvailable !== undefined ? user.matchesAvailable : 'N/A'}
            </span>
          </div>
          <p className="text-xs text-default-500">disponibles</p>
        </div>
      )
    case 'profileCompleteness': {
      const completeness = user.profileCompleteness || 0
      const getColor = (percentage) => {
        if (percentage >= 80) return 'success'
        if (percentage >= 60) return 'warning'
        if (percentage >= 40) return 'primary'
        return 'danger'
      }

      return (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 bg-default-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  completeness >= 80 ? 'bg-success-500' : 
                  completeness >= 60 ? 'bg-warning-500' : 
                  completeness >= 40 ? 'bg-primary-500' : 'bg-danger-500'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground">
              {completeness}%
            </span>
          </div>
          <Chip 
            size="sm" 
            variant="flat" 
            color={getColor(completeness)}
            className="text-xs"
          >
            {completeness >= 80 ? 'Completo' : 
             completeness >= 60 ? 'Bueno' : 
             completeness >= 40 ? 'Regular' : 'Incompleto'}
          </Chip>
        </div>
      )
    }
    case 'role':
      return (
        <Chip className="capitalize" color={USER_ROLE_COLORS[user.role] || 'default'} size="sm" variant="flat">
          {user.role?.toLowerCase() || 'user'}
        </Chip>
      )
    case 'actions': {
      const isCurrentUser = user.email === currentUser?.email
      const canEdit = !isCurrentUser && (currentUser?.role === 'ADMIN' && user.role !== 'ADMIN')
      const canDelete = false // Los administradores no pueden eliminar usuarios

      let editTooltip = 'Editar'
      let deleteTooltip = 'Eliminar'

      if (isCurrentUser) {
        editTooltip = 'No puedes editarte a ti mismo'
        deleteTooltip = 'No puedes eliminarte a ti mismo'
      } else if (!canEdit) {
        editTooltip = 'No tienes permisos para editar administradores'
      }
      
      if (!canDelete) {
        deleteTooltip = 'No tienes permisos para eliminar usuarios'
      }

      return (
        <TableActionCell
          item={user}
          onEdit={canEdit ? onEdit : null}
          onDelete={canDelete ? onDelete : null}
          editTooltip={editTooltip}
          deleteTooltip={deleteTooltip}
        />
      )
    }
    default:
      return cellValue || ''
  }
})

UserTableCell.displayName = 'UserTableCell'

export default UserTableCell
