import { useState, useRef } from 'react'
import { Button, Spinner, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import {
  Check,
  X,
  Brain,
  Heart,
  GraduationCap,
  Ruler,
  User,
  Settings,
  Target,
  Users,
  Eye,
  Palette,
  UserCheck,
  Users2,
  Sparkles,
  Badge
} from 'lucide-react'
import StepCharacteristics from '@pages/user/complete/components/StepCharacteristics.jsx'

const CharacteristicsSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()

  // Ref para acceder al método submit de StepCharacteristics
  const stepCharacteristicsRef = useRef(null)

  const handleEdit = () => {
    onEditOpen()
  }

  const handleCancel = () => {
    onEditOpenChange()
  }

  // Callback que se ejecuta cuando StepCharacteristics completa el submit
  const handleStepComplete = result => {
    setLoading(false)
    if (result?.success) {
      onEditOpenChange()
    }
  }

  // Handler del botón "Guardar cambios" - llama al submit de StepCharacteristics
  const handleSaveClick = async () => {
    if (stepCharacteristicsRef.current) {
      setLoading(true)
      await stepCharacteristicsRef.current.submit()
    }
  }
  // Función para obtener el icono según el género
  const getGenderIcon = gender => {
    switch (gender?.toLowerCase()) {
      case 'masculino':
      case 'hombre':
        return <User className='w-3 h-3 text-blue-400' />
      case 'femenino':
      case 'mujer':
        return <Users2 className='w-3 h-3 text-pink-400' />
      case 'no binario':
      case 'otro':
        return <Sparkles className='w-3 h-3 text-purple-400' />
      default:
        return <User className='w-3 h-3' />
    }
  }

  // Función para obtener el icono según el estado civil
  const getMaritalStatusIcon = status => {
    switch (status?.toLowerCase()) {
      case 'soltero':
      case 'soltera':
        return <User className='w-3 h-3 text-green-400' />
      case 'casado':
      case 'casada':
        return <Heart className='w-3 h-3 text-red-400' />
      case 'divorciado':
      case 'divorciada':
        return <Users className='w-3 h-3 text-orange-400' />
      case 'viudo':
      case 'viuda':
        return <UserCheck className='w-3 h-3 text-gray-400' />
      default:
        return <User className='w-3 h-3' />
    }
  }

  // Función para obtener colores de ojos
  const getEyeColorDisplay = eyeColor => {
    const colors = {
      marrón: '#8B4513',
      azul: '#1E90FF',
      verde: '#228B22',
      avellana: '#8E7618',
      gris: '#708090',
      negro: '#000000',
      ámbar: '#FFBF00'
    }
    const colorCode = colors[eyeColor?.toLowerCase()] || '#999999'

    return {
      color: colorCode,
      name: eyeColor || 'No especificado'
    }
  }

  // Función para obtener colores de cabello
  const getHairColorDisplay = hairColor => {
    const colors = {
      negro: '#000000',
      castaño: '#8B4513',
      rubio: '#FFD700',
      pelirrojo: '#DC143C',
      gris: '#808080',
      blanco: '#FFFFFF',
      caoba: '#C04000'
    }
    const colorCode = colors[hairColor?.toLowerCase()] || '#999999'

    return {
      color: colorCode,
      name: hairColor || 'No especificado'
    }
  }

  // Vista de solo lectura
  return (
    <div className='space-y-6 w-full'>
      {/* Características con diseño similar al estado general */}
      <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Heart className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Características</span>
          </div>
          <Button
            className='bg-primary-600 hover:bg-primary-700'
            color='primary'
            size='sm'
            startContent={<Settings className='w-3 h-3' />}
            variant='solid'
            onPress={handleEdit}>
            Editar
          </Button>
        </div>

        {/* Descripción personal */}
        <div className='mb-4 pb-4 border-b border-gray-700/30'>
          <div className='flex items-start gap-2'>
            <Brain className='w-3 h-3 mt-0.5 text-blue-400' />
            <div className='w-full'>
              <span className='text-xs text-gray-400'>Descripción personal: </span>
              <div className='mt-1'>
                {user?.user?.description || user?.description ? (
                  <p className='text-xs text-gray-300 leading-relaxed whitespace-pre-wrap'>
                    {user?.user?.description || user?.description}
                  </p>
                ) : (
                  <span className='text-xs text-gray-500 italic'>No especificado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags personales */}
        {(user?.user?.userTags || user?.user?.tags || user?.userTags || user?.tags) &&
          (user?.user?.userTags || user?.user?.tags || user?.userTags || user?.tags).length > 0 && (
            <div className='mb-4 pb-4 border-b border-gray-700/30'>
              <div className='flex items-center gap-2 mb-2'>
                <Sparkles className='w-3 h-3 text-blue-400' />
                <span className='text-xs font-medium text-gray-200'>Tags personales</span>
              </div>
              <div className='flex flex-wrap gap-1'>
                {(user?.user?.userTags || user?.user?.tags || user?.userTags || user?.tags || []).slice(0, 8).map((tag, index) => (
                  <Chip
                    key={index}
                    className='bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-xs'
                    color='secondary'
                    size='sm'
                    variant='flat'>
                    {typeof tag === 'string' ? tag : tag.name || tag}
                  </Chip>
                ))}
                {(user?.user?.userTags || user?.user?.tags || user?.userTags || user?.tags || []).length > 8 && (
                  <Chip className='bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs' size='sm' variant='flat'>
                    +{(user?.user?.userTags || user?.user?.tags || user?.userTags || user?.tags || []).length - 8} más
                  </Chip>
                )}
              </div>
            </div>
          )}

        {/* Lista de intereses */}
        {(user?.user?.interests || user?.interests) && (user?.user?.interests || user?.interests).length > 0 && (
          <div className='mb-4 pb-4 border-b border-gray-700/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='w-3 h-3 text-blue-400' />
              <span className='text-xs font-medium text-gray-200'>Intereses</span>
            </div>
            <div className='flex flex-wrap gap-1'>
              {(user?.user?.interests || user?.interests || []).slice(0, 8).map((interest, index) => (
                <Chip
                  key={index}
                  className='bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs'
                  color='primary'
                  size='sm'
                  variant='flat'>
                  {interest}
                </Chip>
              ))}
              {(user?.user?.interests || user?.interests || []).length > 8 && (
                <Chip className='bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs' size='sm' variant='flat'>
                  +{(user?.user?.interests || user?.interests || []).length - 8} más
                </Chip>
              )}
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400'>
          {/* Género */}
          <div className='flex items-center gap-2'>
            {getGenderIcon(user?.user?.gender || user?.gender)}
            <span>
              Género: <span className='text-gray-300'>{user?.user?.gender || user?.gender || 'No especificado'}</span>
            </span>
          </div>

          {/* Estado civil */}
          <div className='flex items-center gap-2'>
            {getMaritalStatusIcon(user?.user?.maritalStatus || user?.maritalStatus)}
            <span>
              Estado civil: <span className='text-gray-300'>{user?.user?.maritalStatus || user?.maritalStatus || 'No especificado'}</span>
            </span>
          </div>

          {/* Nivel educativo */}
          <div className='flex items-center gap-2'>
            <GraduationCap className='w-3 h-3 text-purple-400' />
            <span>
              Educación: <span className='text-gray-300'>{user?.user?.education || user?.education || 'No especificado'}</span>
            </span>
          </div>

          {/* Profesión */}
          <div className='flex items-center gap-2'>
            <Badge className='w-3 h-3 text-orange-400' />
            <span>
              Profesión: <span className='text-gray-300'>{user?.user?.profession || user?.profession || 'No especificado'}</span>
            </span>
          </div>

          {/* Tipo de cuerpo */}
          <div className='flex items-center gap-2'>
            <User className='w-3 h-3 text-green-400' />
            <span>
              Tipo de cuerpo: <span className='text-gray-300'>{user?.user?.bodyType || user?.bodyType || 'No especificado'}</span>
            </span>
          </div>

          {/* Estatura */}
          <div className='flex items-center gap-2'>
            <Ruler className='w-3 h-3 text-cyan-400' />
            <span>
              Estatura:{' '}
              <span className='text-gray-300'>
                {user?.user?.height || user?.height ? `${user?.user?.height || user?.height} cm` : 'No especificado'}
              </span>
            </span>
          </div>

          {/* Color de ojos */}
          <div className='flex items-center gap-2'>
            <Eye className='w-3 h-3 text-indigo-400' />
            <span>Color de ojos: </span>
            <div className='flex items-center gap-1'>
              {(user?.user?.eyeColor || user?.eyeColor) && (
                <div
                  className='w-3 h-3 rounded-full border border-gray-500'
                  style={{ backgroundColor: getEyeColorDisplay(user?.user?.eyeColor || user?.eyeColor).color }}
                />
              )}
              <span className='text-gray-300'>{getEyeColorDisplay(user?.user?.eyeColor || user?.eyeColor).name}</span>
            </div>
          </div>

          {/* Color de cabello */}
          <div className='flex items-center gap-2'>
            <Palette className='w-3 h-3 text-yellow-400' />
            <span>Color de cabello: </span>
            <div className='flex items-center gap-1'>
              {(user?.user?.hairColor || user?.hairColor) && (
                <div
                  className='w-3 h-3 rounded-full border border-gray-500'
                  style={{ backgroundColor: getHairColorDisplay(user?.user?.hairColor || user?.hairColor).color }}
                />
              )}
              <span className='text-gray-300'>{getHairColorDisplay(user?.user?.hairColor || user?.hairColor).name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar características */}
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}
        isOpen={isEditOpen}
        scrollBehavior='inside'
        size='5xl'
        onOpenChange={onEditOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-gray-200'>Editar Características</h3>
            <p className='text-sm text-gray-400'>Actualiza tu descripción, intereses y características físicas</p>
          </ModalHeader>
          <ModalBody className='py-6'>
            <StepCharacteristics ref={stepCharacteristicsRef} onStepComplete={handleStepComplete} />
          </ModalBody>
          <ModalFooter>
            <Button color='danger' isDisabled={loading} startContent={<X className='w-4 h-4' />} variant='light' onPress={handleCancel}>
              Cancelar
            </Button>
            <Button
              color='primary'
              isDisabled={loading}
              startContent={loading ? <Spinner size='sm' /> : <Check className='w-4 h-4' />}
              onPress={handleSaveClick}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default CharacteristicsSection
