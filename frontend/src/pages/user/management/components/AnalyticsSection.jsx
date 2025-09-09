import { memo } from 'react'
import { useError } from '@hooks'

// Importar el componente de analíticas existente
import UserAnalyticsSection from './UserAnalyticsSection.jsx'

const AnalyticsSection = memo(() => {
  const { handleError, handleSuccess } = useError()

  return (
    <div className='py-4'>
      <UserAnalyticsSection onError={handleError} onSuccess={handleSuccess} />
    </div>
  )
})

AnalyticsSection.displayName = 'AnalyticsSection'

export default AnalyticsSection
