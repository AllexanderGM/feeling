import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody } from '@heroui/react'
import { AlertTriangle, Package, DollarSign, Hash } from 'lucide-react'

const DeletePlanModal = ({ isOpen, onClose, onConfirm, loading, plan }) => {
  if (!plan) return null

  const hasActivity = plan.totalPurchases > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement='center'
      size='lg'
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center'>
              <AlertTriangle className='w-5 h-5 text-red-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-red-400'>Eliminar Plan de Match</h2>
              <p className='text-sm text-gray-400 font-normal'>Esta acción no se puede deshacer</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-6'>
          {/* Plan info */}
          <Card className='bg-gray-700/30 border-gray-600/50'>
            <CardBody>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Package className='w-6 h-6 text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-100'>{plan.name}</h3>
                  <p className='text-sm text-gray-400 mt-1'>{plan.description}</p>
                  <div className='flex items-center gap-4 mt-3'>
                    <div className='flex items-center gap-2'>
                      <Hash className='w-4 h-4 text-blue-400' />
                      <span className='text-sm text-blue-400'>
                        {plan.attempts} {plan.attempts === 1 ? 'intento' : 'intentos'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='w-4 h-4 text-green-400' />
                      <span className='text-sm text-green-400'>${plan.price.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Warning message */}
          <div className='space-y-4'>
            <div className='flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg'>
              <AlertTriangle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium text-red-400'>¿Estás seguro?</p>
                <p className='text-sm text-red-300 mt-1'>Al eliminar este plan de match:</p>
                <ul className='text-sm text-red-200 mt-2 space-y-1 ml-4 list-disc'>
                  <li>Los usuarios ya no podrán comprarlo</li>
                  <li>Se removerá de la lista de planes disponibles</li>
                  <li>Los datos estadísticos se perderán permanentemente</li>
                </ul>
              </div>
            </div>

            {hasActivity && (
              <div className='flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg'>
                <AlertTriangle className='w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='font-medium text-yellow-400'>Plan con actividad</p>
                  <p className='text-sm text-yellow-300 mt-1'>
                    Este plan ha generado <strong>{plan.totalPurchases} compras</strong> y <strong>${plan.revenue.toFixed(2)} USD</strong>{' '}
                    en ingresos.
                  </p>
                  <p className='text-sm text-yellow-200 mt-2'>Considera desactivarlo en lugar de eliminarlo para conservar el historial.</p>
                </div>
              </div>
            )}
          </div>

          <p className='text-center text-gray-400 text-sm'>
            Escribe <strong className='text-red-400'>ELIMINAR</strong> para confirmar
          </p>
        </ModalBody>

        <ModalFooter>
          <Button variant='bordered' onPress={onClose} className='border-gray-600 text-gray-300' disabled={loading}>
            Cancelar
          </Button>
          <Button color='danger' onPress={onConfirm} isLoading={loading} startContent={!loading && <AlertTriangle className='w-4 h-4' />}>
            Eliminar Plan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeletePlanModal
