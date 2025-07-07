import { useState, useMemo } from 'react'
import { Button, Spinner, Chip } from '@heroui/react'
import { Edit2, Check, X, Brain, Heart, GraduationCap, Briefcase, Ruler, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser.js'
import useUserAttributes from '@hooks/useUserAttributes.js'
import useUserTags from '@hooks/useUserTags.js'
import { step2Schema } from '@utils/formSchemas.js'
import { getDefaultValuesForStep } from '@constants/userSchema.js'
import StepCharacteristics from '@pages/user/completeProfile/components/StepCharacteristics.jsx'

const CharacteristicsSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

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
    resolver: yupResolver(step2Schema),
    defaultValues,
    mode: 'onChange'
  })

  const handleEdit = () => {
    reset(defaultValues)
    setIsEditing(true)
  }

  const handleCancel = () => {
    reset(defaultValues)
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const formData = getValues()
      await updateUserProfile(formData)
      setIsEditing(false)
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

  if (isEditing) {
    return (
      <div className="space-y-6 w-full">
        {/* Header de edición */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-200">Editar Características</h2>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Actualiza tu descripción, intereses y características físicas</p>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button
              size="sm"
              color="success"
              variant="flat"
              startContent={loading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
              onPress={handleSave}
              isDisabled={loading}
              className="flex-1 sm:flex-none">
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="light"
              startContent={<X className="w-4 h-4" />}
              onPress={handleCancel}
              isDisabled={loading}
              className="flex-1 sm:flex-none">
              Cancelar
            </Button>
          </div>
        </div>

        {/* Renderizar StepCharacteristics */}
        <StepCharacteristics {...stepCharacteristicsProps} />

        {/* Botones de acción en la parte inferior */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
          <Button
            size="md"
            color="danger"
            variant="light"
            startContent={<X className="w-4 h-4" />}
            onPress={handleCancel}
            isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            size="md"
            color="success"
            variant="flat"
            startContent={loading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
            onPress={handleSave}
            isDisabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    )
  }

  // Vista de solo lectura
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Características</h2>
          <p className="text-gray-400 mt-2">Tu descripción, intereses y características físicas</p>
        </div>
        <Button size="sm" color="primary" variant="bordered" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
          Editar
        </Button>
      </div>

      {/* Descripción */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Descripción Personal</h3>
        <div>
          <label className="text-sm text-gray-400">Acerca de mí</label>
          <div className="flex items-start gap-2 mt-1">
            <Brain className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <p className="text-gray-200 text-base leading-relaxed">
              {user?.description || <span className="text-gray-500 italic">No hay descripción disponible</span>}
            </p>
          </div>
        </div>
      </section>

      {/* Intereses/Tags */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Intereses</h3>
        <div>
          <label className="text-sm text-gray-400">Mis intereses</label>
          <div className="flex items-start gap-2 mt-1">
            <Heart className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1">
              {user?.tags && user.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="bg-primary-500/20 text-primary-300 border border-primary-500/30">
                      {tag}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No hay intereses especificados</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Información Personal */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Información Personal</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Género</label>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-gray-400" />
              <p className="text-gray-200 text-base">{getAttributeName('genders', user?.genderId)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Estado civil</label>
            <div className="flex items-center gap-2 mt-1">
              <Heart className="w-4 h-4 text-gray-400" />
              <p className="text-gray-200 text-base">{getAttributeName('maritalStatuses', user?.maritalStatusId)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Nivel educativo</label>
            <div className="flex items-center gap-2 mt-1">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <p className="text-gray-200 text-base">{getAttributeName('educationLevels', user?.educationLevelId)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Profesión</label>
            <div className="flex items-center gap-2 mt-1">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <p className="text-gray-200 text-base">{user?.profession || <span className="text-gray-500 italic">No especificado</span>}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Características Físicas */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Características Físicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Estatura</label>
            <div className="flex items-center gap-2 mt-1">
              <Ruler className="w-4 h-4 text-gray-400" />
              <p className="text-gray-200 text-base">
                {user?.height ? `${user.height} cm` : <span className="text-gray-500 italic">No especificado</span>}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Tipo de cuerpo</label>
            <p className="text-gray-200 text-base mt-1">{getAttributeName('bodyTypes', user?.bodyTypeId)}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400">Color de ojos</label>
            <p className="text-gray-200 text-base mt-1">{getAttributeName('eyeColors', user?.eyeColorId)}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400">Color de cabello</label>
            <p className="text-gray-200 text-base mt-1">{getAttributeName('hairColors', user?.hairColorId)}</p>
          </div>
        </div>
      </section>

      {/* Religión */}
      {user?.religionId && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">Creencias</h3>
          <div>
            <label className="text-sm text-gray-400">Religión</label>
            <p className="text-gray-200 text-base mt-1">{getAttributeName('religions', user?.religionId)}</p>
          </div>
        </section>
      )}
    </div>
  )
}

export default CharacteristicsSection
