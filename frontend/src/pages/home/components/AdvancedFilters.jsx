import { useState, useMemo, useCallback } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Slider,
  Chip,
  Switch,
  Card,
  CardBody,
  Divider,
  RadioGroup,
  Radio,
  Accordion,
  AccordionItem
} from '@heroui/react'
import { Sparkles, Flame, Star, Heart, Filter, RotateCcw, MapPin, Calendar, Users } from 'lucide-react'
import { useUserInterests } from '@hooks'

const AdvancedFilters = ({ isOpen, onOpenChange, onApplyFilters, currentFilters = {} }) => {
  const { interestOptions, loading: interestsLoading } = useUserInterests()
  
  // Estados de filtros locales
  const [filters, setFilters] = useState({
    // Filtros básicos
    categoryInterest: currentFilters.categoryInterest || 'all',
    ageMin: currentFilters.ageMin || 18,
    ageMax: currentFilters.ageMax || 65,
    distance: currentFilters.distance || 50,
    
    // Filtros avanzados de relación
    relationshipType: currentFilters.relationshipType || 'all', // all, serious, casual, friendship
    
    // Filtros de actividad
    showOnlineOnly: currentFilters.showOnlineOnly || false,
    showRecentActivity: currentFilters.showRecentActivity || false,
    
    // Filtros de verificación
    showVerifiedOnly: currentFilters.showVerifiedOnly || false,
    showWithPhotosOnly: currentFilters.showWithPhotosOnly || true,
    
    // Filtros de compatibilidad
    minCompatibility: currentFilters.minCompatibility || 0,
    
    // Filtros de educación y trabajo
    educationLevel: currentFilters.educationLevel || 'all',
    hasJob: currentFilters.hasJob || 'all',
    
    // Filtros de preferencias
    smokingPreference: currentFilters.smokingPreference || 'all',
    drinkingPreference: currentFilters.drinkingPreference || 'all',
    
    // Ordenamiento
    sortBy: currentFilters.sortBy || 'compatibility' // compatibility, distance, activity, newest
  })

  // Opciones de filtros
  const relationshipOptions = [
    { key: 'all', label: 'Todos los tipos' },
    { key: 'serious', label: 'Relación seria' },
    { key: 'casual', label: 'Relación casual' },
    { key: 'friendship', label: 'Amistad' },
    { key: 'dating', label: 'Citas' }
  ]

  const educationOptions = [
    { key: 'all', label: 'Todos los niveles' },
    { key: 'high_school', label: 'Bachillerato' },
    { key: 'technical', label: 'Técnico' },
    { key: 'university', label: 'Universitario' },
    { key: 'postgraduate', label: 'Posgrado' }
  ]

  const jobOptions = [
    { key: 'all', label: 'Todos' },
    { key: 'employed', label: 'Empleado/a' },
    { key: 'student', label: 'Estudiante' },
    { key: 'entrepreneur', label: 'Emprendedor/a' },
    { key: 'freelance', label: 'Independiente' }
  ]

  const preferenceOptions = [
    { key: 'all', label: 'Indiferente' },
    { key: 'yes', label: 'Sí' },
    { key: 'no', label: 'No' },
    { key: 'occasionally', label: 'Ocasionalmente' }
  ]

  const sortOptions = [
    { key: 'compatibility', label: 'Mayor compatibilidad' },
    { key: 'distance', label: 'Menor distancia' },
    { key: 'activity', label: 'Más activos' },
    { key: 'newest', label: 'Más recientes' }
  ]

  // Obtener icono de categoría
  const getCategoryIcon = (categoryKey) => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-4 h-4 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-4 h-4 text-red-400' />
      case 'SPIRIT':
        return <Star className='w-4 h-4 text-purple-400' />
      default:
        return <Heart className='w-4 h-4 text-gray-400' />
    }
  }

  // Manejadores de cambio
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }, [])

  const handleAgeRangeChange = useCallback((value) => {
    setFilters(prev => ({
      ...prev,
      ageMin: value[0],
      ageMax: value[1]
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      categoryInterest: 'all',
      ageMin: 18,
      ageMax: 65,
      distance: 50,
      relationshipType: 'all',
      showOnlineOnly: false,
      showRecentActivity: false,
      showVerifiedOnly: false,
      showWithPhotosOnly: true,
      minCompatibility: 0,
      educationLevel: 'all',
      hasJob: 'all',
      smokingPreference: 'all',
      drinkingPreference: 'all',
      sortBy: 'compatibility'
    })
  }, [])

  const applyFilters = useCallback(() => {
    onApplyFilters(filters)
    onOpenChange(false)
  }, [filters, onApplyFilters, onOpenChange])

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.categoryInterest !== 'all') count++
    if (filters.ageMin !== 18 || filters.ageMax !== 65) count++
    if (filters.distance !== 50) count++
    if (filters.relationshipType !== 'all') count++
    if (filters.showOnlineOnly) count++
    if (filters.showRecentActivity) count++
    if (filters.showVerifiedOnly) count++
    if (!filters.showWithPhotosOnly) count++
    if (filters.minCompatibility > 0) count++
    if (filters.educationLevel !== 'all') count++
    if (filters.hasJob !== 'all') count++
    if (filters.smokingPreference !== 'all') count++
    if (filters.drinkingPreference !== 'all') count++
    if (filters.sortBy !== 'compatibility') count++
    return count
  }, [filters])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      placement="center"
      classNames={{
        base: "bg-gray-900/95 backdrop-blur-sm",
        header: "border-b border-gray-700/50",
        body: "py-4",
        footer: "border-t border-gray-700/50"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-primary-400" />
                  <h3 className="text-lg font-semibold text-gray-200">Filtros Avanzados</h3>
                  {activeFiltersCount > 0 && (
                    <Chip size="sm" color="primary" variant="flat">
                      {activeFiltersCount} activos
                    </Chip>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="light"
                  startContent={<RotateCcw className="w-4 h-4" />}
                  onPress={resetFilters}
                  className="text-gray-400"
                >
                  Limpiar
                </Button>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-6">
                {/* Filtros Básicos */}
                <Card className="bg-gray-800/30 border-gray-700/30">
                  <CardBody className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-200 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Filtros Básicos
                    </h4>

                    {/* Categoría de interés */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Categoría de interés</label>
                      <Select
                        selectedKeys={filters.categoryInterest ? [filters.categoryInterest] : []}
                        onSelectionChange={(keys) => handleFilterChange('categoryInterest', Array.from(keys)[0])}
                        placeholder="Selecciona una categoría"
                        classNames={{
                          trigger: "bg-gray-800/50 border-gray-600",
                          value: "text-gray-200"
                        }}
                      >
                        <SelectItem key="all" textValue="Todas las categorías">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-gray-400" />
                            <span>Todas las categorías</span>
                          </div>
                        </SelectItem>
                        {interestOptions.map((option) => (
                          <SelectItem key={option.key} textValue={option.label}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(option.key)}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Rango de edad */}
                    <div>
                      <label className="text-sm text-gray-300 mb-3 block">
                        Rango de edad: {filters.ageMin} - {filters.ageMax} años
                      </label>
                      <Slider
                        step={1}
                        minValue={18}
                        maxValue={80}
                        value={[filters.ageMin, filters.ageMax]}
                        onChange={handleAgeRangeChange}
                        className="w-full"
                        color="primary"
                        marks={[
                          { value: 18, label: "18" },
                          { value: 30, label: "30" },
                          { value: 50, label: "50" },
                          { value: 65, label: "65" },
                          { value: 80, label: "80" }
                        ]}
                      />
                    </div>

                    {/* Distancia */}
                    <div>
                      <label className="text-sm text-gray-300 mb-3 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Distancia máxima: {filters.distance} km
                      </label>
                      <Slider
                        step={5}
                        minValue={5}
                        maxValue={200}
                        value={filters.distance}
                        onChange={(value) => handleFilterChange('distance', value)}
                        className="w-full"
                        color="primary"
                        marks={[
                          { value: 5, label: "5km" },
                          { value: 50, label: "50km" },
                          { value: 100, label: "100km" },
                          { value: 200, label: "200km" }
                        ]}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Filtros Avanzados en Accordion */}
                <Accordion variant="bordered" className="bg-gray-800/30 border-gray-700/30">
                  {/* Preferencias de Relación */}
                  <AccordionItem
                    key="relationship"
                    aria-label="Preferencias de Relación"
                    title={
                      <span className="text-gray-200 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Preferencias de Relación
                      </span>
                    }
                  >
                    <div className="space-y-4 pb-4">
                      <Select
                        label="Tipo de relación buscada"
                        selectedKeys={filters.relationshipType ? [filters.relationshipType] : []}
                        onSelectionChange={(keys) => handleFilterChange('relationshipType', Array.from(keys)[0])}
                        classNames={{
                          trigger: "bg-gray-800/50 border-gray-600",
                          value: "text-gray-200"
                        }}
                      >
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <div>
                        <label className="text-sm text-gray-300 mb-3 block">
                          Compatibilidad mínima: {filters.minCompatibility}%
                        </label>
                        <Slider
                          step={5}
                          minValue={0}
                          maxValue={100}
                          value={filters.minCompatibility}
                          onChange={(value) => handleFilterChange('minCompatibility', value)}
                          className="w-full"
                          color="danger"
                          marks={[
                            { value: 0, label: "0%" },
                            { value: 50, label: "50%" },
                            { value: 80, label: "80%" },
                            { value: 100, label: "100%" }
                          ]}
                        />
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Actividad y Verificación */}
                  <AccordionItem
                    key="activity"
                    aria-label="Actividad y Verificación"
                    title={
                      <span className="text-gray-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Actividad y Verificación
                      </span>
                    }
                  >
                    <div className="space-y-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Switch
                          isSelected={filters.showOnlineOnly}
                          onValueChange={(value) => handleFilterChange('showOnlineOnly', value)}
                          classNames={{
                            base: "flex-row-reverse max-w-full justify-between",
                            wrapper: "mr-0"
                          }}
                        >
                          <span className="text-sm text-gray-300">Solo usuarios en línea</span>
                        </Switch>

                        <Switch
                          isSelected={filters.showRecentActivity}
                          onValueChange={(value) => handleFilterChange('showRecentActivity', value)}
                          classNames={{
                            base: "flex-row-reverse max-w-full justify-between",
                            wrapper: "mr-0"
                          }}
                        >
                          <span className="text-sm text-gray-300">Activos recientemente</span>
                        </Switch>

                        <Switch
                          isSelected={filters.showVerifiedOnly}
                          onValueChange={(value) => handleFilterChange('showVerifiedOnly', value)}
                          classNames={{
                            base: "flex-row-reverse max-w-full justify-between",
                            wrapper: "mr-0"
                          }}
                        >
                          <span className="text-sm text-gray-300">Solo perfiles verificados</span>
                        </Switch>

                        <Switch
                          isSelected={filters.showWithPhotosOnly}
                          onValueChange={(value) => handleFilterChange('showWithPhotosOnly', value)}
                          classNames={{
                            base: "flex-row-reverse max-w-full justify-between",
                            wrapper: "mr-0"
                          }}
                        >
                          <span className="text-sm text-gray-300">Solo con fotos</span>
                        </Switch>
                      </div>
                    </div>
                  </AccordionItem>

                  {/* Educación y Trabajo */}
                  <AccordionItem
                    key="education"
                    aria-label="Educación y Trabajo"
                    title={
                      <span className="text-gray-200 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Educación y Trabajo
                      </span>
                    }
                  >
                    <div className="space-y-4 pb-4">
                      <Select
                        label="Nivel educativo"
                        selectedKeys={filters.educationLevel ? [filters.educationLevel] : []}
                        onSelectionChange={(keys) => handleFilterChange('educationLevel', Array.from(keys)[0])}
                        classNames={{
                          trigger: "bg-gray-800/50 border-gray-600",
                          value: "text-gray-200"
                        }}
                      >
                        {educationOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Situación laboral"
                        selectedKeys={filters.hasJob ? [filters.hasJob] : []}
                        onSelectionChange={(keys) => handleFilterChange('hasJob', Array.from(keys)[0])}
                        classNames={{
                          trigger: "bg-gray-800/50 border-gray-600",
                          value: "text-gray-200"
                        }}
                      >
                        {jobOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </AccordionItem>

                  {/* Preferencias de Estilo de Vida */}
                  <AccordionItem
                    key="lifestyle"
                    aria-label="Estilo de Vida"
                    title={
                      <span className="text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Estilo de Vida
                      </span>
                    }
                  >
                    <div className="space-y-4 pb-4">
                      <Select
                        label="Fumar"
                        selectedKeys={filters.smokingPreference ? [filters.smokingPreference] : []}
                        onSelectionChange={(keys) => handleFilterChange('smokingPreference', Array.from(keys)[0])}
                        classNames={{
                          trigger: "bg-gray-800/50 border-gray-600",
                          value: "text-gray-200"
                        }}
                      >
                        {preferenceOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Beber alcohol"
                        selectedKeys={filters.drinkingPreference ? [filters.drinkingPreference] : []}
                        onSelectionChange={(keys) => handleFilterChange('drinkingPreference', Array.from(keys)[0])}
                        classNames={{
                          trigger: "bg-gray-800/50 border-gray-600",
                          value: "text-gray-200"
                        }}
                      >
                        {preferenceOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </AccordionItem>
                </Accordion>

                {/* Ordenamiento */}
                <Card className="bg-gray-800/30 border-gray-700/30">
                  <CardBody className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-200">Ordenar por</h4>
                    <RadioGroup
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                      classNames={{
                        wrapper: "grid grid-cols-2 gap-3"
                      }}
                    >
                      {sortOptions.map((option) => (
                        <Radio key={option.key} value={option.key} classNames={{
                          base: "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-3 transition-colors",
                          wrapper: "hidden"
                        }}>
                          <span className="text-sm text-gray-300">{option.label}</span>
                        </Radio>
                      ))}
                    </RadioGroup>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex gap-3 w-full">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={applyFilters}
                  className="flex-1"
                  startContent={<Filter className="w-4 h-4" />}
                >
                  Aplicar Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AdvancedFilters