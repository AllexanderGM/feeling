import { useEffect, useMemo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
  Spinner
} from '@heroui/react'
import { Controller, useForm } from 'react-hook-form'
import { useLocation } from '@hooks'

const UserDataModal = ({ isOpen, onClose, onSubmit, isLoading = false, eventPrice = 0 }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      document: '',
      phoneCode: '+57',
      phone: ''
    }
  })

  const phoneCode = watch('phoneCode')
  const phone = watch('phone')

  // Use location hook for countries only (for phone code selection)
  const location = useLocation({
    loadAll: false,
    defaultCountry: 'Colombia'
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  // Get country data for phone code
  const phoneCountryData = useMemo(() => {
    if (!phoneCode) return { name: '', image: null }
    const found = location.countries.find(c => c.phone === phoneCode)

    return found ? { name: found.name, image: found.image } : { name: '', image: null }
  }, [phoneCode, location.countries])

  const handleFormSubmit = handleSubmit(async data => {
    const formattedData = {
      ...data,
      attendees: 1 // Valor fijo para reservas de invitados
    }

    await onSubmit(formattedData)
  })

  return (
    <Modal
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
      isOpen={isOpen}
      scrollBehavior='inside'
      size='2xl'
      onOpenChange={onClose}>
      <ModalContent>
        {onCloseModal => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <h2 className='text-xl font-bold text-gray-100'>Confirma tu asistencia</h2>
              <p className='text-sm text-gray-400 font-normal'>Necesitamos algunos datos para procesar tu reserva</p>
            </ModalHeader>

            <ModalBody className='relative'>
              {isLoading && (
                <div className='absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-gray-900/70 backdrop-blur-sm'>
                  <Spinner color='primary' size='lg' />
                </div>
              )}

              <form className='space-y-6' id='user-data-form' onSubmit={handleFormSubmit}>
                {/* Datos de Facturación */}
                <section className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-300'>Datos de Facturación</h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Controller
                      control={control}
                      name='name'
                      render={({ field }) => (
                        <Input
                          {...field}
                          isRequired
                          autoComplete='given-name'
                          errorMessage={errors.name?.message}
                          isInvalid={!!errors.name}
                          label='Nombre(s)'
                          placeholder='Tus nombre(s)'
                          variant='underlined'
                        />
                      )}
                      rules={{ required: 'El nombre es requerido' }}
                    />

                    <Controller
                      control={control}
                      name='lastName'
                      render={({ field }) => (
                        <Input
                          {...field}
                          isRequired
                          autoComplete='family-name'
                          errorMessage={errors.lastName?.message}
                          isInvalid={!!errors.lastName}
                          label='Apellidos'
                          placeholder='Tus apellidos'
                          variant='underlined'
                        />
                      )}
                      rules={{ required: 'El apellido es requerido' }}
                    />
                  </div>

                  <Controller
                    control={control}
                    name='document'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        autoComplete='off'
                        errorMessage={errors.document?.message}
                        isInvalid={!!errors.document}
                        label='Documento de identidad'
                        placeholder='Número de documento'
                        variant='underlined'
                      />
                    )}
                    rules={{ required: 'El documento es requerido' }}
                  />
                </section>

                {/* Contacto */}
                <section className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-300'>Contacto</h3>

                  <Controller
                    control={control}
                    name='email'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        autoComplete='email'
                        errorMessage={errors.email?.message}
                        isInvalid={!!errors.email}
                        label='Correo electrónico'
                        placeholder='tu@correo.com'
                        type='email'
                        variant='underlined'
                      />
                    )}
                    rules={{
                      required: 'El correo es requerido',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Correo inválido'
                      }
                    }}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Controller
                      control={control}
                      name='phoneCode'
                      render={({ field }) => (
                        <Autocomplete
                          isRequired
                          defaultItems={location.formattedCountries}
                          errorMessage={errors.phoneCode?.message}
                          inputProps={{
                            autoComplete: 'tel-country-code'
                          }}
                          isInvalid={!!errors.phoneCode}
                          label='Código de teléfono'
                          selectedKey={field.value}
                          startContent={
                            field.value &&
                            phoneCountryData.image && (
                              <img
                                alt={`Bandera de ${phoneCountryData.name}`}
                                className='w-5 h-5 rounded-full object-cover'
                                src={phoneCountryData.image}
                              />
                            )
                          }
                          variant='underlined'
                          onSelectionChange={field.onChange}>
                          {countryItem => (
                            <AutocompleteItem
                              key={countryItem.phone}
                              className={countryItem.priority && 'bg-blue-500/10'}
                              textValue={`${countryItem.phone} ${countryItem.name}`}>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>{countryItem.phone}</span>
                                <span className='text-gray-400 ml-1'>{countryItem.name}</span>
                              </div>
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                      )}
                      rules={{ required: 'El código de teléfono es requerido' }}
                    />

                    <Controller
                      control={control}
                      name='phone'
                      render={({ field }) => (
                        <Input
                          {...field}
                          isRequired
                          autoComplete='tel-national'
                          errorMessage={errors.phone?.message}
                          isInvalid={!!errors.phone}
                          label='Número de teléfono'
                          placeholder='123 456 789'
                          type='tel'
                          variant='underlined'
                          onChange={e => field.onChange(e.target.value.replace(/\D/g, ''))}
                        />
                      )}
                      rules={{ required: 'El teléfono es requerido' }}
                    />
                  </div>

                  {phoneCode && phone && (
                    <div className='bg-gray-700/20 px-3 py-2 rounded-lg inline-flex items-center gap-2'>
                      <span className='text-xs text-gray-400'>Número completo:</span>
                      <span className='text-xs text-gray-300 font-mono'>
                        {phoneCode} {phone}
                      </span>
                    </div>
                  )}
                </section>
              </form>
            </ModalBody>

            <ModalFooter>
              <Button
                variant='flat'
                onPress={() => {
                  if (!isLoading) {
                    onCloseModal()
                  }
                }}>
                Cancelar
              </Button>
              <Button color='primary' form='user-data-form' isLoading={isLoading} type='submit'>
                {eventPrice > 0 ? 'Continuar al pago' : 'Confirmar reserva'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default UserDataModal
