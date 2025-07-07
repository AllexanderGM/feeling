import { useState } from 'react'
import { Button, Chip, Select, SelectItem, Spinner } from '@heroui/react'
import { Heart, Edit2, Check, X } from 'lucide-react'
import useUser from '@hooks/useUser.js'
import { useCategoryInterests } from '@hooks/useCategoryInterests'

const InterestsSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    categoryInterest: user?.categoryInterest || '',
    religionId: user?.religionId || ''
  })
  const [loading, setLoading] = useState(false)

  const { updateUserProfile } = useUser()
  const { categoryInterests, loading: loadingCategories } = useCategoryInterests()

  const handleEdit = () => {
    setEditData({
      categoryInterest: user?.categoryInterest || '',
      religionId: user?.religionId || ''
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData({
      categoryInterest: user?.categoryInterest || '',
      religionId: user?.religionId || ''
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateUserProfile(editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating interests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Opciones de religión (esto debería venir de un hook o API)
  const religionOptions = [
    { key: 'catolica', label: 'Católica' },
    { key: 'cristiana', label: 'Cristiana' },
    { key: 'protestante', label: 'Protestante' },
    { key: 'evangelica', label: 'Evangélica' },
    { key: 'adventista', label: 'Adventista' },
    { key: 'testigo_jehova', label: 'Testigo de Jehová' },
    { key: 'mormon', label: 'Mormón' },
    { key: 'judaica', label: 'Judía' },
    { key: 'islamica', label: 'Islámica' },
    { key: 'budista', label: 'Budista' },
    { key: 'hinduista', label: 'Hinduista' },
    { key: 'otra', label: 'Otra' },
    { key: 'ninguna', label: 'Ninguna' },
    { key: 'no_especifica', label: 'Prefiero no especificar' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Intereses y Preferencias</h2>
          <p className="text-gray-400 mt-2">Tu categoría de interés y preferencias personales</p>
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

      {/* Categoría de interés */}
      <section className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Categoría de interés</label>
          {isEditing ? (
            <Select
              variant="underlined"
              placeholder="Selecciona una categoría"
              selectedKeys={editData.categoryInterest ? [editData.categoryInterest] : []}
              onSelectionChange={keys => handleInputChange('categoryInterest', Array.from(keys)[0] || '')}
              className="mt-1"
              isLoading={loadingCategories}
              startContent={<Heart className="w-4 h-4 text-gray-400" />}
              classNames={{
                trigger: 'text-gray-200',
                value: 'text-gray-200'
              }}>
              {categoryInterests?.map(category => (
                <SelectItem
                  key={category.name}
                  value={category.name}
                  classNames={{
                    base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                  }}>
                  {category.name}
                </SelectItem>
              )) || []}
            </Select>
          ) : (
            <div className="mt-1">
              {user?.categoryInterest ? (
                <Chip color="primary" variant="flat" className="bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  {user.categoryInterest}
                </Chip>
              ) : (
                <p className="text-gray-500 italic">No especificado</p>
              )}
            </div>
          )}
        </div>

        {/* Etiquetas de interés */}
        {user?.tags && user.tags.length > 0 && (
          <div>
            <label className="text-sm text-gray-400">Etiquetas de interés</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.tags.map((tag, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="bg-secondary-500/20 text-secondary-300 border border-secondary-500/30">
                  {tag.name || tag}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Las etiquetas se editan desde el perfil completo</p>
          </div>
        )}

        {/* Religión */}
        <div>
          <label className="text-sm text-gray-400">Religión</label>
          {isEditing ? (
            <Select
              variant="underlined"
              placeholder="Selecciona tu religión"
              selectedKeys={editData.religionId ? [editData.religionId] : []}
              onSelectionChange={keys => handleInputChange('religionId', Array.from(keys)[0] || '')}
              className="mt-1"
              classNames={{
                trigger: 'text-gray-200',
                value: 'text-gray-200'
              }}>
              {religionOptions.map(religion => (
                <SelectItem
                  key={religion.key}
                  value={religion.key}
                  classNames={{
                    base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                  }}>
                  {religion.label}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <div className="mt-1">
              {user?.religionId ? (
                <p className="text-gray-200">{religionOptions.find(r => r.key === user.religionId)?.label || user.religionId}</p>
              ) : (
                <p className="text-gray-500 italic">No especificado</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default InterestsSection
