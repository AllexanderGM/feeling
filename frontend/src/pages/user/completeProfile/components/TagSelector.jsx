import { useState, useEffect } from 'react'
import { Input, Chip, Button, Spinner } from '@heroui/react'
import useUserTags from '@hooks/useUserTags'

const TagSelector = ({
  selectedTags = [],
  onTagsChange,
  categoryInterest = null,
  maxTags = 10,
  placeholder = 'Buscar intereses...',
  label = 'Intereses y hobbies',
  error = null
}) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestedTags, setSuggestedTags] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  const { popularTags, searchResults, loading, searchTags, getSuggestedTagsByCategory, fetchTagsByCategory } = useUserTags()

  // Cargar sugerencias según la categoría
  useEffect(() => {
    const loadSuggestions = async () => {
      if (categoryInterest) {
        try {
          const suggestions = await getSuggestedTagsByCategory(categoryInterest)
          setSuggestedTags(suggestions || [])
        } catch {
          // Fallback a tags populares
          const fallback = await fetchTagsByCategory(categoryInterest)
          setSuggestedTags(fallback || [])
        }
      } else {
        setSuggestedTags(popularTags.slice(0, 15))
      }
    }

    loadSuggestions()
  }, [categoryInterest, popularTags, getSuggestedTagsByCategory, fetchTagsByCategory])

  // Buscar tags mientras escribes
  useEffect(() => {
    if (inputValue.trim()) {
      const delayedSearch = setTimeout(() => {
        searchTags(inputValue.trim(), 10)
        setShowSuggestions(false)
      }, 300)

      return () => clearTimeout(delayedSearch)
    } else {
      setShowSuggestions(true)
    }
  }, [inputValue, searchTags])

  const addTag = tagName => {
    const normalizedTag = tagName.toLowerCase().trim()

    if (!normalizedTag) return
    if (selectedTags.includes(normalizedTag)) return
    if (selectedTags.length >= maxTags) return

    const newTags = [...selectedTags, normalizedTag]
    onTagsChange(newTags)
  }

  const removeTag = tagToRemove => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    onTagsChange(newTags)
  }

  const handleInputKeyPress = e => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
      setInputValue('')
    }
  }

  const handleTagClick = tagName => {
    addTag(tagName)
    setInputValue('')
  }

  // Tags a mostrar (sugerencias o resultados de búsqueda)
  const tagsToShow = showSuggestions ? suggestedTags : searchResults

  // Filtrar tags que ya están seleccionados
  const filteredTags = tagsToShow.filter(tag => !selectedTags.includes(tag.name?.toLowerCase() || tag.toLowerCase()))

  const canAddMoreTags = selectedTags.length < maxTags

  return (
    <div className="space-y-4">
      {/* Label y contador */}
      <div className="flex justify-between items-center">
        <label className="text-white text-sm font-medium">{label}</label>
        <span className="text-gray-400 text-xs">
          {selectedTags.length}/{maxTags}
        </span>
      </div>

      {/* Input para buscar/agregar tags */}
      <Input
        variant="underlined"
        placeholder={canAddMoreTags ? placeholder : `Máximo ${maxTags} tags alcanzado`}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyPress={handleInputKeyPress}
        isInvalid={!!error}
        errorMessage={error}
        isDisabled={!canAddMoreTags}
        endContent={
          loading ? (
            <Spinner size="sm" />
          ) : inputValue.trim() && canAddMoreTags ? (
            <Button
              size="sm"
              variant="light"
              onPress={() => {
                addTag(inputValue.trim())
                setInputValue('')
              }}>
              Agregar
            </Button>
          ) : null
        }
      />

      {/* Tags seleccionados */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-400 text-xs">Tus intereses:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <Chip key={index} onClose={() => removeTag(tag)} variant="solid" color="primary" size="sm">
                {tag}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Sugerencias de tags */}
      {canAddMoreTags && filteredTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">
              {showSuggestions
                ? categoryInterest
                  ? `Sugerencias para ${categoryInterest}:`
                  : 'Tags populares:'
                : 'Resultados de búsqueda:'}
            </p>
            <span className="text-gray-500 text-xs">Toca para agregar</span>
          </div>

          {/* Mensaje explicativo */}
          {showSuggestions && !inputValue.trim() && (
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 mb-3">
              <p className="text-blue-300 text-xs leading-relaxed">
                💡 Estas son sugerencias basadas en {categoryInterest ? 'tu categoría' : 'lo más popular'}. También puedes escribir tus
                propios intereses únicos.
              </p>
            </div>
          )}

          {/* Tags sugeridos */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {filteredTags.map((tag, index) => {
              const tagName = tag.name || tag
              const displayName = tag.displayName || tag.name || tag
              const usageCount = tag.usageCount

              return (
                <Chip
                  key={index}
                  variant="bordered"
                  color="default"
                  size="sm"
                  className="cursor-pointer hover:bg-gray-700 transition-colors group"
                  onClick={() => handleTagClick(tagName)}
                  endContent={
                    usageCount > 0 && (
                      <span className="text-xs text-gray-500 ml-1">{usageCount > 100 ? '🔥' : usageCount > 10 ? '⭐' : ''}</span>
                    )
                  }>
                  {displayName}
                </Chip>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje de ayuda */}
      <p className="text-gray-500 text-xs">Escribe para buscar o selecciona de las sugerencias. Presiona Enter para agregar.</p>
    </div>
  )
}

export default TagSelector
