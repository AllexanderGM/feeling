import { memo, useState } from 'react'
import { Button, Tooltip, Spinner } from '@heroui/react'
import { Logger } from '@utils/logger.js'

/**
 * GenericTableActions - Componente para renderizar todas las acciones como botones directos
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.actions - Array de acciones disponibles
 * @param {Object} props.item - Item de la fila actual
 * @param {boolean} props.loading - Estado de carga global
 * @param {string} props.size - Tamaño de los botones ('sm', 'md', 'lg')
 * @param {string} props.variant - Variante de los botones
 * @param {string} props.orientation - Orientación ('horizontal', 'vertical')
 * @param {Function} props.onActionExecute - Callback cuando se ejecuta una acción
 * @param {string} props.tableId - ID de la tabla para logging
 *
 * Estructura de action:
 * {
 *   key: string,           // Identificador único
 *   label: string,         // Texto a mostrar
 *   icon: ReactComponent,  // Componente de icono
 *   color: string,         // Color del botón
 *   variant: string,       // Variante específica del botón
 *   tooltip: string,       // Texto del tooltip
 *   className: string,     // Clases CSS adicionales
 *   isVisible: (item) => boolean,     // Función para determinar visibilidad
 *   isDisabled: (item) => boolean,    // Función para determinar si está deshabilitado
 *   onClick: (item) => void,          // Función a ejecutar
 *   loadingKey: string,              // Key para tracking de loading individual
 * }
 */
const GenericTableActions = memo(
  ({
    actions = [],
    item = {},
    loading = false,
    size = 'sm',
    variant = 'flat',
    orientation = 'horizontal',
    onActionExecute,
    tableId = 'generic-table'
  }) => {
    const [actionLoadingStates, setActionLoadingStates] = useState({})

    // Filtrar acciones visibles
    const visibleActions = actions.filter(action => {
      if (typeof action.isVisible === 'function') {
        return action.isVisible(item)
      }
      return true
    })

    // Función para ejecutar una acción
    const executeAction = async action => {
      if (!action || typeof action.onClick !== 'function') {
        Logger.warn(`Table ${tableId}: Action missing onClick handler`, {
          actionKey: action?.key,
          tableId
        })
        return
      }

      // Verificar si la acción está deshabilitada
      if (typeof action.isDisabled === 'function' && action.isDisabled(item)) {
        Logger.info(`Table ${tableId}: Action ${action.key} is disabled for item`, {
          actionKey: action.key,
          itemId: item.id || 'unknown',
          tableId
        })
        return
      }

      try {
        // Marcar como cargando si tiene loadingKey
        if (action.loadingKey) {
          setActionLoadingStates(prev => ({
            ...prev,
            [action.loadingKey]: true
          }))
        }

        Logger.info(`Table ${tableId}: Executing action ${action.key}`, {
          actionKey: action.key,
          itemId: item.id || 'unknown',
          tableId
        })

        // Callback previo a la ejecución
        onActionExecute?.(action.key, item, 'start')

        // Ejecutar la acción
        await action.onClick(item)

        // Callback posterior a la ejecución
        onActionExecute?.(action.key, item, 'success')
      } catch (error) {
        Logger.error(`Table ${tableId}: Error executing action ${action.key}`, {
          error,
          actionKey: action.key,
          itemId: item.id || 'unknown',
          tableId
        })

        // Callback de error
        onActionExecute?.(action.key, item, 'error', error)
      } finally {
        // Quitar estado de carga
        if (action.loadingKey) {
          setActionLoadingStates(prev => ({
            ...prev,
            [action.loadingKey]: false
          }))
        }
      }
    }

    // Función para determinar si una acción está cargando
    const isActionLoading = action => {
      if (loading) return true
      if (action.loadingKey && actionLoadingStates[action.loadingKey]) return true
      return false
    }

    // Función para determinar si una acción está deshabilitada
    const isActionDisabled = action => {
      if (loading) return true
      if (isActionLoading(action)) return true
      if (typeof action.isDisabled === 'function') {
        return action.isDisabled(item)
      }
      return false
    }

    // Renderizar botón individual
    const renderActionButton = action => {
      const Icon = action.icon
      const isLoading = isActionLoading(action)
      const isDisabled = isActionDisabled(action)

      const button = (
        <Button
          key={action.key}
          size={size}
          variant={action.variant || variant}
          color={action.color || 'default'}
          isDisabled={isDisabled}
          isLoading={isLoading}
          className={action.className || ''}
          onPress={() => executeAction(action)}
          isIconOnly={!action.label}
          startContent={Icon && !isLoading ? <Icon className='w-4 h-4' /> : undefined}>
          {action.label && !isLoading ? action.label : null}
          {isLoading && <Spinner size='sm' color='current' />}
        </Button>
      )

      // Envolver en tooltip si se especifica
      if (action.tooltip) {
        return (
          <Tooltip color='default' key={action.key} content={action.tooltip}>
            {button}
          </Tooltip>
        )
      }

      return button
    }

    // Si no hay acciones visibles, no renderizar nada
    if (visibleActions.length === 0) return null

    // Determinar las clases de contenedor según orientación
    const containerClasses = orientation === 'vertical' ? 'flex flex-col items-center gap-1' : 'flex items-center justify-center gap-2'

    return (
      <div className={containerClasses}>
        {/* Renderizar todas las acciones como botones directos */}
        {visibleActions.map(action => renderActionButton(action))}
      </div>
    )
  }
)

GenericTableActions.displayName = 'GenericTableActions'

export default GenericTableActions
