import { useState } from 'react'
import { Button, Textarea, Spinner } from '@heroui/react'
import { Edit2, Check, X } from 'lucide-react'
import useUser from '@hooks/useUser.js'

const DescriptionSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(user?.description || '')
  const [loading, setLoading] = useState(false)

  const { updateUserProfile } = useUser()

  const handleEdit = () => {
    setDescription(user?.description || '')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDescription(user?.description || '')
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateUserProfile({ description })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating description:', error)
    } finally {
      setLoading(false)
    }
  }

  // No mostrar la sección si no hay descripción y no está editando
  if (!user?.description && !isEditing) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-200">Acerca de mí</h2>
            <p className="text-gray-400 mt-2">Cuéntanos sobre ti</p>
          </div>
          <Button size="sm" color="primary" variant="bordered" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
            Agregar descripción
          </Button>
        </div>

        {/* Estado vacío */}
        <div className="text-center py-8 space-y-4">
          <div className="text-6xl">📝</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Sin descripción</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4">Agrega una descripción personal para que otros usuarios te conozcan mejor</p>
            <Button color="primary" variant="flat" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
              Escribir mi descripción
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Acerca de mí</h2>
          <p className="text-gray-400 mt-2">Tu descripción personal</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                color="success"
                variant="flat"
                startContent={loading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                onPress={handleSave}
                isDisabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="light"
                startContent={<X className="w-4 h-4" />}
                onPress={handleCancel}
                isDisabled={loading}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button size="sm" color="primary" variant="bordered" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Descripción personal */}
      <section className="space-y-4">
        {isEditing ? (
          <Textarea
            variant="bordered"
            isRequired
            label="Descripción personal"
            placeholder="Cuéntanos sobre ti, tus intereses, lo que buscas y qué te hace único..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            minRows={3}
            maxRows={6}
            maxLength={500}
            description={`${description.length}/500 caracteres`}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-800/30'
            }}
          />
        ) : (
          <div>
            <p className="text-gray-200 leading-relaxed text-base">{user?.description}</p>
            <p className="text-gray-400 text-sm mt-2">{user?.description?.length || 0} caracteres</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default DescriptionSection
