/**
 * Adaptador para integración con Wompi (pasarela de pagos)
 * Maneja la extracción y normalización de datos de Wompi
 */
export class WompiAdapter {
  /**
   * Extrae el ID de transacción de los query params de la URL
   * Busca en múltiples nombres de parámetros comunes
   * @param {URLSearchParams} searchParams - Parámetros de la URL
   * @returns {string|null} ID de transacción o null
   */
  static extractTransactionId(searchParams) {
    return searchParams.get('id') || searchParams.get('transactionId') || searchParams.get('transaction_id') || null
  }

  /**
   * Extrae la referencia de pago de los query params
   * @param {URLSearchParams} searchParams - Parámetros de la URL
   * @returns {string|null} Referencia de pago o null
   */
  static extractReference(searchParams) {
    return searchParams.get('reference') || searchParams.get('ref') || searchParams.get('paymentReference') || null
  }

  /**
   * Extrae el estado del pago de los query params
   * @param {URLSearchParams} searchParams - Parámetros de la URL
   * @returns {string|null} Estado del pago o null
   */
  static extractStatus(searchParams) {
    return searchParams.get('status') || searchParams.get('statusCode') || null
  }

  /**
   * Extrae el ambiente (environment) de los query params
   * @param {URLSearchParams} searchParams - Parámetros de la URL
   * @returns {string|null} Ambiente (test/production) o null
   */
  static extractEnvironment(searchParams) {
    return searchParams.get('env') || searchParams.get('environment') || null
  }

  /**
   * Extrae todos los parámetros relevantes de la URL de redirección de Wompi
   * @param {URLSearchParams} searchParams - Parámetros de la URL
   * @returns {Object} Objeto con todos los parámetros extraídos
   */
  static extractAllParams(searchParams) {
    return {
      transactionId: this.extractTransactionId(searchParams),
      reference: this.extractReference(searchParams),
      status: this.extractStatus(searchParams),
      environment: this.extractEnvironment(searchParams)
    }
  }

  /**
   * Formatea la respuesta del webhook de Wompi
   * @param {Object} webhookPayload - Payload del webhook
   * @returns {Object} Datos formateados
   */
  static formatWebhookPayload(webhookPayload) {
    if (!webhookPayload) return null

    return {
      transactionId: webhookPayload.data?.id || webhookPayload.transaction?.id || null,
      status: webhookPayload.data?.status || webhookPayload.transaction?.status || null,
      reference: webhookPayload.data?.reference || webhookPayload.transaction?.reference || null,
      amount: webhookPayload.data?.amount_in_cents || webhookPayload.transaction?.amount_in_cents || null,
      currency: webhookPayload.data?.currency || webhookPayload.transaction?.currency || 'COP',
      paymentMethod: webhookPayload.data?.payment_method_type || webhookPayload.transaction?.payment_method_type || null,
      timestamp: webhookPayload.sent_at || webhookPayload.timestamp || new Date().toISOString()
    }
  }

  /**
   * Valida que una transacción tenga los datos mínimos necesarios
   * @param {Object} transaction - Datos de la transacción
   * @returns {boolean} true si la transacción es válida
   */
  static isValidTransaction(transaction) {
    if (!transaction) return false

    return Boolean(transaction.transactionId || transaction.id) && Boolean(transaction.status)
  }

  /**
   * Obtiene la URL de checkout de Wompi
   * @param {string} checkoutId - ID del checkout
   * @param {string} environment - Ambiente (test/production)
   * @returns {string} URL del checkout
   */
  static getCheckoutUrl(checkoutId, environment = 'production') {
    const baseUrl = environment === 'production' ? 'https://checkout.wompi.co/p' : 'https://checkout.wompi.co/p'

    return `${baseUrl}/${checkoutId}`
  }

  /**
   * Mapea los códigos de error de Wompi a mensajes amigables
   * @param {string} errorCode - Código de error de Wompi
   * @returns {string} Mensaje amigable
   */
  static getErrorMessage(errorCode) {
    const errorMessages = {
      INSUFFICIENT_FUNDS: 'Fondos insuficientes en la tarjeta',
      INVALID_CARD: 'Tarjeta inválida o no aceptada',
      EXPIRED_CARD: 'Tarjeta expirada',
      DECLINED: 'Transacción rechazada por el banco',
      FRAUD_SUSPECTED: 'Transacción sospechosa de fraude',
      INVALID_CVV: 'Código CVV inválido',
      INVALID_AMOUNT: 'Monto inválido',
      TRANSACTION_NOT_FOUND: 'Transacción no encontrada',
      DUPLICATE_TRANSACTION: 'Transacción duplicada',
      UNKNOWN_ERROR: 'Error desconocido'
    }

    return errorMessages[errorCode] || 'Error en el procesamiento del pago'
  }
}

export default WompiAdapter
