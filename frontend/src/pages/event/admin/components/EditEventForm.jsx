import { EVENT_STATUS_DISPLAY } from '@constants/tableConstants.js'

import EventFormModal from './EventFormModal.jsx'

const EditEventForm = ({ eventData, onSubmit, ...modalProps }) => {
  console.log('📝 EditEventForm - Received eventData:', {
    eventData,
    hasEventData: !!eventData,
    eventId: eventData?.id,
    title: eventData?.title,
    modalProps
  })

  const statusInfo = eventData?.status ? EVENT_STATUS_DISPLAY[eventData.status] || null : null

  const handleSubmit = payload => {
    console.log('🔵 EditEventForm - handleSubmit called:', {
      payload,
      eventId: eventData?.id,
      currentStatus: eventData?.status,
      hasOnSubmit: typeof onSubmit === 'function'
    })

    if (!eventData?.id || typeof onSubmit !== 'function') {
      console.log('❌ EditEventForm - Missing eventId or onSubmit function')

      return
    }

    const finalPayload = {
      ...payload,
      eventId: eventData.id,
      currentStatus: eventData.status
    }

    console.log('🟢 EditEventForm - Calling parent onSubmit with:', finalPayload)

    onSubmit(finalPayload)
  }

  console.log('📝 EditEventForm - Passing to EventFormModal:', {
    mode: 'edit',
    eventData,
    statusInfo,
    isOpen: modalProps.isOpen
  })

  return <EventFormModal eventData={eventData} mode='edit' statusInfo={statusInfo} {...modalProps} onSubmit={handleSubmit} />
}

export default EditEventForm
