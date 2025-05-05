import { useState, useEffect } from 'react'
import { Button, Alert, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import useError from '@hooks/useError'

const ErrorDisplay = () => {
  const { error, isModalOpen, alertType, alerts, closeErrorModal, closeAlert } = useError()

  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isModalOpen && alertType === 'modal' && !isOpen) {
      onOpen()
    }
    if (!isModalOpen && isOpen) {
      onOpenChange(false)
    }
  }, [isModalOpen, alertType, isOpen, onOpen, onOpenChange])

  const handleClose = () => {
    closeErrorModal()
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <>
      {alerts.length > 0 && (
        <div className="flex flex-col gap-4 fixed right-0 p-4 z-50 top-0 sm:bottom-0 sm:top-auto max-w-md">
          {alerts.map(alert => (
            <Alert
              key={alert.id}
              color="danger"
              description={alert.message}
              isVisible={true}
              title={alert.title}
              variant="faded"
              onClose={() => closeAlert(alert.id)}
              className="transform transition-all duration-300 ease-in-out"
            />
          ))}
        </div>
      )}

      {isModalOpen && alertType === 'modal' && error && (
        <Modal backdrop="blur" isOpen={isOpen} onClose={handleClose} placement="center">
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className="flex flex-col gap-1">{error.title || 'Error'}</ModalHeader>
                <ModalBody>
                  <p className="mb-4">{error.message}</p>

                  {error.details && (
                    <>
                      <Button color="primary" variant="light" size="sm" className="mb-2" onClick={toggleDetails}>
                        {showDetails ? 'Ocultar detalles técnicos' : 'Mostrar detalles técnicos'}
                      </Button>

                      {showDetails && (
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                          {typeof error.details === 'object' ? JSON.stringify(error.details, null, 2) : error.details}
                        </pre>
                      )}
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      onClose()
                      closeErrorModal()
                    }}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default ErrorDisplay
