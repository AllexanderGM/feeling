import { memo, useMemo } from 'prop-types'
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { Eye, Edit, Trash2, Play, Pause, X, CheckCircle, RotateCcw, MoreVertical } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Componente que renderiza las acciones disponibles para un evento según su estado
 * Cada estado tiene acciones específicas permitidas
 */
const EventActions = memo(
  ({ event, onView, onEdit, onDelete, onPublish, onPause, onCancel, onActivate, loading = false }) => {
    /**
     * Determina qué acciones están disponibles según el estado del evento
     */
    const getActionsByStatus = status => {
      switch (status) {
        case 'PUBLICADO':
          return ['view', 'edit', 'pause', 'cancel', 'delete']
        case 'EN_EDICION':
          return ['view', 'edit', 'publish', 'cancel', 'delete']
        case 'PAUSADO':
          return ['view', 'edit', 'publish', 'cancel', 'delete']
        case 'CANCELADO':
          return ['view', 'activate', 'delete']
        case 'TERMINADO':
          return ['view', 'edit', 'delete']
        default:
          return ['view', 'edit', 'delete']
      }
    }

    const allowedActions = useMemo(() => getActionsByStatus(event.status), [event.status])

    /**
     * Configuración de cada acción disponible
     */
    const actionConfig = {
      view: {
        icon: <Eye className='w-4 h-4' />,
        label: 'Ver detalles',
        color: 'blue',
        handler: onView,
        isDisabled: false
      },
      edit: {
        icon: <Edit className='w-4 h-4' />,
        label: 'Editar evento',
        color: 'gray',
        handler: onEdit,
        isDisabled: false
      },
      publish: {
        icon: <CheckCircle className='w-4 h-4' />,
        label: event.status === 'PAUSADO' ? 'Reanudar evento' : 'Publicar evento',
        color: 'green',
        handler: onPublish,
        isDisabled: false
      },
      pause: {
        icon: <Pause className='w-4 h-4' />,
        label: 'Pausar evento',
        color: 'orange',
        handler: onPause,
        isDisabled: false
      },
      cancel: {
        icon: <X className='w-4 h-4' />,
        label: 'Cancelar evento',
        color: 'red',
        handler: onCancel,
        isDisabled: false
      },
      activate: {
        icon: <RotateCcw className='w-4 h-4' />,
        label: 'Activar evento',
        color: 'green',
        handler: onActivate,
        isDisabled: false
      },
      delete: {
        icon: <Trash2 className='w-4 h-4' />,
        label: 'Eliminar evento',
        color: 'red',
        handler: onDelete,
        isDisabled: false
      }
    }

    /**
     * Renderiza un botón de acción individual
     */
    const renderActionButton = action => {
      const config = actionConfig[action]
      if (!config) return null

      const colorClasses = {
        blue: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20',
        gray: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20',
        green: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20',
        orange: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20',
        red: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
      }

      return (
        <Tooltip key={action} color={config.color === 'red' ? 'danger' : 'default'} content={config.label}>
          <Button
            isIconOnly
            className={colorClasses[config.color]}
            isDisabled={loading || config.isDisabled}
            size='sm'
            title={config.label}
            variant='flat'
            onPress={() => config.handler?.(event)}>
            {config.icon}
          </Button>
        </Tooltip>
      )
    }

    // Determinar acciones primarias (siempre visibles) y secundarias (en dropdown si hay muchas)
    const primaryActions = allowedActions.slice(0, 4)
    const secondaryActions = allowedActions.slice(4)

    return (
      <div className='flex items-center justify-center gap-2'>
        {/* Acciones primarias */}
        {primaryActions.map(action => renderActionButton(action))}

        {/* Acciones secundarias en dropdown */}
        {secondaryActions.length > 0 && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                className='bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20'
                isDisabled={loading}
                size='sm'
                variant='flat'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Más acciones'>
              {secondaryActions.map(action => {
                const config = actionConfig[action]
                if (!config) return null

                return (
                  <DropdownItem
                    key={action}
                    className={config.color === 'red' ? 'text-danger' : ''}
                    startContent={config.icon}
                    onPress={() => config.handler?.(event)}>
                    {config.label}
                  </DropdownItem>
                )
              })}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    )
  }
)

EventActions.displayName = 'EventActions'

EventActions.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.oneOf(['PUBLICADO', 'EN_EDICION', 'PAUSADO', 'CANCELADO', 'TERMINADO']).isRequired
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onPublish: PropTypes.func,
  onPause: PropTypes.func,
  onCancel: PropTypes.func,
  onActivate: PropTypes.func,
  loading: PropTypes.bool
}

export default EventActions
