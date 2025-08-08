import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@heroui/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ModalToLogin = ({ isRegisterSuccess, closeModal }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  useEffect(() => {
    if (isRegisterSuccess) {
      onOpen()
    }
  }, [isRegisterSuccess, onOpen])

  const handleGoToLogin = () => {
    closeModal()
    navigate('/login')
  }

  const handleClose = () => {
    closeModal()
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur' isDismissable={false} isKeyboardDismissDisabled={true}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center'>
                  <span className='material-symbols-outlined text-green-600 mr-1 mt-1 text-1xl'>check_circle</span>
                  <p>¡Registro Exitoso!</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <p>Tu cuenta ha sido creada correctamente. Para continuar, inicia sesión con tus datos</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color='danger'
                  variant='light'
                  onPress={() => {
                    handleClose()
                    onClose()
                  }}>
                  Cerrar
                </Button>
                <Button
                  color='primary'
                  onPress={() => {
                    handleGoToLogin()
                    onClose()
                  }}>
                  Ir a Iniciar Sesión
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default ModalToLogin
