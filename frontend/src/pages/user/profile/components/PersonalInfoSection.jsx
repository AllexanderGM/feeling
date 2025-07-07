import { useState, useMemo } from 'react'
import { Button, Spinner } from '@heroui/react'
import { MapPin, Calendar, Phone, Mail, Edit2, Check, X, IdCard, Camera } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser.js'
import useLocation from '@hooks/useLocation.js'
import { stepBasicInfoSchema } from '@utils/formSchemas.js'
import { getDefaultValuesForStep } from '@constants/userSchema.js'
import StepBasicInfo from '@pages/user/completeProfile/components/StepBasicInfo.jsx'

const PersonalInfoSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const { updateUserProfile } = useUser()

  // Hooks necesarios para StepBasicInfo
  const locationConfig = useMemo(
    () => ({
      defaultCountry: user?.country || 'Colombia',
      defaultCity: user?.city || 'Bogotá'
    }),
    [user?.country, user?.city]
  )

  const location = useLocation(locationConfig)

  // Valores por defecto usando esquema centralizado
  const defaultValues = useMemo(() => getDefaultValuesForStep(1, user), [user])

  // React Hook Form para StepBasicInfo
  const {
    control,
    formState: { errors },
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(stepBasicInfoSchema),
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
      console.error('Error updating personal info:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular edad
  const calculateAge = birthDate => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Obtener imagen principal
  const getMainImage = () => {
    if (!user?.images || user.images.length === 0) return null
    const selectedIndex = user.selectedProfileImageIndex || 0
    return user.images[selectedIndex] || user.images[0]
  }

  const age = calculateAge(user?.birthDate)
  const mainImage = getMainImage()

  // Datos para StepBasicInfo
  const stepBasicInfoProps = {
    user,
    control,
    errors,
    locationData: {
      formattedCountries: location.formattedCountries,
      formattedCities: location.formattedCities,
      formattedLocalities: location.formattedLocalities,
      loadCitiesByCountry: location.loadCitiesByCountry,
      loadLocalitiesByCity: location.loadLocalitiesByCity
    },
    watch,
    setValue,
    setError,
    clearErrors
  }

  if (isEditing) {
    return (
      <div className="space-y-6 w-full">
        {/* Header de edición */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-200">Editar Información Personal</h2>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Actualiza tus datos básicos y fotos de perfil</p>
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

        {/* Renderizar StepBasicInfo */}
        <StepBasicInfo {...stepBasicInfoProps} />

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
          <h2 className="text-xl font-bold text-gray-200">Información Personal</h2>
          <p className="text-gray-400 mt-2">Datos básicos de tu perfil</p>
        </div>
        <Button size="sm" color="primary" variant="bordered" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
          Editar
        </Button>
      </div>

      {/* Vista previa de foto principal */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Foto de Perfil</h3>
        <div className="flex justify-center">
          {mainImage ? (
            <div className="relative">
              <img
                src={mainImage}
                alt="Foto principal del perfil"
                className="w-32 h-32 object-cover rounded-full border-2 border-primary-500"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-gray-700 rounded-full">
                <Camera className="w-3 h-3 text-gray-300" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-700/50 rounded-full border-2 border-gray-600 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{user?.images?.length || 0} de 5 fotos subidas</p>
        </div>
      </section>

      {/* Información personal */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Datos Personales</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Nombre(s)</label>
            <p className="text-gray-200 text-base mt-1">{user?.name || 'No especificado'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Apellidos</label>
            <p className="text-gray-200 text-base mt-1">{user?.lastName || 'No especificado'}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Documento de identidad</label>
          <div className="flex items-center gap-2 mt-1">
            <IdCard className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">{user?.document || <span className="text-gray-500 italic">No especificado</span>}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Fecha de nacimiento</label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">
              {user?.birthDate ? (
                <>
                  {new Date(user.birthDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  {age && <span className="text-gray-400 ml-2">{age} años</span>}
                </>
              ) : (
                <span className="text-gray-500 italic">No especificado</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Correo electrónico</label>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">{user?.email}</p>
            <span className="text-xs text-gray-500">(No editable por seguridad)</span>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Contacto</h3>

        <div>
          <label className="text-sm text-gray-400">Teléfono</label>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">
              {user?.phoneCode && user?.phone ? (
                `${user.phoneCode} ${user.phone}`
              ) : (
                <span className="text-gray-500 italic">No especificado</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Profesión</label>
          <p className="text-gray-200 text-base mt-1">
            {user?.profession || <span className="text-gray-500 italic">No especificado</span>}
          </p>
        </div>
      </section>

      {/* Ubicación */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Ubicación</h3>

        <div>
          <label className="text-sm text-gray-400">Ubicación</label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-gray-200 text-base">
              {user?.locality ? `${user.locality}, ` : ''}
              {user?.city && user?.country ? (
                `${user.city}, ${user.country}`
              ) : (
                <span className="text-gray-500 italic">No especificado</span>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PersonalInfoSection
