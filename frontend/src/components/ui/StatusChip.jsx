import { Chip } from '@heroui/react'

const StatusChip = ({
  status,
  icon: Icon,
  trueText,
  falseText,
  trueColor = 'success',
  falseColor = 'warning',
  size = 'sm',
  variant = 'flat',
  className = ''
}) => {
  const isPositive = Boolean(status)

  const colorClasses = {
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    primary: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
    default: 'bg-gray-500/20 text-gray-300'
  }

  const chipColor = isPositive ? trueColor : falseColor
  const chipText = isPositive ? trueText : falseText
  const chipClasses = colorClasses[chipColor] || colorClasses.default

  return (
    <Chip
      size={size}
      color={chipColor}
      variant={variant}
      startContent={Icon && <Icon className='w-3 h-3' />}
      className={`${chipClasses} ${className}`}>
      {chipText}
    </Chip>
  )
}

export default StatusChip
