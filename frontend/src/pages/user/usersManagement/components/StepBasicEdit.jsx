import { useState, memo } from 'react'
import { Input, Select, SelectItem, Button, Card, CardBody } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { Mail, Shield, KeyRound, Send } from 'lucide-react'
import { useError } from '@hooks/useError.js'

const StepBasicEdit = ({ control, errors, userData }) => {
  const { handleError, handleSuccess } = useError()
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false)

  const handleSendPasswordReset = async () => {
    if (!userData?.email) {
      handleError('Email del usuario no disponible')
      return
    }

    setSendingPasswordReset(true)
    try {
      // Aquí iría la lógica para enviar el correo de recuperación
      // Por ahora simulamos la acción
      await new Promise(resolve => setTimeout(resolve, 1500))
      handleSuccess(`Correo de recuperación enviado a ${userData.email}`)
    } catch (error) {
      handleError('Error al enviar el correo de recuperación')
    } finally {
      setSendingPasswordReset(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-200">Credenciales de Acceso</h2>
        <p className="text-gray-400">Configuración de acceso del usuario</p>
      </div>

      <div className="space-y-6">
        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              variant="underlined"
              isRequired
              label="Correo electrónico"
              placeholder="usuario@correo.com"
              type="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              startContent={<Mail className="text-gray-400 w-4 h-4" />}
              description="El correo con el que el usuario inicia sesión"
              isDisabled
            />
          )}
        />

        {/* Recuperación de contraseña */}
        <Card className="bg-gray-700/30 border border-gray-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-200">Contraseña</h3>
                  <p className="text-xs text-gray-400">
                    Envía un correo para que el usuario pueda restablecer su contraseña
                  </p>
                </div>
              </div>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                onPress={handleSendPasswordReset}
                isLoading={sendingPasswordReset}
                isDisabled={sendingPasswordReset}
                startContent={!sendingPasswordReset && <Send className="w-4 h-4" />}
              >
                {sendingPasswordReset ? 'Enviando...' : 'Enviar Correo'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Rol */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              variant="underlined"
              isRequired
              label="Rol del Usuario"
              placeholder="Selecciona un rol"
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0]
                field.onChange(selectedKey)
              }}
              isInvalid={!!errors.role}
              errorMessage={errors.role?.message}
              startContent={<Shield className="text-gray-400 w-4 h-4" />}
              description="Define los permisos y accesos del usuario"
            >
              <SelectItem key="CLIENT" value="CLIENT">Cliente</SelectItem>
              <SelectItem key="ADMIN" value="ADMIN">Administrador</SelectItem>
            </Select>
          )}
        />
      </div>
    </div>
  )
}

export default memo(StepBasicEdit)