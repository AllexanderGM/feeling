import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

/**
 * Servicio base para manejo de pagos
 * Proporciona utilidades compartidas para pagos de eventos y matches
 */
export class PaymentService {
  /**
   * Configuración de estados de pago
   * Mapea estados de Wompi a configuración visual y mensajes
   */
  static STATUS_CONFIG = {
    APPROVED: {
      title: '¡Pago confirmado!',
      description: 'Tu pago fue procesado exitosamente.',
      icon: CheckCircle,
      iconClass: 'text-green-400',
      badgeClass: 'bg-green-500/15 border border-green-500/30 text-green-200'
    },
    PENDING: {
      title: 'Pago en revisión',
      description: 'El pago continúa procesándose. Te avisaremos cuando se confirme el resultado.',
      icon: Clock,
      iconClass: 'text-yellow-300',
      badgeClass: 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-200'
    },
    DECLINED: {
      title: 'El pago fue rechazado',
      description: 'Tu método de pago no fue aceptado. Puedes intentar nuevamente con otro medio.',
      icon: XCircle,
      iconClass: 'text-red-400',
      badgeClass: 'bg-red-500/15 border border-red-500/30 text-red-200'
    },
    ERROR: {
      title: 'No pudimos verificar el pago',
      description: 'Ocurrió un inconveniente consultando la transacción. Intenta nuevamente en unos segundos.',
      icon: AlertTriangle,
      iconClass: 'text-orange-400',
      badgeClass: 'bg-orange-500/15 border border-orange-500/30 text-orange-200'
    },
    VOIDED: {
      title: 'Pago anulado',
      description: 'La transacción fue anulada.',
      icon: XCircle,
      iconClass: 'text-gray-400',
      badgeClass: 'bg-gray-500/15 border border-gray-500/30 text-gray-200'
    },
    UNKNOWN: {
      title: 'Estado desconocido',
      description: 'No recibimos información suficiente. Puedes volver a intentar el pago si es necesario.',
      icon: AlertTriangle,
      iconClass: 'text-gray-300',
      badgeClass: 'bg-gray-500/10 border border-gray-500/30 text-gray-300'
    }
  }

  /**
   * Normaliza el estado de pago a un valor conocido
   * @param {string} status - Estado del pago
   * @returns {string} Estado normalizado
   */
  static normalizeStatus(status) {
    if (!status) return 'UNKNOWN'
    const normalized = status.toString().trim().toUpperCase()

    const aliasMap = {
      SUCCESS: 'APPROVED',
      SUCCEEDED: 'APPROVED',
      COMPLETED: 'APPROVED',
      APPROVED: 'APPROVED',
      PENDING: 'PENDING',
      IN_PROGRESS: 'PENDING',
      WAITING: 'PENDING',
      DECLINED: 'DECLINED',
      REJECTED: 'DECLINED',
      FAILED: 'DECLINED',
      ERROR: 'ERROR',
      VOIDED: 'VOIDED',
      CANCELLED: 'VOIDED',
      CANCELED: 'VOIDED'
    }

    const mapped = aliasMap[normalized] || normalized

    return this.STATUS_CONFIG[mapped] ? mapped : 'UNKNOWN'
  }

  /**
   * Obtiene la configuración visual para un estado
   * @param {string} status - Estado del pago
   * @returns {Object} Configuración del estado
   */
  static getStatusConfig(status) {
    const normalizedStatus = this.normalizeStatus(status)

    return this.STATUS_CONFIG[normalizedStatus] || this.STATUS_CONFIG.UNKNOWN
  }

  /**
   * Verifica si un estado es exitoso
   * @param {string} status - Estado del pago
   * @returns {boolean} true si el pago fue aprobado
   */
  static isSuccessStatus(status) {
    return this.normalizeStatus(status) === 'APPROVED'
  }

  /**
   * Verifica si un estado es de error/rechazo
   * @param {string} status - Estado del pago
   * @returns {boolean} true si el pago fue rechazado o tiene error
   */
  static isFailureStatus(status) {
    const normalized = this.normalizeStatus(status)

    return ['DECLINED', 'ERROR', 'VOIDED'].includes(normalized)
  }

  /**
   * Verifica si un estado es pendiente
   * @param {string} status - Estado del pago
   * @returns {boolean} true si el pago está pendiente
   */
  static isPendingStatus(status) {
    return this.normalizeStatus(status) === 'PENDING'
  }

  /**
   * Formatea un monto en pesos colombianos
   * @param {number} amount - Monto a formatear
   * @returns {string} Monto formateado
   */
  static formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A'

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Formatea una fecha de transacción
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  static formatTransactionDate(date) {
    if (!date) return 'N/A'

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date

      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch {
      return 'Fecha inválida'
    }
  }

  /**
   * Extrae el tipo de entidad de una referencia de pago
   * @param {string} reference - Referencia de pago
   * @returns {'event'|'match'|'unknown'} Tipo de entidad
   */
  static extractEntityTypeFromReference(reference) {
    if (!reference || typeof reference !== 'string') return 'unknown'

    // Formato esperado: {type}-{id}-{timestamp}
    const parts = reference.split('-')

    if (parts.length < 3) return 'unknown'

    const [type] = parts

    if (type === 'EVENT' || type === 'event') return 'event'
    if (type === 'MATCH' || type === 'match') return 'match'

    return 'unknown'
  }

  /**
   * Extrae el ID de la entidad de una referencia de pago
   * @param {string} reference - Referencia de pago
   * @returns {number|null} ID de la entidad o null
   */
  static extractEntityIdFromReference(reference) {
    if (!reference || typeof reference !== 'string') return null

    const parts = reference.split('-')

    if (parts.length < 3) return null

    const [, rawId] = parts
    const parsedId = Number(rawId)

    return Number.isFinite(parsedId) ? parsedId : null
  }
}

export default PaymentService
