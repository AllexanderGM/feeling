const Notifications = () => {
  return (
    <section className='max-w-4xl mx-auto p-6'>
      <header className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>Notificaciones</h1>
      </header>
      <article className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <p className='text-blue-800'>📱 Sistema de notificaciones por implementar</p>
        <p className='text-blue-600 text-sm mt-2'>Próximamente podrás ver todas tus notificaciones aquí:</p>
        <ul className='text-blue-600 text-sm mt-3 space-y-1'>
          <li>• Nuevos matches</li>
          <li>• Mensajes recibidos</li>
          <li>• Actualizaciones del sistema</li>
          <li>• Recordatorios de eventos</li>
        </ul>
      </article>
    </section>
  )
}

export default Notifications
