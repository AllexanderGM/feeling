import { useState, useMemo } from 'react'
import { Button, Spinner, Chip, Slider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import {
  Edit2,
  Check,
  X,
  Target,
  Heart,
  MapPin,
  Calendar,
  Church,
  Building,
  Settings,
  Users,
  Search,
  Filter,
  Sparkles,
  Flame,
  MessageCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useUser, useUserAttributes, useUserInterests } from '@hooks'
import { stepPreferencesSchema, getDefaultValuesForStep } from '@schemas'
import { Logger } from '@utils/logger.js'

import StepPreferences from '@pages/user/complete/components/StepPreferences.jsx'
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'

const PreferencesSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()

  const { updateUserProfile } = useUser()
  const userAttributes = useUserAttributes()
  const { interestOptions, loading: interestLoading, error: interestError } = useUserInterests()

  // Valores por defecto usando esquema centralizado
  const defaultValues = useMemo(() => getDefaultValuesForStep(3, user), [user])

  // React Hook Form para StepPreferences
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(stepPreferencesSchema),
    defaultValues,
    mode: 'onChange'
  })

  const handleEdit = () => {
    reset(defaultValues)
    onEditOpen()
  }

  const handleCancel = () => {
    reset(defaultValues)
    onEditOpenChange()
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const formData = getValues()
      await updateUserProfile(formData)
      onEditOpenChange()
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'update_preferences', 'Error updating user preferences', { error })
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el nombre de un atributo por ID
  const getAttributeName = (attributeType, attributeId) => {
    if (!attributeId || !userAttributes[attributeType]) return 'No especificado'
    const attribute = userAttributes[attributeType].find(attr => attr.id === parseInt(attributeId))
    return attribute?.name || 'No especificado'
  }

  // Obtener categoría de interés con detalles
  const getInterestDetails = interestKey => {
    if (!interestKey || !interestOptions) return null
    return interestOptions.find(interest => interest.key === interestKey)
  }

  // Función para obtener el icono según la categoría
  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-3 h-3 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-3 h-3 text-red-400' />
      case 'SPIRIT':
        return <MessageCircle className='w-3 h-3 text-purple-400' />
      default:
        return <Heart className='w-3 h-3 text-gray-400' />
    }
  }

  // Función para verificar si el usuario tiene campos específicos de SPIRIT
  const hasSpiritFields = () => {
    return (
      user?.profile?.religionId ||
      user?.religionId ||
      user?.profile?.church ||
      user?.church ||
      user?.profile?.spiritualMoments ||
      user?.spiritualMoments ||
      user?.profile?.spiritualPractices ||
      user?.spiritualPractices
    )
  }

  // Función para verificar si el usuario tiene campos específicos de ROUSE
  const hasRoueFields = () => {
    return user?.profile?.sexualRoleId || user?.sexualRoleId || user?.profile?.relationshipTypeId || user?.relationshipTypeId
  }

  // Props para StepPreferences
  const stepPreferencesProps = {
    control,
    errors,
    watch,
    setValue,
    clearErrors,
    categoryOptions: interestOptions || [],
    categoriesLoading: interestLoading,
    categoriesError: interestError,
    religionOptions: userAttributes.religionOptions || [],
    sexualRoleOptions: userAttributes.sexualRoleOptions || [],
    relationshipTypeOptions: userAttributes.relationshipTypeOptions || [],
    attributesLoading: false
  }

  // Vista de solo lectura
  return (
    <div className='space-y-6 w-full'>
      {/* Preferencias con diseño similar al estado general */}
      <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Target className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Preferencias</span>
          </div>
          <Button
            size='sm'
            variant='solid'
            color='primary'
            className='bg-primary-600 hover:bg-primary-700'
            startContent={<Settings className='w-3 h-3' />}
            onPress={handleEdit}>
            Editar
          </Button>
        </div>

        {/* Categoría de interés */}
        <div className='mb-4 pb-4 border-b border-gray-700/30'>
          <div className='flex items-center gap-2'>
            {getCategoryIcon(user?.profile?.categoryInterest || user?.categoryInterest)}
            <span className='text-xs text-gray-400'>Categoría de interés: </span>
            <span className='text-xs text-gray-300 font-medium'>
              {getInterestDetails(user?.profile?.categoryInterest || user?.categoryInterest)?.label || 'No especificado'}
            </span>
          </div>
        </div>

        {/* Campos específicos para SPIRIT */}
        {(user?.profile?.categoryInterest || user?.categoryInterest) === 'SPIRIT' && hasSpiritFields() && (
          <div className='mb-4 pb-4 border-b border-gray-700/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Church className='w-3 h-3 text-purple-400' />
              <span className='text-xs font-medium text-gray-200'>Información espiritual</span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
              {/* Religión */}
              {(user?.profile?.religionId || user?.religionId) && (
                <div className='flex items-center gap-2'>
                  <Church className='w-3 h-3' />
                  <span>
                    Religión:{' '}
                    <span className='text-gray-300'>
                      {getAttributeName('religionOptions', user?.profile?.religionId || user?.religionId)}
                    </span>
                  </span>
                </div>
              )}

              {/* Iglesia */}
              {(user?.profile?.church || user?.church) && (
                <div className='flex items-center gap-2'>
                  <Building className='w-3 h-3' />
                  <span>
                    Iglesia: <span className='text-gray-300'>{user?.profile?.church || user?.church}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Momentos espirituales */}
            {(user?.profile?.spiritualMoments || user?.spiritualMoments) && (
              <div className='mt-3'>
                <div className='flex items-start gap-2'>
                  <Sparkles className='w-3 h-3 mt-0.5' />
                  <div className='w-full'>
                    <span className='text-xs text-gray-400'>Momentos espirituales: </span>
                    <p className='text-xs text-gray-300 leading-relaxed mt-1'>
                      {user?.profile?.spiritualMoments || user?.spiritualMoments}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prácticas espirituales */}
            {(user?.profile?.spiritualPractices || user?.spiritualPractices) && (
              <div className='mt-3'>
                <div className='flex items-start gap-2'>
                  <MessageCircle className='w-3 h-3 mt-0.5' />
                  <div className='w-full'>
                    <span className='text-xs text-gray-400'>Prácticas espirituales: </span>
                    <p className='text-xs text-gray-300 leading-relaxed mt-1'>
                      {user?.profile?.spiritualPractices || user?.spiritualPractices}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campos específicos para ROUSE */}
        {(user?.profile?.categoryInterest || user?.categoryInterest) === 'ROUSE' && hasRoueFields() && (
          <div className='mb-4 pb-4 border-b border-gray-700/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Flame className='w-3 h-3 text-red-400' />
              <span className='text-xs font-medium text-gray-200'>Preferencias personales</span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
              {/* Rol sexual */}
              {(user?.profile?.sexualRoleId || user?.sexualRoleId) && (
                <div className='flex items-center gap-2'>
                  <Target className='w-3 h-3' />
                  <span>
                    Rol sexual:{' '}
                    <span className='text-gray-300'>
                      {getAttributeName('sexualRoleOptions', user?.profile?.sexualRoleId || user?.sexualRoleId)}
                    </span>
                  </span>
                </div>
              )}

              {/* Tipo de relación */}
              {(user?.profile?.relationshipTypeId || user?.relationshipTypeId) && (
                <div className='flex items-center gap-2'>
                  <Users className='w-3 h-3' />
                  <span>
                    Tipo de relación:{' '}
                    <span className='text-gray-300'>
                      {getAttributeName('relationshipTypeOptions', user?.profile?.relationshipTypeId || user?.relationshipTypeId)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400'>
          {/* Rango de edad para conexiones */}
          <div className='flex items-center gap-2'>
            <Calendar className='w-3 h-3 text-green-400' />
            <span>
              Rango de edad:{' '}
              <span className='text-gray-300'>
                {(user?.profile?.agePreferenceMin || user?.agePreferenceMin) && (user?.profile?.agePreferenceMax || user?.agePreferenceMax)
                  ? `${user?.profile?.agePreferenceMin || user?.agePreferenceMin}-${user?.profile?.agePreferenceMax || user?.agePreferenceMax} años`
                  : 'No especificado'}
              </span>
            </span>
          </div>

          {/* Radio de búsqueda */}
          <div className='flex items-center gap-2'>
            <MapPin className='w-3 h-3 text-cyan-400' />
            <span>
              Radio de búsqueda:{' '}
              <span className='text-gray-300'>
                {user?.profile?.locationPreferenceRadius || user?.locationPreferenceRadius
                  ? `${user?.profile?.locationPreferenceRadius || user?.locationPreferenceRadius} km`
                  : 'No especificado'}
              </span>
            </span>
          </div>
        </div>

        {/* Verificación requerida */}
        {(user?.profile?.requireVerification || user?.requireVerification) && (
          <div className='pt-3 border-t border-gray-700/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Search className='w-3 h-3 text-blue-400' />
              <span className='text-xs font-medium text-gray-200'>Filtros de búsqueda</span>
            </div>
            <div className='flex flex-wrap gap-1'>
              <Chip size='sm' variant='flat' color='success' className='bg-green-500/20 text-green-300 border border-green-500/30 text-xs'>
                Solo usuarios verificados
              </Chip>
            </div>
          </div>
        )}
      </div>

      {/* Modal para editar preferencias */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        size='5xl'
        scrollBehavior='inside'
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <h3 className='text-lg font-bold text-gray-200'>Editar Preferencias</h3>
                <p className='text-sm text-gray-400'>Actualiza tus preferencias de búsqueda y match</p>
              </ModalHeader>
              <ModalBody className='py-6'>
                <StepPreferences {...stepPreferencesProps} />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={handleCancel} startContent={<X className='w-4 h-4' />} isDisabled={loading}>
                  Cancelar
                </Button>
                <Button
                  color='primary'
                  onPress={handleSave}
                  startContent={loading ? <Spinner size='sm' /> : <Check className='w-4 h-4' />}
                  isDisabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default PreferencesSection
