import StatusChip from './StatusChip.jsx'

const PrivacyRow = ({ icon: Icon, label, value, showIndicator = false, indicatorText = '*' }) => {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        {Icon && <Icon className='w-3 h-3 text-gray-400' />}
        <span className='text-gray-400'>{label}:</span>
      </div>
      <div className='flex items-center gap-2'>
        <StatusChip status={value} trueText='Sí' falseText='No' trueColor='success' falseColor='default' />
        {showIndicator && value && <span className='text-orange-300 text-xs'>{indicatorText}</span>}
      </div>
    </div>
  )
}

export default PrivacyRow
