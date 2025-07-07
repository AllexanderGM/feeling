import { useState, useMemo } from 'react'
import { Button, Spinner, Chip, Slider } from '@heroui/react'
import { Edit2, Check, X, Target, Heart, MapPin, Calendar, Church, Building } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser.js'
import useUserAttributes from '@hooks/useUserAttributes.js'
import { useCategoryInterests } from '@hooks/useCategoryInterests.js'
import { step3Schema } from '@utils/formSchemas.js'
import { getDefaultValuesForStep } from '@constants/userSchema.js'
import StepPreferences from '@pages/user/completeProfile/components/StepPreferences.jsx'
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'

const PreferencesSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const { updateUserProfile } = useUser()
  const userAttributes = useUserAttributes()
  const { categoryOptions, categoriesLoading, categoriesError } = useCategoryInterests()

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
    resolver: yupResolver(step3Schema),
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
      console.error('Error updating preferences:', error)
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
  const getCategoryDetails = categoryKey => {
    if (!categoryKey || !categoryOptions) return null
    return categoryOptions.find(cat => cat.key === categoryKey)
  }

  // Props para StepPreferences
  const stepPreferencesProps = {
    control,
    errors,
    watch,
    setValue,
    clearErrors,
    categoryOptions: categoryOptions || [],
    categoriesLoading,
    categoriesError,
    religionOptions: userAttributes.religionOptions || [],
    sexualRoleOptions: userAttributes.sexualRoleOptions || [],
    relationshipTypeOptions: userAttributes.relationshipTypeOptions || [],
    attributesLoading: false
  }

  if (isEditing) {
    return (
      <div className="space-y-6 w-full">
        {/* Header de edición */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-200">Editar Preferencias</h2>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Actualiza tus preferencias de conexión y búsqueda</p>
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

        {/* Renderizar StepPreferences */}
        <StepPreferences {...stepPreferencesProps} />

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

  const categoryDetails = getCategoryDetails(user?.categoryInterest)
  const isSpiritCategory = user?.categoryInterest === 'SPIRIT'
  const isRoueCategory = user?.categoryInterest === 'ROUSE'

  // Vista de solo lectura
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Preferencias</h2>
          <p className="text-gray-400 mt-2">Tus preferencias de conexión y búsqueda</p>
        </div>
        <Button size="sm" color="primary" variant="bordered" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
          Editar
        </Button>
      </div>

      {/* Categoría de interés */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Categoría de Interés</h3>
        <div>
          <label className="text-sm text-gray-400">Tipo de conexión que buscas</label>
          <div className="flex items-start gap-2 mt-1">
            <Target className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1">
              {categoryDetails ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryDetails.icon}</span>
                  <div>
                    <p className="text-gray-200 text-base font-medium">{categoryDetails.label}</p>
                    <p className="text-gray-400 text-sm">{categoryDetails.shortDescription}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No especificado</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Preferencias de edad */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Preferencias de Edad</h3>
        <div>
          <label className="text-sm text-gray-400">Rango de edad preferido</label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">
              {user?.agePreferenceMin || 18} - {user?.agePreferenceMax || 50} años
            </p>
          </div>
        </div>
      </section>

      {/* Preferencias de ubicación */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Preferencias de Ubicación</h3>
        <div>
          <label className="text-sm text-gray-400">Radio de búsqueda</label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">{user?.locationPreferenceRadius || 50} km</p>
          </div>
        </div>
      </section>

      {/* Información espiritual - Solo para categoría SPIRIT */}
      {isSpiritCategory && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">Información Espiritual</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Religión</label>
              <div className="flex items-center gap-2 mt-1">
                <Church className="w-4 h-4 text-gray-400" />
                <p className="text-gray-200 text-base">{getAttributeName('religions', user?.religionId)}</p>
              </div>
            </div>

            {user?.church && (
              <div>
                <label className="text-sm text-gray-400">Iglesia</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-200 text-base">{user.church}</p>
                </div>
              </div>
            )}

            {user?.spiritualMoments && (
              <div>
                <label className="text-sm text-gray-400">Momentos espirituales</label>
                <p className="text-gray-200 text-base mt-1 leading-relaxed">{user.spiritualMoments}</p>
              </div>
            )}

            {user?.spiritualPractices && (
              <div>
                <label className="text-sm text-gray-400">Prácticas espirituales</label>
                <p className="text-gray-200 text-base mt-1 leading-relaxed">{user.spiritualPractices}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Preferencias personales - Solo para categoría ROUSE */}
      {isRoueCategory && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">Preferencias Personales</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Rol sexual</label>
              <p className="text-gray-200 text-base mt-1">{getAttributeName('sexualRoles', user?.sexualRoleId)}</p>
            </div>

            <div>
              <label className="text-sm text-gray-400">Tipo de relación</label>
              <p className="text-gray-200 text-base mt-1">{getAttributeName('relationshipTypes', user?.relationshipTypeId)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Mensaje informativo si no hay preferencias específicas */}
      {!isSpiritCategory && !isRoueCategory && user?.categoryInterest && (
        <section className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-blue-400">💡</span>
            <div className="text-sm">
              <p className="text-blue-300">
                Las preferencias adicionales están disponibles para categorías específicas como Spirit y Rouse. Puedes cambiar tu categoría
                editando esta sección.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default PreferencesSection
