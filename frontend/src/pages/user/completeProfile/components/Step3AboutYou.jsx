import { Textarea, Input, Select, SelectItem } from '@heroui/react'
import { useUserAttributes } from '@hooks/useUserAttributes.js'

import TagSelector from './TagSelector.jsx'

const Step3AboutYou = ({ formData, errors, handleInputChange }) => {
  const { religionOptions, maritalStatusOptions, loading } = useUserAttributes()

  if (loading) {
    return <div className="text-white">Cargando opciones...</div>
  }

  const educationOptions = [
    { key: 'secundaria', label: 'Secundaria' },
    { key: 'tecnico', label: 'Técnico' },
    { key: 'universitario', label: 'Universitario' },
    { key: 'posgrado', label: 'Posgrado' },
    { key: 'otro', label: 'Otro' }
  ]

  // Función helper para validar keys
  const getValidSelectedKeys = (value, collection) => {
    if (!value) return []
    const exists = collection.some(item => item.key === value)
    return exists ? [value] : []
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-6">Acerca de ti</h3>

      <Textarea
        variant="underlined"
        isRequired
        label="Descripción personal"
        placeholder="Cuéntanos sobre ti, tus intereses y lo que buscas..."
        value={formData.description}
        onChange={e => handleInputChange('description', e.target.value)}
        isInvalid={!!errors.description}
        errorMessage={errors.description}
        minRows={3}
        maxRows={6}
        maxLength={500}
      />

      {/* Reemplazado: Sistema de tags inteligente */}
      <TagSelector
        selectedTags={formData.tags || []}
        onTagsChange={tags => handleInputChange('tags', tags)}
        categoryInterest={formData.categoryInterest}
        maxTags={10}
        error={errors.tags}
        label="Intereses y hobbies *"
        placeholder="Busca tus intereses..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          variant="underlined"
          label="Religión"
          placeholder="Selecciona"
          selectedKeys={getValidSelectedKeys(formData.religionId, religionOptions)}
          onSelectionChange={keys => handleInputChange('religionId', Array.from(keys)[0])}>
          {religionOptions.map(option => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          variant="underlined"
          label="Estado civil"
          placeholder="Selecciona"
          selectedKeys={getValidSelectedKeys(formData.maritalStatusId, maritalStatusOptions)}
          onSelectionChange={keys => handleInputChange('maritalStatusId', Array.from(keys)[0])}>
          {maritalStatusOptions.map(option => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          variant="underlined"
          label="Profesión"
          placeholder="Tu profesión"
          value={formData.profession}
          onChange={e => handleInputChange('profession', e.target.value)}
        />

        <Select
          variant="underlined"
          label="Nivel de estudios"
          placeholder="Selecciona"
          selectedKeys={getValidSelectedKeys(formData.education, educationOptions)}
          onSelectionChange={keys => handleInputChange('education', Array.from(keys)[0])}>
          {educationOptions.map(option => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default Step3AboutYou
