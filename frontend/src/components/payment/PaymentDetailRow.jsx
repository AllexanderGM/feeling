/**
 * Componente reutilizable para mostrar detalles de pago
 * Usado en páginas de estado de pago de eventos y matches
 */

/**
 * Fila de detalle de pago
 * @param {Object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {string|number} props.value - Valor a mostrar
 * @returns {JSX.Element|null} Componente o null si no hay valor
 */
export const PaymentDetailRow = ({ label, value }) => {
  if (!value) return null

  return (
    <div className='flex flex-col gap-1 rounded-lg border border-gray-700/50 bg-gray-900/40 p-3'>
      <span className='text-xs uppercase tracking-wide text-gray-400'>{label}</span>
      <span className='font-mono text-sm text-gray-100 break-all'>{value}</span>
    </div>
  )
}

export default PaymentDetailRow
