import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { Lock, Eye, Bookmark, AlertCircle } from 'lucide-react'

/**
 * Modal informativo para usuarios no aprobados
 * Explica las limitaciones temporales y acciones disponibles
 */
const UserNotApprovedModal = ({ isOpen, onOpenChange }) => {
  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-yellow-500/5',
        header: 'border-b border-gray-800',
        body: 'py-6',
        footer: 'border-t border-gray-800'
      }}
      isOpen={isOpen}
      placement='center'
      size='md'
      onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
              {/* Icono de alerta */}
              <div className='relative'>
                <div className='w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-3 border-yellow-500/30 shadow-lg shadow-yellow-500/20'>
                  <Lock className='w-10 h-10 text-yellow-400' />
                </div>
                <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                  <AlertCircle className='w-4 h-4 text-white' />
                </div>
              </div>
              {/* Título y subtítulo */}
              <div className='text-center'>
                <h3 className='text-xl font-bold text-white mb-1'>Cuenta en Revisión</h3>
                <p className='text-xs text-gray-400'>Tu perfil está siendo verificado</p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className='space-y-4'>
                {/* Mensaje principal */}
                <div className='text-center'>
                  <p className='text-gray-300 text-sm leading-relaxed'>
                    Tu cuenta aún no ha sido aprobada. <br />
                    Te notificaremos cuando puedas enviar matches y comprar intentos.
                  </p>
                </div>

                {/* Divider */}
                <div className='border-t border-gray-700/50' />

                {/* Acciones disponibles */}
                <div className='space-y-3'>
                  <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Mientras tanto, puedes:</p>

                  <div className='space-y-2'>
                    {/* Ver perfiles */}
                    <div className='flex items-start gap-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/30'>
                      <div className='w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <Eye className='w-4 h-4 text-primary-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-200'>Ver perfiles disponibles</p>
                        <p className='text-xs text-gray-400'>Explora usuarios compatibles</p>
                      </div>
                    </div>

                    {/* Guardar favoritos */}
                    <div className='flex items-start gap-3 bg-gray-800/40 rounded-lg p-3 border border-gray-700/30'>
                      <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                        <Bookmark className='w-4 h-4 text-blue-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-200'>Guardar favoritos</p>
                        <p className='text-xs text-gray-400'>Marca perfiles que te interesen</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mensaje de espera */}
                <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3'>
                  <p className='text-xs text-yellow-200/90 text-center'>
                    Estamos revisando tu perfil. Este proceso puede tomar hasta 24 horas.
                  </p>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className='justify-center gap-3 pb-6'>
              <Button
                className='bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold min-w-[140px]'
                radius='full'
                onPress={onClose}>
                Entendido
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default UserNotApprovedModal
