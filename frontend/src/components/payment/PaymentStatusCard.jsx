import { Card, CardBody } from '@heroui/react'

/**
 * Componente reutilizable para mostrar el estado principal del pago
 * Incluye icono, título, descripción y badge
 */

/**
 * Card principal de estado de pago
 * @param {Object} props
 * @param {Object} props.statusConfig - Configuración del estado
 * @param {React.Component} props.statusConfig.icon - Icono del estado
 * @param {string} props.statusConfig.iconClass - Clases CSS para el icono
 * @param {string} props.statusConfig.title - Título del estado
 * @param {string} props.message - Mensaje personalizado (opcional)
 * @param {string} props.description - Descripción por defecto del estado
 * @param {React.ReactNode} props.badge - Badge de estado a mostrar
 * @returns {JSX.Element} Card con estado
 */
export const PaymentStatusCard = ({ statusConfig, message, description, badge }) => {
  const StatusIcon = statusConfig.icon

  return (
    <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
      <CardBody className='flex flex-col items-center gap-4 text-center py-6'>
        {/* Icono - Estilo consistente */}
        <div className='w-16 h-16 rounded-full bg-black/30 p-4 border border-gray-700/60'>
          <StatusIcon className={`h-8 w-8 ${statusConfig.iconClass}`} />
        </div>

        {/* Título y descripción */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold text-gray-100'>{statusConfig.title}</h1>
          <p className='text-sm text-gray-400'>{message || description}</p>
        </div>

        {/* Badge */}
        {badge}
      </CardBody>
    </Card>
  )
}

export default PaymentStatusCard
