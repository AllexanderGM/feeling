import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Divider, Button } from '@heroui/react'
import { Logger } from '@utils/logger.js'
import { useAuth, useLocalStorage } from '@hooks'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LoadData from '@components/layout/LoadData.jsx'
import { getUserName, getUserEmail, getUserId } from '@schemas'
import { APP_PATHS } from '@constants/paths.js'
import { STORAGE_KEYS, makeUserSpecificKey } from '@constants/cookieKeys.js'

import StepBasicInfo from './components/StepBasicInfo.jsx'
import StepPreferences from './components/StepPreferences.jsx'
import StepCharacteristics from './components/StepCharacteristics.jsx'
import StepConfiguration from './components/StepConfiguration.jsx'

const TOTAL_STEPS = 4

const ProfileComplete = () => {
  const navigate = useNavigate()
  const storage = useLocalStorage()
  const { user, loading: authLoading } = useAuth()

  // Refs para controlar el submit de cada step desde el padre
  const stepBasicInfoRef = useRef()
  const stepCharacteristicsRef = useRef()
  const stepPreferencesRef = useRef()
  const stepConfigurationRef = useRef()

  const [currentStep, setCurrentStep] = useState(() => {
    const userId = getUserId(user)
    const key = makeUserSpecificKey(STORAGE_KEYS.PROFILE_COMPLETION_DRAFT, userId)
    const saved = storage.get(key)

    return saved?.currentStep || 1
  })

  const STORAGE_KEY = useMemo(() => {
    const userId = getUserId(user)

    return makeUserSpecificKey(STORAGE_KEYS.PROFILE_COMPLETION_DRAFT, userId)
  }, [user])

  useEffect(() => {
    const progressData = {
      currentStep,
      lastUpdated: new Date().toISOString()
    }

    storage.set(STORAGE_KEY, progressData)
  }, [currentStep, STORAGE_KEY, storage])

  const handleNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFinalComplete = useCallback(() => {
    storage.remove(STORAGE_KEY)
    navigate(APP_PATHS.USER.WELCOME_ONBOARDING, { replace: true })
    Logger.info(Logger.CATEGORIES.UI, 'completar perfil', 'Perfil completado correctamente')
  }, [navigate, storage, STORAGE_KEY])

  // Función para manejar el click en "Continuar"
  const handleContinueClick = useCallback(() => {
    switch (currentStep) {
      case 1:
        stepBasicInfoRef.current?.submit()
        break
      case 2:
        stepCharacteristicsRef.current?.submit()
        break
      case 3:
        stepPreferencesRef.current?.submit()
        break
      case 4:
        stepConfigurationRef.current?.submit()
        break
      default:
        break
    }
  }, [currentStep])

  const stepInfo = useMemo(() => {
    const progress = Math.round((currentStep / TOTAL_STEPS) * 100)

    return {
      current: currentStep,
      total: TOTAL_STEPS,
      progress,
      isFirst: currentStep === 1,
      isLast: currentStep === TOTAL_STEPS
    }
  }, [currentStep])

  const stepContent = useMemo(() => {
    if (authLoading || !user) return null

    switch (currentStep) {
      case 1:
        return <StepBasicInfo ref={stepBasicInfoRef} onStepComplete={handleNextStep} />
      case 2:
        return <StepCharacteristics ref={stepCharacteristicsRef} onStepComplete={handleNextStep} />
      case 3:
        return <StepPreferences ref={stepPreferencesRef} onStepComplete={handleNextStep} />
      case 4:
        return <StepConfiguration ref={stepConfigurationRef} onStepComplete={handleFinalComplete} />
      default:
        return null
    }
  }, [currentStep, user, handleNextStep, handleFinalComplete, authLoading])

  if (authLoading) return <LoadData>Cargando datos...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  const userName = getUserName(user)
  const userEmail = getUserEmail(user)

  return (
    <main className='flex-1 flex flex-col items-center max-w-3xl mx-auto w-full'>
      <div className='w-full space-y-6'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm text-gray-400'>
              Paso {stepInfo.current} de {stepInfo.total}
            </span>
            <span className='text-sm text-gray-400'>{stepInfo.progress}%</span>
          </div>

          <div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden'>
            <div
              className='bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500'
              style={{ width: `${stepInfo.progress}%` }}
            />
          </div>
        </div>

        <header className='text-center'>
          <p className='text-gray-300'>Hola {userName}, ayúdanos a conocerte mejor</p>
          <p className='text-gray-400 text-xs'>
            Usuario asociado al correo: <span className='font-bold'>{userEmail}</span>
          </p>
        </header>

        <Divider />

        <div className='min-h-[400px]'>{stepContent}</div>

        <Divider />

        {/* Botones de navegación centralizados */}
        <div className='flex justify-between items-center pt-4'>
          {!stepInfo.isFirst ? (
            <Button variant='bordered' onPress={handlePrevStep}>
              Anterior
            </Button>
          ) : (
            <span />
          )}

          <Button color='primary' onPress={handleContinueClick}>
            {stepInfo.isLast ? 'Finalizar' : 'Continuar'}
          </Button>
        </div>

        <div className='flex justify-center gap-2'>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i + 1 === stepInfo.current ? 'bg-primary-500 scale-125' : i + 1 < stepInfo.current ? 'bg-primary-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default memo(ProfileComplete)
