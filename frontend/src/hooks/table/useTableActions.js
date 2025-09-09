import {
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Mail,
  Download,
  Copy,
  Share2,
  Settings,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  RefreshCw,
  Archive,
  AlertTriangle,
  Shield,
  Star,
  StarOff,
  Heart,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  ExternalLink
} from 'lucide-react'

/**
 * Hook helper para crear acciones de tabla estándar
 * @returns {Object} - Objeto con funciones para crear acciones comunes
 */
export const useTableActions = () => {
  const viewAction = (options = {}) => ({
    key: 'view',
    label: '',
    icon: Eye,
    tooltip: 'Ver detalles',
    className: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20',
    ...options
  })

  const editAction = (options = {}) => ({
    key: 'edit',
    label: '',
    icon: Edit,
    tooltip: 'Editar elemento',
    className: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20',
    ...options
  })

  const deleteAction = (options = {}) => ({
    key: 'delete',
    label: '',
    icon: Trash2,
    tooltip: 'Eliminar elemento',
    className: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    ...options
  })

  const approveAction = (options = {}) => ({
    key: 'approve',
    label: '',
    icon: Check,
    tooltip: 'Aprobar elemento',
    className: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20',
    ...options
  })

  const rejectAction = (options = {}) => ({
    key: 'reject',
    label: '',
    icon: X,
    tooltip: 'Rechazar elemento',
    className: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE COMUNICACIÓN
  // ========================================

  const emailAction = (options = {}) => ({
    key: 'email',
    label: '',
    icon: Mail,
    tooltip: 'Enviar correo electrónico',
    className: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20',
    ...options
  })

  const messageAction = (options = {}) => ({
    key: 'message',
    label: '',
    icon: MessageSquare,
    tooltip: 'Enviar mensaje directo',
    className: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20',
    ...options
  })

  const callAction = (options = {}) => ({
    key: 'call',
    label: '',
    icon: Phone,
    tooltip: 'Realizar llamada telefónica',
    className: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE NAVEGACIÓN Y ENLACES
  // ========================================

  const navigateAction = (options = {}) => ({
    key: 'navigate',
    label: '',
    icon: options.icon || ExternalLink,
    tooltip: options.tooltip || 'Navegar a ubicación',
    className: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20',
    ...options
  })

  const mapAction = (options = {}) => ({
    key: 'map',
    label: '',
    icon: MapPin,
    tooltip: 'Ver en mapa',
    className: 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE GESTIÓN DE ARCHIVOS
  // ========================================

  const downloadAction = (options = {}) => ({
    key: 'download',
    label: '',
    icon: Download,
    tooltip: 'Descargar archivo',
    className: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20',
    ...options
  })

  const copyAction = (options = {}) => ({
    key: 'copy',
    label: '',
    icon: Copy,
    tooltip: 'Copiar al portapapeles',
    className: 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border border-slate-500/20',
    ...options
  })

  const shareAction = (options = {}) => ({
    key: 'share',
    label: '',
    icon: Share2,
    tooltip: 'Compartir elemento',
    className: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE ESTADO Y CONTROL
  // ========================================

  const activateAction = (options = {}) => ({
    key: 'activate',
    label: '',
    icon: UserPlus,
    tooltip: 'Activar elemento',
    className: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20',
    ...options
  })

  const deactivateAction = (options = {}) => ({
    key: 'deactivate',
    label: '',
    icon: UserMinus,
    tooltip: 'Desactivar elemento',
    className: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
    ...options
  })

  const lockAction = (options = {}) => ({
    key: 'lock',
    label: '',
    icon: Lock,
    tooltip: 'Bloquear acceso',
    className: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    ...options
  })

  const unlockAction = (options = {}) => ({
    key: 'unlock',
    label: '',
    icon: Unlock,
    tooltip: 'Desbloquear acceso',
    className: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE ORGANIZACIÓN
  // ========================================

  const archiveAction = (options = {}) => ({
    key: 'archive',
    label: '',
    icon: Archive,
    tooltip: 'Mover a archivo',
    className: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20',
    ...options
  })

  const unarchiveAction = (options = {}) => ({
    key: 'unarchive',
    label: '',
    icon: RefreshCw,
    tooltip: 'Restaurar de archivo',
    className: 'bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/20',
    ...options
  })

  const favoriteAction = (options = {}) => ({
    key: 'favorite',
    label: '',
    icon: Star,
    tooltip: 'Marcar como favorito',
    className: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
    ...options
  })

  const unfavoriteAction = (options = {}) => ({
    key: 'unfavorite',
    label: '',
    icon: StarOff,
    tooltip: 'Quitar de favoritos',
    className: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE CONFIGURACIÓN Y ADMINISTRACIÓN
  // ========================================

  const settingsAction = (options = {}) => ({
    key: 'settings',
    label: '',
    icon: Settings,
    tooltip: 'Abrir configuración',
    className: 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20',
    ...options
  })

  const refreshAction = (options = {}) => ({
    key: 'refresh',
    label: '',
    icon: RefreshCw,
    tooltip: 'Actualizar datos',
    className: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE MODERACIÓN Y SEGURIDAD
  // ========================================

  const reportAction = (options = {}) => ({
    key: 'report',
    label: '',
    icon: AlertTriangle,
    tooltip: 'Reportar contenido',
    className: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20',
    ...options
  })

  const blockAction = (options = {}) => ({
    key: 'block',
    label: '',
    icon: Shield,
    tooltip: 'Bloquear usuario',
    className: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    ...options
  })

  const unblockAction = (options = {}) => ({
    key: 'unblock',
    label: '',
    icon: Shield,
    tooltip: 'Desbloquear usuario',
    className: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20',
    ...options
  })

  // ========================================
  // ACCIONES DE PROGRAMACIÓN Y CALENDARIO
  // ========================================

  const scheduleAction = (options = {}) => ({
    key: 'schedule',
    label: '',
    icon: Calendar,
    tooltip: 'Programar evento',
    className: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20',
    ...options
  })

  // ========================================
  // ACCIONES ESPECIALES
  // ========================================

  const likeAction = (options = {}) => ({
    key: 'like',
    label: '',
    icon: Heart,
    tooltip: 'Marcar como me gusta',
    className: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20',
    ...options
  })

  // ========================================
  // FUNCIONES HELPER PARA COMBINACIONES COMUNES
  // ========================================

  /**
   * Crear un conjunto de acciones básicas para gestión de usuarios
   */
  const userManagementActions = (overrides = {}) =>
    [
      viewAction(overrides.view),
      editAction(overrides.edit),
      emailAction(overrides.email),
      deactivateAction(overrides.deactivate),
      deleteAction(overrides.delete)
    ].filter(Boolean)

  /**
   * Crear acciones para elementos con estados de aprobación
   */
  const approvalActions = (overrides = {}) =>
    [viewAction(overrides.view), approveAction(overrides.approve), rejectAction(overrides.reject), deleteAction(overrides.delete)].filter(
      Boolean
    )

  /**
   * Crear acciones para contenido archivable
   */
  const archiveActions = (overrides = {}) =>
    [viewAction(overrides.view), editAction(overrides.edit), archiveAction(overrides.archive), deleteAction(overrides.delete)].filter(
      Boolean
    )

  /**
   * Crear acciones para moderación de contenido
   */
  const moderationActions = (overrides = {}) =>
    [
      viewAction(overrides.view),
      editAction(overrides.edit),
      reportAction(overrides.report),
      blockAction(overrides.block),
      deleteAction(overrides.delete)
    ].filter(Boolean)

  return {
    // Acciones básicas
    viewAction,
    editAction,
    deleteAction,
    approveAction,
    rejectAction,

    // Comunicación
    emailAction,
    messageAction,
    callAction,

    // Navegación
    navigateAction,
    mapAction,

    // Archivos
    downloadAction,
    copyAction,
    shareAction,

    // Estado y control
    activateAction,
    deactivateAction,
    lockAction,
    unlockAction,

    // Organización
    archiveAction,
    unarchiveAction,
    favoriteAction,
    unfavoriteAction,

    // Configuración
    settingsAction,
    refreshAction,

    // Moderación
    reportAction,
    blockAction,
    unblockAction,

    // Programación
    scheduleAction,

    // Especiales
    likeAction,

    // Helpers para conjuntos comunes
    userManagementActions,
    approvalActions,
    archiveActions,
    moderationActions
  }
}

export default useTableActions
