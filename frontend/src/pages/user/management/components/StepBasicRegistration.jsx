import { memo } from 'react'
import { Input, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { Mail, Lock, Shield } from 'lucide-react'

const StepBasicRegistration = ({ control, errors }) => {
  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-xl font-semibold text-gray-200'>Credenciales de Acceso</h2>
        <p className='text-gray-400'>Datos básicos para crear la cuenta de usuario</p>
      </div>

      <div className='space-y-6'>
        {/* Email */}
        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              description='Este será el correo con el que el usuario iniciará sesión'
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
              label='Correo electrónico'
              placeholder='usuario@correo.com'
              startContent={<Mail className='text-gray-400 w-4 h-4' />}
              type='email'
              variant='underlined'
            />
          )}
        />

        {/* Contraseñas */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Controller
            control={control}
            name='password'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                errorMessage={errors.password?.message}
                isInvalid={!!errors.password}
                label='Contraseña'
                placeholder='Mínimo 6 caracteres'
                startContent={<Lock className='text-gray-400 w-4 h-4' />}
                type='password'
                variant='underlined'
              />
            )}
          />

          <Controller
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                errorMessage={errors.confirmPassword?.message}
                isInvalid={!!errors.confirmPassword}
                label='Confirmar Contraseña'
                placeholder='Repite la contraseña'
                startContent={<Lock className='text-gray-400 w-4 h-4' />}
                type='password'
                variant='underlined'
              />
            )}
          />
        </div>

        {/* Rol */}
        <Controller
          control={control}
          name='role'
          render={({ field }) => (
            <Select
              {...field}
              isRequired
              description='Define los permisos y accesos del usuario'
              errorMessage={errors.role?.message}
              isInvalid={!!errors.role}
              label='Rol del Usuario'
              placeholder='Selecciona un rol'
              selectedKeys={field.value ? [field.value] : []}
              startContent={<Shield className='text-gray-400 w-4 h-4' />}
              variant='underlined'
              onSelectionChange={keys => {
                const selectedKey = Array.from(keys)[0]

                field.onChange(selectedKey)
              }}>
              <SelectItem key='CLIENT' value='CLIENT'>
                Cliente
              </SelectItem>
              <SelectItem key='ADMIN' value='ADMIN'>
                Administrador
              </SelectItem>
            </Select>
          )}
        />
      </div>
    </div>
  )
}

export default memo(StepBasicRegistration)
