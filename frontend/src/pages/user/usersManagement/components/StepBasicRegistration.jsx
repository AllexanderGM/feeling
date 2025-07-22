import { memo } from 'react'
import { Input, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { Mail, Lock, Shield } from 'lucide-react'

const StepBasicRegistration = ({ control, errors }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-200">Credenciales de Acceso</h2>
        <p className="text-gray-400">Datos básicos para crear la cuenta de usuario</p>
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
              description="Este será el correo con el que el usuario iniciará sesión"
            />
          )}
        />

        {/* Contraseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                type="password"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                startContent={<Lock className="text-gray-400 w-4 h-4" />}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Confirmar Contraseña"
                placeholder="Repite la contraseña"
                type="password"
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                startContent={<Lock className="text-gray-400 w-4 h-4" />}
              />
            )}
          />
        </div>

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

export default memo(StepBasicRegistration)