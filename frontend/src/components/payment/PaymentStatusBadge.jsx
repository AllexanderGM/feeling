import { CalendarDays } from 'lucide-react'

/**
 * Componente reutilizable para mostrar el estado de pago con badge
 * Usado en páginas de estado de pago de eventos y matches
 */

/**
 * Badge de estado de pago
 * @param {Object} props
 * @param {string} props.status - Estado del pago (APPROVED, PENDING, DECLINED, etc.)
 * @param {Object} props.config - Configuración visual del estado
 * @param {string} props.config.badgeClass - Clases CSS para el badge
 * @param {React.Component} [props.icon] - Icono opcional (por defecto CalendarDays)
 * @returns {JSX.Element} Badge con estado
 */
export const PaymentStatusBadge = ({ status, config, icon: Icon = CalendarDays }) => {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
      <Icon className='h-4 w-4' />
      Estado reportado: {status}
    </span>
  )
}

export default PaymentStatusBadge
