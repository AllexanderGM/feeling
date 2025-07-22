import { useState, useMemo } from 'react'
import { Button, Spinner, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import {
  Edit2,
  Check,
  X,
  Brain,
  Heart,
  GraduationCap,
  Briefcase,
  Ruler,
  User,
  Settings,
  Smile,
  Book,
  Target,
  Users,
  Eye,
  Palette,
  UserCheck,
  Users2,
  Sparkles,
  MapPin,
  Badge
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser.js'
import useUserAttributes from '@hooks/useUserAttributes.js'
import useUserTags from '@hooks/useUserTags.js'
import { stepCharacteristicsSchema, getDefaultValuesForStep } from '@schemas'
import StepCharacteristics from '@pages/user/complete/components/StepCharacteristics.jsx'

const CharacteristicsSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()

  const { updateUserProfile } = useUser()
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()

  // Valores por defecto usando esquema centralizado
  const defaultValues = useMemo(() => getDefaultValuesForStep(2, user), [user])

  // React Hook Form para StepCharacteristics
  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(stepCharacteristicsSchema),
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
      console.error('Error updating characteristics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Props para StepCharacteristics
  const stepCharacteristicsProps = {
    control,
    errors,
    watch,
    setValue,
    setError,
    clearErrors,
    userAttributes,
    userTags,
    user
  }

  // Función para obtener el nombre de un atributo por ID
  const getAttributeName = (attributeType, attributeId) => {
    if (!attributeId || !userAttributes[attributeType]) return 'No especificado'
    const attribute = userAttributes[attributeType].find(attr => attr.id === parseInt(attributeId))
    return attribute?.name || 'No especificado'
  }

  // Función para obtener el icono según el género
  const getGenderIcon = gender => {
    switch (gender?.toLowerCase()) {
      case 'masculino':
      case 'hombre':
        return <User className="w-3 h-3 text-blue-400" />
      case 'femenino':
      case 'mujer':
        return <Users2 className="w-3 h-3 text-pink-400" />
      case 'no binario':
      case 'otro':
        return <Sparkles className="w-3 h-3 text-purple-400" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  // Función para obtener el icono según el estado civil
  const getMaritalStatusIcon = status => {
    switch (status?.toLowerCase()) {
      case 'soltero':
      case 'soltera':
        return <User className="w-3 h-3 text-green-400" />
      case 'casado':
      case 'casada':
        return <Heart className="w-3 h-3 text-red-400" />
      case 'divorciado':
      case 'divorciada':
        return <Users className="w-3 h-3 text-orange-400" />
      case 'viudo':
      case 'viuda':
        return <UserCheck className="w-3 h-3 text-gray-400" />
      default:
        return <User className="w-3 h-3" />
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
    <div className="space-y-6 w-full">
      {/* Características con diseño similar al estado general */}
      <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Características</span>
          </div>
          <Button
            size="sm"
            variant="solid"
            color="primary"
            className="bg-primary-600 hover:bg-primary-700"
            startContent={<Settings className="w-3 h-3" />}
            onPress={handleEdit}>
            Editar
          </Button>
        </div>

        {/* Descripción personal */}
        <div className="mb-4 pb-4 border-b border-gray-700/30">
          <div className="flex items-start gap-2">
            <Brain className="w-3 h-3 mt-0.5 text-blue-400" />
            <div className="w-full">
              <span className="text-xs text-gray-400">Descripción personal: </span>
              <div className="mt-1">
                {user?.description ? (
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{user.description}</p>
                ) : (
                  <span className="text-xs text-gray-500 italic">No especificado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags personales */}
        {user?.userTags && user.userTags.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-gray-200">Tags personales</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.userTags.slice(0, 8).map((tag, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-xs">
                  {tag.name}
                </Chip>
              ))}
              {user.userTags.length > 8 && (
                <Chip size="sm" variant="flat" className="bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs">
                  +{user.userTags.length - 8} más
                </Chip>
              )}
            </div>
          </div>
        )}

        {/* Lista de intereses */}
        {user?.interests && user.interests.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-gray-200">Intereses</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.interests.slice(0, 8).map((interest, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs">
                  {interest}
                </Chip>
              ))}
              {user.interests.length > 8 && (
                <Chip size="sm" variant="flat" className="bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs">
                  +{user.interests.length - 8} más
                </Chip>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400">
          {/* Género */}
          <div className="flex items-center gap-2">
            {getGenderIcon(user?.gender)}
            <span>
              Género: <span className="text-gray-300">{user?.gender || 'No especificado'}</span>
            </span>
          </div>

          {/* Estado civil */}
          <div className="flex items-center gap-2">
            {getMaritalStatusIcon(user?.maritalStatus)}
            <span>
              Estado civil: <span className="text-gray-300">{user?.maritalStatus || 'No especificado'}</span>
            </span>
          </div>

          {/* Nivel educativo */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3 h-3 text-purple-400" />
            <span>
              Educación: <span className="text-gray-300">{getAttributeName('educationLevelOptions', user?.educationLevel)}</span>
            </span>
          </div>

          {/* Profesión */}
          <div className="flex items-center gap-2">
            <Badge className="w-3 h-3 text-orange-400" />
            <span>
              Profesión: <span className="text-gray-300">{user?.profession || 'No especificado'}</span>
            </span>
          </div>

          {/* Tipo de cuerpo */}
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-green-400" />
            <span>
              Tipo de cuerpo: <span className="text-gray-300">{getAttributeName('bodyTypeOptions', user?.bodyType)}</span>
            </span>
          </div>

          {/* Estatura */}
          <div className="flex items-center gap-2">
            <Ruler className="w-3 h-3 text-cyan-400" />
            <span>
              Estatura: <span className="text-gray-300">{user?.height ? `${user.height} cm` : 'No especificado'}</span>
            </span>
          </div>

          {/* Color de ojos */}
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-indigo-400" />
            <span>Color de ojos: </span>
            <div className="flex items-center gap-1">
              {user?.eyeColor && (
                <div
                  className="w-3 h-3 rounded-full border border-gray-500"
                  style={{ backgroundColor: getEyeColorDisplay(user.eyeColor).color }}></div>
              )}
              <span className="text-gray-300">{getEyeColorDisplay(user?.eyeColor).name}</span>
            </div>
          </div>

          {/* Color de cabello */}
          <div className="flex items-center gap-2">
            <Palette className="w-3 h-3 text-yellow-400" />
            <span>Color de cabello: </span>
            <div className="flex items-center gap-1">
              {user?.hairColor && (
                <div
                  className="w-3 h-3 rounded-full border border-gray-500"
                  style={{ backgroundColor: getHairColorDisplay(user.hairColor).color }}></div>
              )}
              <span className="text-gray-300">{getHairColorDisplay(user?.hairColor).name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar características */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-200">Editar Características</h3>
                <p className="text-sm text-gray-400">Actualiza tu descripción, intereses y características físicas</p>
              </ModalHeader>
              <ModalBody className="py-6">
                <StepCharacteristics {...stepCharacteristicsProps} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleCancel} startContent={<X className="w-4 h-4" />} isDisabled={loading}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  startContent={loading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
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

export default CharacteristicsSection
