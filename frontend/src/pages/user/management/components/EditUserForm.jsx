import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tabs, Tab, Button, Chip, Spinner, Card, CardBody } from '@heroui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { Lock, Sparkles, Shield, User, Settings } from 'lucide-react'
import { useUser, useError } from '@hooks'
import { mapBackendUserToFrontend } from '@utils/userMapper.js'

import StepBasicEdit from './StepBasicEdit.jsx'

const TAB_KEYS = {
  ACCESS: 'access',
  PROFILE: 'profile',
  PREFERENCES: 'preferences',
  SETTINGS: 'settings'
}

const PLACEHOLDER_SECTIONS = [
  {
    key: TAB_KEYS.PROFILE,
    icon: User,
    title: 'Información personal',
    description: 'Datos generales, características y multimedia del perfil'
  },
  {
    key: TAB_KEYS.PREFERENCES,
    icon: Shield,
    title: 'Preferencias y experiencia',
    description: 'Preferencias de compatibilidad, intereses y comportamiento'
  },
  {
    key: TAB_KEYS.SETTINGS,
    icon: Settings,
    title: 'Configuraciones avanzadas',
    description: 'Privacidad, notificaciones y controles de seguridad'
  }
]

const roleSchema = yup.object({
  email: yup.string().email('Correo inválido').required('El correo es requerido'),
  role: yup.string().required('Selecciona un rol')
})

const EditUserForm = memo(({ isOpen, onClose, user }) => {
  const { getUserByEmail, getUserProfileById, assignAdminRole, revokeAdminRole, submitting } = useUser()
  const { handleError, handleSuccess } = useError()

  const [activeTab, setActiveTab] = useState(TAB_KEYS.ACCESS)
  const [editingUser, setEditingUser] = useState(null)
  const [originalRole, setOriginalRole] = useState('CLIENT')
  const [loadingUser, setLoadingUser] = useState(false)
  const [stepSubmitting, setStepSubmitting] = useState(false)

  const roleForm = useForm({
    resolver: yupResolver(roleSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'CLIENT'
    }
  })

  const cleanupState = useCallback(() => {
    setActiveTab(TAB_KEYS.ACCESS)
    setEditingUser(null)
    setOriginalRole('CLIENT')
    setLoadingUser(false)
    setStepSubmitting(false)
    roleForm.reset({
      email: '',
      role: 'CLIENT'
    })
  }, [roleForm])

  const handleModalClose = useCallback(() => {
    cleanupState()
    onClose?.()
  }, [cleanupState, onClose])

  const resolveUserEmail = useCallback(usr => {
    if (!usr) return ''

    return usr?.email || usr?.user?.email || usr?.status?.email || usr?.profile?.email || usr?.auth?.email || ''
  }, [])

  const resolveUserId = useCallback(usr => {
    if (!usr) return ''

    return usr?.id || usr?.user?.id || usr?.profile?.id || usr?.status?.id || ''
  }, [])

  const applyUserData = useCallback(
    mappedUser => {
      if (!mappedUser) return false

      const roleValue = mappedUser?.status?.role || mappedUser?.role || 'CLIENT'
      const emailValue = resolveUserEmail(mappedUser)

      setEditingUser(mappedUser)
      setOriginalRole(roleValue)
      roleForm.reset(
        {
          email: emailValue || '',
          role: roleValue
        },
        { keepDefaultValues: false }
      )

      return true
    },
    [resolveUserEmail, roleForm]
  )

  const loadUserData = useCallback(async () => {
    if (!isOpen || !user) {
      setEditingUser(null)

      return
    }

    setLoadingUser(true)

    try {
      const fallback = mapBackendUserToFrontend(user)

      applyUserData(fallback)

      let backendData = null
      const userId = resolveUserId(user)

      if (userId) {
        const response = await getUserProfileById(userId, 'extended', false)

        backendData = response?.data ?? response?.result ?? response
      } else {
        const userEmail = resolveUserEmail(user)

        if (userEmail) {
          const response = await getUserByEmail(userEmail, false)

          backendData = response?.data ?? response?.result ?? response
        }
      }

      if (backendData) {
        const mapped = mapBackendUserToFrontend(backendData)

        applyUserData(mapped)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingUser(false)
    }
  }, [applyUserData, getUserByEmail, getUserProfileById, handleError, isOpen, resolveUserEmail, resolveUserId, user])

  useEffect(() => {
    if (isOpen) {
      loadUserData()
    } else {
      cleanupState()
    }
  }, [cleanupState, isOpen, loadUserData])

  const isBusy = submitting || stepSubmitting || loadingUser
  const hasUserLoaded = !!editingUser && !loadingUser

  const handleRoleChange = useCallback(async () => {
    if (!editingUser?.id) return

    const isValid = await roleForm.trigger('role')

    if (!isValid) return

    const newRole = roleForm.getValues('role')

    if (!newRole || newRole === originalRole) {
      handleSuccess('No hay cambios en el rol del usuario.')

      return
    }

    setStepSubmitting(true)

    try {
      const operation = newRole === 'ADMIN' ? assignAdminRole : revokeAdminRole
      const result = await operation(editingUser.id, false)

      if (result?.success === false) {
        throw new Error(result?.message || 'No se pudo actualizar el rol')
      }

      setOriginalRole(newRole)
      handleSuccess(`Rol actualizado a ${newRole === 'ADMIN' ? 'Administrador' : 'Cliente'}`)
      onClose?.()
    } catch (error) {
      handleError(error)
      roleForm.setValue('role', originalRole, { shouldDirty: false, shouldValidate: true })
    } finally {
      setStepSubmitting(false)
    }
  }, [assignAdminRole, editingUser?.id, handleError, handleSuccess, onClose, originalRole, revokeAdminRole, roleForm])

  const renderPlaceholderContent = tabKey => {
    const section = PLACEHOLDER_SECTIONS.find(item => item.key === tabKey)
    const SectionIcon = section?.icon || Lock
    const sectionTitle = section?.title || 'Funcionalidad en desarrollo'
    const sectionDescription = section?.description || 'Esta sección estará disponible en una próxima versión del panel administrativo.'

    return (
      <div className='relative min-h-[320px]'>
        <div className='absolute inset-0 z-10 flex items-center justify-center px-4'>
          <div className='bg-gray-900/95 backdrop-blur-md border border-primary/40 rounded-2xl p-8 shadow-2xl max-w-lg text-center space-y-4'>
            <div className='mx-auto w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center'>
              <SectionIcon className='w-7 h-7 text-primary' />
            </div>
            <div className='space-y-2'>
              <h4 className='text-xl font-semibold text-gray-100'>{sectionTitle}</h4>
              <p className='text-sm text-gray-400'>{sectionDescription}</p>
            </div>
            <Chip color='primary' size='lg' variant='flat'>
              Próximamente
            </Chip>
          </div>
        </div>

        <div className='blur-sm pointer-events-none select-none space-y-4'>
          <Card className='bg-gray-800/40 border border-gray-700/50'>
            <CardBody className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {PLACEHOLDER_SECTIONS.map(sectionItem => (
                <div key={sectionItem.key} className='p-4 bg-gray-900/40 rounded-lg border border-gray-700/40 space-y-2'>
                  <div className='w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center'>
                    <sectionItem.icon className='w-5 h-5 text-primary/70' />
                  </div>
                  <p className='text-sm font-semibold text-gray-200'>{sectionItem.title}</p>
                  <p className='text-xs text-gray-400'>{sectionItem.description}</p>
                  <Chip color='primary' size='sm' variant='flat'>
                    En desarrollo
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  const tabItems = useMemo(
    () => [
      { key: TAB_KEYS.ACCESS, title: 'Acceso', available: true },
      { key: TAB_KEYS.PROFILE, title: 'Perfil', available: false },
      { key: TAB_KEYS.PREFERENCES, title: 'Preferencias', available: false },
      { key: TAB_KEYS.SETTINGS, title: 'Configuraciones', available: false }
    ],
    []
  )

  const { fullName, email, roleLabel } = useMemo(() => {
    const resolvedFullName =
      editingUser?.fullName ||
      `${editingUser?.user?.name || ''} ${editingUser?.user?.lastName || ''}`.trim() ||
      editingUser?.email ||
      editingUser?.user?.email ||
      'Usuario sin nombre'

    const resolvedEmail = editingUser?.email || editingUser?.user?.email || 'Correo no disponible'
    const resolvedRole = editingUser?.status?.role || editingUser?.role || 'CLIENT'

    return {
      fullName: resolvedFullName,
      email: resolvedEmail,
      roleLabel: resolvedRole
    }
  }, [editingUser])

  const activeTabIsAccess = activeTab === TAB_KEYS.ACCESS

  return (
    <Modal
      aria-label='Modal de edición de usuario'
      classNames={{
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: 'border-[#292f46] bg-white dark:bg-gray-900'
      }}
      isOpen={isOpen}
      size='4xl'
      onClose={handleModalClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-3'>
          <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-3 w-full'>
            <div>
              <h3 className='text-lg font-semibold text-gray-100'>Editar Usuario</h3>
              <p className='text-sm text-gray-400'>{loadingUser ? 'Cargando información...' : fullName}</p>
            </div>
            <div className='text-right space-y-1'>
              <p className='text-sm text-gray-300'>{email}</p>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Rol actual: {roleLabel}</p>
            </div>
          </div>

          <Tabs
            aria-label='Secciones de edición de usuario'
            selectedKey={activeTab}
            variant='underlined'
            onSelectionChange={key => setActiveTab(key.toString())}>
            {tabItems.map(tab => (
              <Tab
                key={tab.key}
                title={
                  <div className='flex items-center gap-2'>
                    <span>{tab.title}</span>
                    {!tab.available && (
                      <Chip className='text-[10px]' color='primary' size='sm' variant='flat'>
                        Próximamente
                      </Chip>
                    )}
                  </div>
                }
              />
            ))}
          </Tabs>
        </ModalHeader>

        <ModalBody>
          <div className='min-h-[320px] py-2'>
            {loadingUser ? (
              <div className='flex items-center justify-center py-12'>
                <Spinner color='primary' size='lg' />
              </div>
            ) : activeTabIsAccess ? (
              editingUser ? (
                <StepBasicEdit control={roleForm.control} errors={roleForm.formState.errors} userData={editingUser} />
              ) : (
                <div className='p-6 text-center text-gray-400'>No se pudo cargar la información del usuario seleccionado.</div>
              )
            ) : (
              renderPlaceholderContent(activeTab)
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className='flex justify-between items-center w-full'>
            <Button color='danger' variant='light' onPress={handleModalClose}>
              Cancelar
            </Button>

            <Button
              color='primary'
              endContent={!isBusy ? <Sparkles className='w-4 h-4' /> : null}
              isDisabled={isBusy || !hasUserLoaded}
              isLoading={activeTabIsAccess && stepSubmitting}
              onPress={activeTabIsAccess ? handleRoleChange : handleModalClose}>
              {activeTabIsAccess ? 'Guardar cambios' : 'Entendido'}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

EditUserForm.displayName = 'EditUserForm'

export default EditUserForm
