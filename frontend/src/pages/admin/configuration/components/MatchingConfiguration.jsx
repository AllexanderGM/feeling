import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Input, Button, Switch, Select, SelectItem, Divider, Chip, Slider } from '@heroui/react'
import { Heart, Save, Target, Zap, Users, TrendingUp, Calendar, MapPin } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const MATCHING_ALGORITHMS = [
  { key: 'basic', label: 'Básico', description: 'Coincidencias por edad y ubicación' },
  { key: 'advanced', label: 'Avanzado', description: 'Incluye intereses y compatibilidad' },
  { key: 'ai_powered', label: 'IA Avanzada', description: 'Machine learning y análisis de comportamiento' }
]

const AGE_RANGES = [
  { key: '18-25', label: '18-25 años' },
  { key: '26-35', label: '26-35 años' },
  { key: '36-45', label: '36-45 años' },
  { key: '46-55', label: '46-55 años' },
  { key: '56+', label: '56+ años' }
]

const MatchingConfiguration = ({ config, loading }) => {
  const { updateMatchingConfiguration } = useConfiguration()

  const [formData, setFormData] = useState({
    algorithm: 'advanced',
    maxDistance: 50,
    ageRangeFlexibility: 5,
    interestWeighting: 70,
    locationWeighting: 60,
    activityWeighting: 50,
    dailyMatchLimit: 10,
    premiumMatchLimit: 25,
    enableSmartMatching: true,
    enableLocationMatching: true,
    enableInterestMatching: true,
    enableAgePreferences: true,
    enableProfileCompletion: true,
    minimumProfileCompletion: 70,
    cooldownPeriod: 24,
    enableMatchExpiration: true,
    matchExpirationDays: 7,
    enableSuperLikes: true,
    superLikesPerDay: 1,
    premiumSuperLikesPerDay: 5,
    enableBoosts: true,
    boostDuration: 30,
    enableMatchAnalytics: true
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Cargar datos cuando llegue la configuración
  useEffect(() => {
    if (config) {
      setFormData({
        algorithm: config.algorithm || 'advanced',
        maxDistance: config.maxDistance || 50,
        ageRangeFlexibility: config.ageRangeFlexibility || 5,
        interestWeighting: config.interestWeighting || 70,
        locationWeighting: config.locationWeighting || 60,
        activityWeighting: config.activityWeighting || 50,
        dailyMatchLimit: config.dailyMatchLimit || 10,
        premiumMatchLimit: config.premiumMatchLimit || 25,
        enableSmartMatching: config.enableSmartMatching !== false,
        enableLocationMatching: config.enableLocationMatching !== false,
        enableInterestMatching: config.enableInterestMatching !== false,
        enableAgePreferences: config.enableAgePreferences !== false,
        enableProfileCompletion: config.enableProfileCompletion !== false,
        minimumProfileCompletion: config.minimumProfileCompletion || 70,
        cooldownPeriod: config.cooldownPeriod || 24,
        enableMatchExpiration: config.enableMatchExpiration !== false,
        matchExpirationDays: config.matchExpirationDays || 7,
        enableSuperLikes: config.enableSuperLikes !== false,
        superLikesPerDay: config.superLikesPerDay || 1,
        premiumSuperLikesPerDay: config.premiumSuperLikesPerDay || 5,
        enableBoosts: config.enableBoosts !== false,
        boostDuration: config.boostDuration || 30,
        enableMatchAnalytics: config.enableMatchAnalytics !== false
      })
    }
  }, [config])

  const validateForm = () => {
    const newErrors = {}

    if (formData.maxDistance < 1 || formData.maxDistance > 500) {
      newErrors.maxDistance = 'La distancia debe estar entre 1 y 500 km'
    }

    if (formData.dailyMatchLimit < 1 || formData.dailyMatchLimit > 100) {
      newErrors.dailyMatchLimit = 'El límite debe estar entre 1 y 100'
    }

    if (formData.minimumProfileCompletion < 30 || formData.minimumProfileCompletion > 100) {
      newErrors.minimumProfileCompletion = 'Debe estar entre 30% y 100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      await updateMatchingConfiguration(formData)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'save_matching_config', 'Error guardando configuración de matching admin', { error })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const selectedAlgorithm = MATCHING_ALGORITHMS.find(alg => alg.key === formData.algorithm)

  return (
    <div className='space-y-6'>
      {/* Algoritmo de matching */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center'>
            <Heart className='w-5 h-5 text-pink-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Algoritmo de Matching</p>
            <p className='text-small text-gray-400'>Configuración del motor de coincidencias</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <Select
            label='Algoritmo Principal'
            selectedKeys={formData.algorithm ? [formData.algorithm] : []}
            onSelectionChange={keys => handleInputChange('algorithm', Array.from(keys)[0] || '')}
            classNames={{
              trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
              value: 'text-gray-200'
            }}>
            {MATCHING_ALGORITHMS.map(algorithm => (
              <SelectItem key={algorithm.key} value={algorithm.key} description={algorithm.description}>
                {algorithm.label}
              </SelectItem>
            ))}
          </Select>

          {selectedAlgorithm && (
            <div className='p-4 bg-pink-900/10 border border-pink-700/30 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Heart className='w-4 h-4 text-pink-400' />
                <span className='font-medium text-pink-300'>{selectedAlgorithm.label}</span>
              </div>
              <p className='text-sm text-pink-200/80'>{selectedAlgorithm.description}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Parámetros de matching */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Target className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Parámetros de Matching</p>
            <p className='text-small text-gray-400'>Configuración de pesos y rangos</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-300 mb-2 block'>Distancia Máxima: {formData.maxDistance} km</label>
                <Slider
                  size='md'
                  step={5}
                  minValue={5}
                  maxValue={200}
                  value={formData.maxDistance}
                  onChange={value => handleInputChange('maxDistance', value)}
                  className='max-w-md'
                  startContent={<MapPin className='w-4 h-4 text-gray-400' />}
                  classNames={{
                    base: 'max-w-md',
                    track: 'bg-gray-700',
                    filler: 'bg-blue-500'
                  }}
                />
              </div>

              <div>
                <label className='text-sm font-medium text-gray-300 mb-2 block'>
                  Flexibilidad de Edad: ±{formData.ageRangeFlexibility} años
                </label>
                <Slider
                  size='md'
                  step={1}
                  minValue={0}
                  maxValue={15}
                  value={formData.ageRangeFlexibility}
                  onChange={value => handleInputChange('ageRangeFlexibility', value)}
                  className='max-w-md'
                  startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                  classNames={{
                    base: 'max-w-md',
                    track: 'bg-gray-700',
                    filler: 'bg-green-500'
                  }}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-300 mb-2 block'>Peso de Intereses: {formData.interestWeighting}%</label>
                <Slider
                  size='md'
                  step={5}
                  minValue={0}
                  maxValue={100}
                  value={formData.interestWeighting}
                  onChange={value => handleInputChange('interestWeighting', value)}
                  className='max-w-md'
                  startContent={<Heart className='w-4 h-4 text-gray-400' />}
                  classNames={{
                    base: 'max-w-md',
                    track: 'bg-gray-700',
                    filler: 'bg-purple-500'
                  }}
                />
              </div>

              <div>
                <label className='text-sm font-medium text-gray-300 mb-2 block'>Peso de Ubicación: {formData.locationWeighting}%</label>
                <Slider
                  size='md'
                  step={5}
                  minValue={0}
                  maxValue={100}
                  value={formData.locationWeighting}
                  onChange={value => handleInputChange('locationWeighting', value)}
                  className='max-w-md'
                  startContent={<MapPin className='w-4 h-4 text-gray-400' />}
                  classNames={{
                    base: 'max-w-md',
                    track: 'bg-gray-700',
                    filler: 'bg-orange-500'
                  }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Límites y restricciones */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center'>
            <TrendingUp className='w-5 h-5 text-yellow-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Límites y Restricciones</p>
            <p className='text-small text-gray-400'>Control de uso y calidad</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              type='number'
              label='Matches Diarios (Usuarios Básicos)'
              value={formData.dailyMatchLimit.toString()}
              onChange={e => handleInputChange('dailyMatchLimit', parseInt(e.target.value) || 0)}
              isInvalid={!!errors.dailyMatchLimit}
              errorMessage={errors.dailyMatchLimit}
              min='1'
              max='100'
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Matches Diarios (Premium)'
              value={formData.premiumMatchLimit.toString()}
              onChange={e => handleInputChange('premiumMatchLimit', parseInt(e.target.value) || 0)}
              min='1'
              max='100'
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Perfil Mínimo Completo (%)'
              value={formData.minimumProfileCompletion.toString()}
              onChange={e => handleInputChange('minimumProfileCompletion', parseInt(e.target.value) || 0)}
              isInvalid={!!errors.minimumProfileCompletion}
              errorMessage={errors.minimumProfileCompletion}
              min='30'
              max='100'
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              type='number'
              label='Período de Espera (horas)'
              value={formData.cooldownPeriod.toString()}
              onChange={e => handleInputChange('cooldownPeriod', parseInt(e.target.value) || 0)}
              description='Tiempo entre intentos de match fallidos'
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Expiración de Matches (días)'
              value={formData.matchExpirationDays.toString()}
              onChange={e => handleInputChange('matchExpirationDays', parseInt(e.target.value) || 0)}
              description='Días antes de que expire un match'
              isDisabled={!formData.enableMatchExpiration}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Funcionalidades premium */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center'>
            <Zap className='w-5 h-5 text-amber-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Funcionalidades Premium</p>
            <p className='text-small text-gray-400'>Super Likes, Boosts y características especiales</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <Switch
                  isSelected={formData.enableSuperLikes}
                  onValueChange={value => handleInputChange('enableSuperLikes', value)}
                  color='warning'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Super Likes</span>
                <Chip size='sm' variant='flat' color={formData.enableSuperLikes ? 'warning' : 'default'}>
                  {formData.enableSuperLikes ? 'Habilitados' : 'Deshabilitados'}
                </Chip>
              </div>
              <div className='flex gap-2'>
                <Input
                  type='number'
                  size='sm'
                  label='Básicos/día'
                  value={formData.superLikesPerDay.toString()}
                  onChange={e => handleInputChange('superLikesPerDay', parseInt(e.target.value) || 0)}
                  isDisabled={!formData.enableSuperLikes}
                  className='w-24'
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600'
                  }}
                />
                <Input
                  type='number'
                  size='sm'
                  label='Premium/día'
                  value={formData.premiumSuperLikesPerDay.toString()}
                  onChange={e => handleInputChange('premiumSuperLikesPerDay', parseInt(e.target.value) || 0)}
                  isDisabled={!formData.enableSuperLikes}
                  className='w-24'
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600'
                  }}
                />
              </div>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <Switch
                  isSelected={formData.enableBoosts}
                  onValueChange={value => handleInputChange('enableBoosts', value)}
                  color='primary'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Profile Boosts</span>
                <Chip size='sm' variant='flat' color={formData.enableBoosts ? 'primary' : 'default'}>
                  {formData.enableBoosts ? 'Habilitados' : 'Deshabilitados'}
                </Chip>
              </div>
              <Input
                type='number'
                size='sm'
                label='Duración (min)'
                value={formData.boostDuration.toString()}
                onChange={e => handleInputChange('boostDuration', parseInt(e.target.value) || 0)}
                isDisabled={!formData.enableBoosts}
                className='w-32'
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-800/50 border-gray-600'
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Configuraciones adicionales */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
            <Users className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuraciones Adicionales</p>
            <p className='text-small text-gray-400'>Características del sistema de matching</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableSmartMatching}
                    onValueChange={value => handleInputChange('enableSmartMatching', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Smart Matching</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableSmartMatching ? 'primary' : 'default'}>
                  {formData.enableSmartMatching ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableLocationMatching}
                    onValueChange={value => handleInputChange('enableLocationMatching', value)}
                    color='success'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Matching por Ubicación</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableLocationMatching ? 'success' : 'default'}>
                  {formData.enableLocationMatching ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableInterestMatching}
                    onValueChange={value => handleInputChange('enableInterestMatching', value)}
                    color='warning'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Matching por Intereses</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableInterestMatching ? 'warning' : 'default'}>
                  {formData.enableInterestMatching ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableAgePreferences}
                    onValueChange={value => handleInputChange('enableAgePreferences', value)}
                    color='secondary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Preferencias de Edad</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableAgePreferences ? 'secondary' : 'default'}>
                  {formData.enableAgePreferences ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableMatchExpiration}
                    onValueChange={value => handleInputChange('enableMatchExpiration', value)}
                    color='danger'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Expiración de Matches</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableMatchExpiration ? 'danger' : 'default'}>
                  {formData.enableMatchExpiration ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableMatchAnalytics}
                    onValueChange={value => handleInputChange('enableMatchAnalytics', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Analytics de Matches</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableMatchAnalytics ? 'primary' : 'default'}>
                  {formData.enableMatchAnalytics ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Botón de guardar */}
      <div className='flex justify-end'>
        <Button
          color='primary'
          onPress={handleSubmit}
          isLoading={saving || loading}
          startContent={!saving && !loading && <Save className='w-3 h-3' />}
          size='sm'>
          Guardar
        </Button>
      </div>
    </div>
  )
}

export default MatchingConfiguration
