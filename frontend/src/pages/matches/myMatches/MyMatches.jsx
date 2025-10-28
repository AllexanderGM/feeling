import { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Chip,
  Avatar,
  Card,
  CardBody,
  Button,
  Spinner,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'
import {
  Heart,
  Send,
  Inbox,
  Eye,
  Search,
  Clock,
  CheckCheck,
  X,
  MessageCircle,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  Undo2,
  XCircle,
  Check,
  Mail
} from 'lucide-react'
import { useError, useMatchInteractions, useMyMatchesData } from '@hooks'
import { APP_PATHS } from '@constants/paths'
import { Logger } from '@utils/logger.js'
import { formatJavaDateForDisplay, calculateAgeFromJavaDate } from '@utils/dateUtils.js'
import LiteContainer from '@components/layout/LiteContainer.jsx'

const MyMatches = memo(() => {
  const navigate = useNavigate()
  const { handleError, handleSuccess } = useError()
  const {
    withdrawMatch: withdrawMatchAction,
    acceptMatch: acceptMatchAction,
    rejectMatch: rejectMatchAction,
    loading: interactionLoading
  } = useMatchInteractions()
  const { state: matchState, loadByType, loadMoreByType, loading: matchesLoading, loadingMore } = useMyMatchesData()

  const [selectedTab, setSelectedTab] = useState('all')

  const { items: allMatches, pagination: allPagination } = matchState.all || {
    items: [],
    pagination: { page: 0, size: 10, totalPages: 0, totalElements: 0 }
  }
  const { items: acceptedMatches, pagination: acceptedPagination } = matchState.accepted || {
    items: [],
    pagination: { page: 0, size: 10, totalPages: 0, totalElements: 0 }
  }
  const { items: sentMatches, pagination: sentPagination } = matchState.sent || {
    items: [],
    pagination: { page: 0, size: 10, totalPages: 0, totalElements: 0 }
  }
  const { items: receivedMatches, pagination: receivedPagination } = matchState.received || {
    items: [],
    pagination: { page: 0, size: 10, totalPages: 0, totalElements: 0 }
  }

  // Búsqueda
  const [searchQueries, setSearchQueries] = useState({
    all: '',
    accepted: '',
    sent: '',
    received: ''
  })

  // Modal de WhatsApp
  const { isOpen: isWhatsAppModalOpen, onOpen: onWhatsAppModalOpen, onOpenChange: onWhatsAppModalOpenChange } = useDisclosure()
  const [selectedUserForWhatsApp, setSelectedUserForWhatsApp] = useState(null)

  // Modal de Email
  const { isOpen: isEmailModalOpen, onOpen: onEmailModalOpen, onOpenChange: onEmailModalOpenChange } = useDisclosure()
  const [selectedUserForEmail, setSelectedUserForEmail] = useState(null)

  // Modal de retirar match
  const { isOpen: isWithdrawModalOpen, onOpen: onWithdrawModalOpen, onOpenChange: onWithdrawModalOpenChange } = useDisclosure()
  const [matchPendingWithdraw, setMatchPendingWithdraw] = useState(null)

  // Modales de aceptar/rechazar match
  const { isOpen: isAcceptModalOpen, onOpen: onAcceptModalOpen, onOpenChange: onAcceptModalOpenChange } = useDisclosure()
  const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onOpenChange: onRejectModalOpenChange } = useDisclosure()
  const [matchPendingAction, setMatchPendingAction] = useState(null)

  useEffect(() => {
    if (selectedTab === 'all' || matchesLoading) return

    const current = matchState[selectedTab]
    const items = current?.items ?? []

    if (items.length > 0) return

    const size = current?.pagination?.size || 10

    loadByType({ type: selectedTab, page: 0, size }).catch(error => {
      Logger.error(Logger.CATEGORIES.SERVICE, 'load_matches_tab', 'Error cargando matches por tab', {
        error,
        selectedTab
      })
    })
  }, [loadByType, matchState, matchesLoading, selectedTab])

  // Ref para el elemento al final de la lista (infinite scroll)
  const loadMoreRef = useRef(null)

  // Función para cargar más según el tab actual
  const loadMoreMatches = useCallback(() => {
    if (loadingMore || matchesLoading) return

    const current = matchState[selectedTab]

    if (!current?.pagination) return

    const { pagination } = current

    if (pagination.page >= pagination.totalPages - 1) return

    loadMoreByType(selectedTab).catch(error => {
      Logger.error(Logger.CATEGORIES.SERVICE, 'load_more_matches', 'Error cargando más matches', {
        error,
        selectedTab
      })
    })
  }, [loadMoreByType, loadingMore, matchesLoading, matchState, selectedTab])

  // Intersection Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries

        if (entry.isIntersecting && !matchesLoading && !loadingMore) {
          loadMoreMatches()
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    const currentRef = loadMoreRef.current

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMoreMatches, matchesLoading, loadingMore])

  // Ver perfil de usuario
  const getCounterpartUser = useCallback(matchData => {
    // Con MatchHistoryItemDTO, el backend ya nos da el "otherUser"
    // que es siempre la otra persona en el match
    const otherUserResponse = matchData?.otherUser

    return otherUserResponse?.user || null
  }, [])

  const handleViewProfile = useCallback(
    matchData => {
      const otherUser = getCounterpartUser(matchData)
      const userId = otherUser?.id

      if (userId) {
        navigate(`${APP_PATHS.USER.PROFILE_BY_ID.replace(':userId', userId)}`)
      }
    },
    [navigate, getCounterpartUser]
  )

  // Abrir modal de WhatsApp
  const handleOpenWhatsApp = useCallback(
    matchData => {
      const otherUser = getCounterpartUser(matchData) || {}
      const userName = `${otherUser.name || ''} ${otherUser.lastName || ''}`.trim()
      const phone = otherUser.phone
      const phoneCode = otherUser.phoneCode || '+57'

      if (!phone) {
        Logger.warn(Logger.CATEGORIES.UI, 'open_whatsapp', 'Usuario no tiene número de teléfono')

        return
      }

      setSelectedUserForWhatsApp({
        name: userName,
        phone,
        phoneCode,
        fullPhone: `${phoneCode}${phone}`.replace(/\+/g, '').replace(/\s/g, ''),
        avatar: otherUser.mainImage?.url || otherUser.mainImage
      })
      onWhatsAppModalOpen()
    },
    [onWhatsAppModalOpen, getCounterpartUser]
  )

  // Confirmar y abrir WhatsApp
  const confirmOpenWhatsApp = useCallback(() => {
    if (!selectedUserForWhatsApp) return

    const whatsappUrl = `https://wa.me/${selectedUserForWhatsApp.fullPhone}`

    window.open(whatsappUrl, '_blank')
    Logger.info(Logger.CATEGORIES.UI, 'open_whatsapp', 'Usuario redirigido a WhatsApp', {
      phone: selectedUserForWhatsApp.fullPhone
    })
  }, [selectedUserForWhatsApp])

  // Abrir modal de Email
  const handleOpenEmail = useCallback(
    matchData => {
      const otherUser = getCounterpartUser(matchData) || {}
      const userName = `${otherUser.name || ''} ${otherUser.lastName || ''}`.trim()
      const email = otherUser.email

      if (!email) {
        Logger.warn(Logger.CATEGORIES.UI, 'open_email', 'Usuario no tiene correo electrónico')

        return
      }

      setSelectedUserForEmail({
        name: userName,
        email,
        avatar: otherUser.mainImage?.url || otherUser.mainImage
      })
      onEmailModalOpen()
    },
    [onEmailModalOpen, getCounterpartUser]
  )

  // Confirmar y abrir Email
  const confirmOpenEmail = useCallback(() => {
    if (!selectedUserForEmail) return

    const mailtoUrl = `mailto:${selectedUserForEmail.email}`

    window.open(mailtoUrl, '_blank')
    Logger.info(Logger.CATEGORIES.UI, 'open_email', 'Usuario redirigido a Email', {
      email: selectedUserForEmail.email
    })
  }, [selectedUserForEmail])

  const handleWithdrawModalChange = useCallback(
    isOpen => {
      onWithdrawModalOpenChange(isOpen)
      if (!isOpen) {
        setMatchPendingWithdraw(null)
      }
    },
    [onWithdrawModalOpenChange]
  )

  const closeWithdrawModal = useCallback(() => {
    handleWithdrawModalChange(false)
  }, [handleWithdrawModalChange])

  const handlePrepareWithdraw = useCallback(
    matchData => {
      if (!matchData) return

      setMatchPendingWithdraw(matchData)
      onWithdrawModalOpen()
    },
    [onWithdrawModalOpen]
  )

  const handleConfirmWithdraw = useCallback(async () => {
    if (!matchPendingWithdraw?.id) {
      closeWithdrawModal()

      return
    }

    try {
      await withdrawMatchAction(matchPendingWithdraw.id)
      handleSuccess('Solicitud retirada exitosamente')
      Logger.info(Logger.CATEGORIES.SERVICE, 'withdraw_match', 'Match retirado por el usuario', {
        matchId: matchPendingWithdraw.id
      })
      // Recargar todas las listas relevantes
      await Promise.all([
        loadByType({ type: 'all', page: allPagination.page, size: allPagination.size }),
        loadByType({ type: 'sent', page: sentPagination.page, size: sentPagination.size })
      ])
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'withdraw_match', 'Error al retirar match', {
        error,
        matchId: matchPendingWithdraw.id
      })
      handleError(error, { customMessage: 'Error al retirar el match' })
    } finally {
      closeWithdrawModal()
    }
  }, [
    closeWithdrawModal,
    handleSuccess,
    handleError,
    loadByType,
    matchPendingWithdraw,
    allPagination.page,
    allPagination.size,
    sentPagination.page,
    sentPagination.size,
    withdrawMatchAction
  ])

  const withdrawCounterpartUser = useMemo(() => {
    if (!matchPendingWithdraw) return null

    return getCounterpartUser(matchPendingWithdraw)
  }, [matchPendingWithdraw, getCounterpartUser])

  // Handlers para aceptar/rechazar matches
  const handlePrepareAccept = useCallback(
    matchData => {
      if (!matchData) return

      setMatchPendingAction(matchData)
      onAcceptModalOpen()
    },
    [onAcceptModalOpen]
  )

  const handlePrepareReject = useCallback(
    matchData => {
      if (!matchData) return

      setMatchPendingAction(matchData)
      onRejectModalOpen()
    },
    [onRejectModalOpen]
  )

  const handleAcceptModalChange = useCallback(
    isOpen => {
      onAcceptModalOpenChange(isOpen)
      if (!isOpen) {
        setMatchPendingAction(null)
      }
    },
    [onAcceptModalOpenChange]
  )

  const handleRejectModalChange = useCallback(
    isOpen => {
      onRejectModalOpenChange(isOpen)
      if (!isOpen) {
        setMatchPendingAction(null)
      }
    },
    [onRejectModalOpenChange]
  )

  const closeAcceptModal = useCallback(() => {
    handleAcceptModalChange(false)
  }, [handleAcceptModalChange])

  const closeRejectModal = useCallback(() => {
    handleRejectModalChange(false)
  }, [handleRejectModalChange])

  const handleConfirmAccept = useCallback(async () => {
    if (!matchPendingAction?.id) {
      closeAcceptModal()

      return
    }

    try {
      await acceptMatchAction(matchPendingAction.id)
      handleSuccess('¡Match aceptado! 💕')
      Logger.info(Logger.CATEGORIES.SERVICE, 'accept_match', 'Match aceptado por el usuario', {
        matchId: matchPendingAction.id
      })
      // Recargar todas las listas relevantes
      await Promise.all([
        loadByType({ type: 'all', page: allPagination.page, size: allPagination.size }),
        loadByType({ type: 'received', page: receivedPagination.page, size: receivedPagination.size }),
        loadByType({ type: 'accepted', page: acceptedPagination.page, size: acceptedPagination.size })
      ])
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'accept_match', 'Error al aceptar match', {
        error,
        matchId: matchPendingAction.id
      })
      handleError(error, { customMessage: 'Error al aceptar el match' })
    } finally {
      closeAcceptModal()
    }
  }, [
    closeAcceptModal,
    handleSuccess,
    handleError,
    loadByType,
    matchPendingAction,
    allPagination.page,
    allPagination.size,
    receivedPagination.page,
    receivedPagination.size,
    acceptedPagination.page,
    acceptedPagination.size,
    acceptMatchAction
  ])

  const handleConfirmReject = useCallback(async () => {
    if (!matchPendingAction?.id) {
      closeRejectModal()

      return
    }

    try {
      await rejectMatchAction(matchPendingAction.id)
      handleSuccess('Solicitud rechazada')
      Logger.info(Logger.CATEGORIES.SERVICE, 'reject_match', 'Match rechazado por el usuario', {
        matchId: matchPendingAction.id
      })
      // Recargar todas las listas relevantes
      await Promise.all([
        loadByType({ type: 'all', page: allPagination.page, size: allPagination.size }),
        loadByType({ type: 'received', page: receivedPagination.page, size: receivedPagination.size })
      ])
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'reject_match', 'Error al rechazar match', {
        error,
        matchId: matchPendingAction.id
      })
      handleError(error, { customMessage: 'Error al rechazar el match' })
    } finally {
      closeRejectModal()
    }
  }, [
    closeRejectModal,
    handleSuccess,
    handleError,
    loadByType,
    matchPendingAction,
    allPagination.page,
    allPagination.size,
    receivedPagination.page,
    receivedPagination.size,
    rejectMatchAction
  ])

  const actionCounterpartUser = useMemo(() => {
    if (!matchPendingAction) return null

    return getCounterpartUser(matchPendingAction)
  }, [matchPendingAction, getCounterpartUser])

  // Determinar tipo de match cuando está en "all"
  const getMatchType = useCallback(match => {
    // Si el match está aceptado, siempre es "accepted"
    if (match.status === 'ACCEPTED') return 'accepted'

    // Usar el campo "role" que viene del backend
    // INITIATOR = el usuario actual envió el match
    // TARGET = el usuario actual recibió el match
    if (match.role === 'INITIATOR') return 'sent'
    if (match.role === 'TARGET') return 'received'

    return 'sent' // fallback
  }, [])

  // Renderizar item de match estilo chat
  const renderMatchItem = useCallback(
    (match, type, showTypeBadge = false) => {
      // Extraer datos del match basados en el tipo MatchHistoryItemDTO
      // match.otherUser es de tipo UserResponseDTO que tiene { user: UserDataDTO, ... }
      const otherUserResponse = match?.otherUser
      const matchUser = otherUserResponse?.user || {}

      const age = matchUser?.dateOfBirth ? calculateAgeFromJavaDate(matchUser.dateOfBirth) : null
      const userName = `${matchUser?.name || ''} ${matchUser?.lastName || ''}`.trim() || 'Usuario'
      const userImage = matchUser?.mainImage?.url || matchUser?.mainImage || matchUser?.profileImageUrl
      const hasPhone = !!matchUser?.phone
      const city = matchUser?.city || ''
      const categoryInterest = matchUser?.categoryInterest || ''

      // Información de fecha según el tipo
      let dateInfo = ''

      if (type === 'accepted') {
        dateInfo = match.respondedAt
          ? formatJavaDateForDisplay(match.respondedAt)
          : match.createdAt
            ? formatJavaDateForDisplay(match.createdAt)
            : ''
      } else if (type === 'sent' || type === 'received') {
        dateInfo = match.createdAt ? formatJavaDateForDisplay(match.createdAt) : ''
      }

      // Estado del match
      const statusMap = {
        PENDING: { label: 'Pendiente', color: 'warning', icon: Clock },
        ACCEPTED: { label: 'Aceptado', color: 'success', icon: CheckCheck },
        REJECTED: { label: 'Rechazado', color: 'danger', icon: X }
      }
      const status = statusMap[match.status] || null

      // Badge de tipo de match (solo cuando showTypeBadge es true)
      const typeLabels = {
        accepted: { label: 'Match', color: 'success', icon: Heart },
        sent: { label: 'Enviado', color: 'primary', icon: Send },
        received: { label: 'Recibido', color: 'secondary', icon: Inbox }
      }
      const typeInfo = showTypeBadge ? typeLabels[type] || null : null

      return (
        <div
          key={match.id || match.matchId}
          className='bg-gray-800/10 hover:bg-gray-800/20 transition-all duration-200 px-3 py-3 md:px-4 rounded-lg border border-gray-700/20'>
          <div className='flex items-center gap-3 md:gap-4'>
            {/* Avatar - Estilo WhatsApp con tamaño más grande */}
            <div className='relative flex-shrink-0'>
              <Avatar
                className='w-14 h-14 md:w-12 md:h-12'
                classNames={{
                  base: type === 'accepted' ? 'ring-2 ring-green-500/40' : ''
                }}
                color={type === 'accepted' ? 'success' : 'default'}
                name={userName}
                src={userImage}
              />
              {type === 'accepted' && (
                <div className='absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900'>
                  <CheckCheck className='w-2.5 h-2.5 text-white' strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Información del usuario - Estilo WhatsApp */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-1'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  <h3 className='text-[15px] md:text-sm font-semibold text-gray-100 truncate'>
                    {userName}
                    {age && <span className='text-gray-400 font-normal text-sm'>, {age}</span>}
                  </h3>
                </div>
                {/* Fecha - Estilo WhatsApp en la esquina superior derecha */}
                {dateInfo && <span className='text-[11px] text-gray-500 flex-shrink-0 ml-2 whitespace-nowrap'>{dateInfo}</span>}
              </div>

              <div className='flex items-center gap-2 justify-between'>
                <div className='flex items-center gap-1.5 min-w-0 flex-1'>
                  {/* Preview de información estilo WhatsApp */}
                  {city && (
                    <p className='text-[13px] md:text-xs text-gray-400 truncate'>
                      {city}
                      {typeInfo && (
                        <span
                          className={`font-medium ${
                            typeInfo.color === 'success'
                              ? 'text-green-400'
                              : typeInfo.color === 'primary'
                                ? 'text-blue-400'
                                : 'text-purple-400'
                          }`}>
                          {' '}
                          • {typeInfo.label}
                        </span>
                      )}
                      {!typeInfo && categoryInterest && <span className='text-gray-500'> • {categoryInterest}</span>}
                    </p>
                  )}
                  {!city && typeInfo && (
                    <p className='text-[13px] md:text-xs truncate'>
                      <span
                        className={`font-medium ${
                          typeInfo.color === 'success'
                            ? 'text-green-400'
                            : typeInfo.color === 'primary'
                              ? 'text-blue-400'
                              : 'text-purple-400'
                        }`}>
                        {typeInfo.label}
                      </span>
                    </p>
                  )}
                  {!city && !typeInfo && categoryInterest && (
                    <p className='text-[13px] md:text-xs text-gray-400 truncate'>{categoryInterest}</p>
                  )}
                </div>

                {/* Estado (solo para enviados/recibidos y cuando NO es tab "all" con typeInfo) */}
                {status && type !== 'accepted' && !typeInfo && (
                  <Chip className='h-5 text-[10px] flex-shrink-0' color={status.color} size='sm' variant='dot'>
                    {status.label}
                  </Chip>
                )}
              </div>
            </div>

            {/* Botones de acción - Más evidentes */}
            <div className='flex flex-col md:flex-row items-center gap-1.5 md:gap-1 flex-shrink-0'>
              {/* Botón WhatsApp (solo para matches aceptados con teléfono) */}
              {type === 'accepted' && hasPhone && (
                <Button
                  isIconOnly
                  className='bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-400 min-w-[40px] md:min-w-0'
                  size='sm'
                  variant='flat'
                  onPress={() => handleOpenWhatsApp(match)}>
                  <MessageSquare className='w-[18px] h-[18px]' />
                </Button>
              )}

              {/* Botón Email (solo para matches aceptados) */}
              {type === 'accepted' && (
                <Button
                  isIconOnly
                  className='bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 text-blue-400 min-w-[40px] md:min-w-0'
                  size='sm'
                  variant='flat'
                  onPress={() => handleOpenEmail(match)}>
                  <Mail className='w-[18px] h-[18px]' />
                </Button>
              )}

              {/* Botón ver perfil */}
              <Link
                className='flex-shrink-0 min-w-[40px] md:min-w-[32px] h-8 flex items-center justify-center rounded-lg bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 text-blue-400 transition-colors'
                to={`${APP_PATHS.USER.PROFILE_BY_ID.replace(':userId', matchUser?.id || '')}`}>
                <Eye className='w-[18px] h-[18px]' />
              </Link>

              {/* Botón de retirar match - Solo para enviados */}
              {type === 'sent' && match.status === 'PENDING' && (
                <Button
                  isIconOnly
                  className='flex-shrink-0 min-w-[40px] md:min-w-0 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400'
                  isDisabled={interactionLoading}
                  size='sm'
                  variant='flat'
                  onPress={() => handlePrepareWithdraw(match)}>
                  <XCircle className='w-[18px] h-[18px]' />
                </Button>
              )}

              {/* Botones de aceptar/rechazar - Solo para recibidos pendientes */}
              {type === 'received' && match.status === 'PENDING' && (
                <>
                  <Button
                    isIconOnly
                    className='flex-shrink-0 min-w-[40px] md:min-w-0 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-400'
                    isDisabled={interactionLoading}
                    size='sm'
                    variant='flat'
                    onPress={() => handlePrepareAccept(match)}>
                    <Check className='w-[18px] h-[18px]' strokeWidth={2.5} />
                  </Button>
                  <Button
                    isIconOnly
                    className='flex-shrink-0 min-w-[40px] md:min-w-0 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400'
                    isDisabled={interactionLoading}
                    size='sm'
                    variant='flat'
                    onPress={() => handlePrepareReject(match)}>
                    <X className='w-[18px] h-[18px]' strokeWidth={2.5} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )
    },
    [
      handleViewProfile,
      handleOpenWhatsApp,
      handleOpenEmail,
      handlePrepareWithdraw,
      handlePrepareAccept,
      handlePrepareReject,
      interactionLoading
    ]
  )

  // Filtrar matches por búsqueda
  const getFilteredMatches = useCallback((matches, searchQuery) => {
    if (!searchQuery) return matches
    const query = searchQuery.toLowerCase()

    return matches.filter(match => {
      // Con MatchHistoryItemDTO, solo tenemos otherUser
      const otherUser = match?.otherUser?.user || {}

      return [otherUser.name, otherUser.lastName, otherUser.email].filter(Boolean).some(field => field.toLowerCase().includes(query))
    })
  }, [])

  const filteredAllMatches = getFilteredMatches(allMatches, searchQueries.all)
  const filteredAcceptedMatches = getFilteredMatches(acceptedMatches, searchQueries.accepted)
  const filteredSentMatches = getFilteredMatches(sentMatches, searchQueries.sent)
  const filteredReceivedMatches = getFilteredMatches(receivedMatches, searchQueries.received)

  // Renderizar lista de matches
  const renderMatchList = useCallback(
    (matches, type, emptyMessage, pagination) => {
      if (matchesLoading && matches.length === 0) {
        return (
          <div className='flex flex-col items-center justify-center py-20'>
            <Spinner color='primary' size='lg' />
            <p className='text-gray-400 mt-4'>Cargando matches...</p>
          </div>
        )
      }

      if (matches.length === 0) {
        return (
          <Card className='bg-gray-800/40 border-gray-700/50'>
            <CardBody className='flex flex-col items-center justify-center py-16 gap-4'>
              <div className='w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center'>
                <MessageCircle className='w-8 h-8 text-gray-500' />
              </div>
              <div className='text-center space-y-2'>
                <h3 className='text-lg font-semibold text-gray-300'>{emptyMessage}</h3>
                <p className='text-sm text-gray-400 max-w-md'>
                  {type === 'accepted' && 'Comienza a explorar perfiles y envía likes para hacer match'}
                  {type === 'sent' && 'Aún no has enviado solicitudes de match'}
                  {type === 'received' && 'Aún no has recibido solicitudes de match'}
                </p>
              </div>
            </CardBody>
          </Card>
        )
      }

      const hasMorePages = pagination.page + 1 < pagination.totalPages

      return (
        <>
          <div className='space-y-3'>
            {matches.map(match => {
              // Si type es 'all', determinar el tipo dinámicamente y mostrar badge
              const matchType = type === 'all' ? getMatchType(match) : type
              const showTypeBadge = type === 'all'

              return renderMatchItem(match, matchType, showTypeBadge)
            })}
          </div>

          {/* Elemento para Intersection Observer y spinner de carga */}
          {hasMorePages && (
            <div ref={loadMoreRef} className='flex justify-center py-6'>
              {loadingMore && (
                <div className='flex flex-col items-center gap-2'>
                  <Spinner color='primary' size='sm' />
                  <p className='text-xs text-gray-400'>Cargando más...</p>
                </div>
              )}
            </div>
          )}
        </>
      )
    },
    [matchesLoading, loadingMore, renderMatchItem, getMatchType]
  )

  return (
    <>
      <Helmet>
        <title>Mis Matches - Feeling</title>
        <meta content='Administra tus matches, conexiones y solicitudes' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de mis matches' className='gap-6 !pt-0 !justify-start'>
        {/* Header */}
        <div className='flex items-center gap-3 w-full'>
          <div className='w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center'>
            <Heart className='w-6 h-6 text-pink-400' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-100'>Mis Matches</h1>
            <p className='text-sm text-gray-400'>Gestiona tus conexiones</p>
          </div>
        </div>

        {/* Card principal con layout de matches */}
        <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-0'>
            {/* Layout adaptativo: Tabs en mobile, Sidebar en desktop */}
            <div className='flex flex-col md:flex-row min-h-[600px] h-full md:h-[calc(100vh-230px)]'>
              {/* Tabs para Mobile - Sticky en top */}
              <div className='md:hidden sticky top-0 z-20 bg-gray-800/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg'>
                <div className='flex overflow-x-auto scrollbar-hide'>
                  <button
                    className={`flex-1 min-w-[85px] px-2.5 py-2.5 border-b-2 transition-colors ${
                      selectedTab === 'all' ? 'border-b-pink-500 bg-gray-700/20' : 'border-b-transparent hover:bg-gray-700/10'
                    }`}
                    onClick={() => setSelectedTab('all')}>
                    <div className='flex flex-col items-center gap-0.5'>
                      <MessageCircle className='w-[18px] h-[18px] text-pink-400' />
                      <span className='text-[11px] font-semibold text-gray-100'>Todos</span>
                      <Chip className='h-3.5 text-[9px]' color='danger' size='sm' variant='flat'>
                        {allPagination.totalElements || 0}
                      </Chip>
                    </div>
                  </button>

                  <button
                    className={`flex-1 min-w-[85px] px-2.5 py-2.5 border-b-2 transition-colors ${
                      selectedTab === 'accepted' ? 'border-b-green-500 bg-gray-700/20' : 'border-b-transparent hover:bg-gray-700/10'
                    }`}
                    onClick={() => setSelectedTab('accepted')}>
                    <div className='flex flex-col items-center gap-0.5'>
                      <Heart className='w-[18px] h-[18px] text-green-400' />
                      <span className='text-[11px] font-semibold text-gray-100'>Activos</span>
                      <Chip className='h-3.5 text-[9px]' color='success' size='sm' variant='flat'>
                        {acceptedPagination.totalElements || 0}
                      </Chip>
                    </div>
                  </button>

                  <button
                    className={`flex-1 min-w-[85px] px-2.5 py-2.5 border-b-2 transition-colors ${
                      selectedTab === 'sent' ? 'border-b-blue-500 bg-gray-700/20' : 'border-b-transparent hover:bg-gray-700/10'
                    }`}
                    onClick={() => setSelectedTab('sent')}>
                    <div className='flex flex-col items-center gap-0.5'>
                      <Send className='w-[18px] h-[18px] text-blue-400' />
                      <span className='text-[11px] font-semibold text-gray-100'>Enviados</span>
                      <Chip className='h-3.5 text-[9px]' color='primary' size='sm' variant='flat'>
                        {sentPagination.totalElements || 0}
                      </Chip>
                    </div>
                  </button>

                  <button
                    className={`flex-1 min-w-[85px] px-2.5 py-2.5 border-b-2 transition-colors ${
                      selectedTab === 'received' ? 'border-b-purple-500 bg-gray-700/20' : 'border-b-transparent hover:bg-gray-700/10'
                    }`}
                    onClick={() => setSelectedTab('received')}>
                    <div className='flex flex-col items-center gap-0.5'>
                      <Inbox className='w-[18px] h-[18px] text-purple-400' />
                      <span className='text-[11px] font-semibold text-gray-100'>Recibidos</span>
                      <Chip className='h-3.5 text-[9px]' color='secondary' size='sm' variant='flat'>
                        {receivedPagination.totalElements || 0}
                      </Chip>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sidebar para Desktop - Oculto en mobile */}
              <div className='hidden md:flex w-80 bg-gray-800/20 border-r border-gray-700/30 flex-col overflow-hidden'>
                {/* Búsqueda */}
                <div className='p-3 border-b border-gray-700/50'>
                  <Input
                    classNames={{
                      input: 'text-sm',
                      inputWrapper: 'bg-gray-900/40 border-gray-700/50'
                    }}
                    placeholder='Buscar conversaciones...'
                    size='sm'
                    startContent={<Search className='w-4 h-4 text-gray-400' />}
                    value={searchQueries[selectedTab]}
                    variant='bordered'
                    onValueChange={value => setSearchQueries(prev => ({ ...prev, [selectedTab]: value }))}
                  />
                </div>

                {/* Categorías de matches como lista de chats */}
                <div className='flex-1 overflow-y-auto'>
                  {/* Todos los Matches */}
                  <div
                    aria-selected={selectedTab === 'all'}
                    className={`px-4 py-3 border-b border-gray-700/20 cursor-pointer transition-colors ${
                      selectedTab === 'all' ? 'bg-gray-700/30 border-l-4 border-l-pink-500' : 'hover:bg-gray-700/20'
                    }`}
                    role='tab'
                    tabIndex={0}
                    onClick={() => setSelectedTab('all')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedTab('all')
                      }
                    }}>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                        <MessageCircle className='w-5 h-5 text-pink-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-semibold text-gray-100'>Todos</h3>
                          <Chip className='h-5' color='danger' size='sm' variant='flat'>
                            {allPagination.totalElements || 0}
                          </Chip>
                        </div>
                        <p className='text-xs text-gray-400 truncate'>Todas las conversaciones</p>
                      </div>
                    </div>
                  </div>

                  {/* Matches Aceptados */}
                  <div
                    aria-selected={selectedTab === 'accepted'}
                    className={`px-4 py-3 border-b border-gray-700/20 cursor-pointer transition-colors ${
                      selectedTab === 'accepted' ? 'bg-gray-700/30 border-l-4 border-l-green-500' : 'hover:bg-gray-700/20'
                    }`}
                    role='tab'
                    tabIndex={0}
                    onClick={() => setSelectedTab('accepted')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedTab('accepted')
                      }
                    }}>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                        <Heart className='w-5 h-5 text-green-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-semibold text-gray-100'>Matches Activos</h3>
                          <Chip className='h-5' color='success' size='sm' variant='flat'>
                            {acceptedPagination.totalElements || 0}
                          </Chip>
                        </div>
                        <p className='text-xs text-gray-400 truncate'>Conexiones mutuas</p>
                      </div>
                    </div>
                  </div>

                  {/* Matches Enviados */}
                  <div
                    aria-selected={selectedTab === 'sent'}
                    className={`px-4 py-3 border-b border-gray-700/20 cursor-pointer transition-colors ${
                      selectedTab === 'sent' ? 'bg-gray-700/30 border-l-4 border-l-blue-500' : 'hover:bg-gray-700/20'
                    }`}
                    role='tab'
                    tabIndex={0}
                    onClick={() => setSelectedTab('sent')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedTab('sent')
                      }
                    }}>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                        <Send className='w-5 h-5 text-blue-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-semibold text-gray-100'>Enviados</h3>
                          <Chip className='h-5' color='primary' size='sm' variant='flat'>
                            {sentPagination.totalElements || 0}
                          </Chip>
                        </div>
                        <p className='text-xs text-gray-400 truncate'>Solicitudes enviadas</p>
                      </div>
                    </div>
                  </div>

                  {/* Matches Recibidos */}
                  <div
                    aria-selected={selectedTab === 'received'}
                    className={`px-4 py-3 border-b border-gray-700/20 cursor-pointer transition-colors ${
                      selectedTab === 'received' ? 'bg-gray-700/30 border-l-4 border-l-purple-500' : 'hover:bg-gray-700/20'
                    }`}
                    role='tab'
                    tabIndex={0}
                    onClick={() => setSelectedTab('received')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedTab('received')
                      }
                    }}>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                        <Inbox className='w-5 h-5 text-purple-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-sm font-semibold text-gray-100'>Recibidos</h3>
                          <Chip className='h-5' color='secondary' size='sm' variant='flat'>
                            {receivedPagination.totalElements || 0}
                          </Chip>
                        </div>
                        <p className='text-xs text-gray-400 truncate'>Solicitudes recibidas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área de contenido - Optimizado para mobile */}
              <div className='flex-1 flex flex-col overflow-hidden bg-gray-900/10'>
                {/* Búsqueda para Mobile - Visible solo en mobile */}
                <div className='md:hidden p-3 border-b border-gray-700/30 bg-gray-800/20'>
                  <Input
                    classNames={{
                      input: 'text-sm',
                      inputWrapper: 'bg-gray-900/40 border-gray-700/50'
                    }}
                    placeholder='Buscar...'
                    size='sm'
                    startContent={<Search className='w-4 h-4 text-gray-400' />}
                    value={searchQueries[selectedTab]}
                    variant='bordered'
                    onValueChange={value => setSearchQueries(prev => ({ ...prev, [selectedTab]: value }))}
                  />
                </div>

                {/* Header de categoría - Solo desktop */}
                <div className='hidden md:block bg-gray-800/20 border-b border-gray-700/30 px-6 py-3'>
                  <div className='flex items-center gap-3'>
                    {selectedTab === 'all' && (
                      <>
                        <MessageCircle className='w-5 h-5 text-pink-400' />
                        <div>
                          <h2 className='text-base font-semibold text-gray-100'>Todos los Matches</h2>
                          <p className='text-xs text-gray-400'>{allPagination.totalElements || 0} conversaciones</p>
                        </div>
                      </>
                    )}
                    {selectedTab === 'accepted' && (
                      <>
                        <Heart className='w-5 h-5 text-green-400' />
                        <div>
                          <h2 className='text-base font-semibold text-gray-100'>Matches Activos</h2>
                          <p className='text-xs text-gray-400'>{acceptedPagination.totalElements || 0} conexiones</p>
                        </div>
                      </>
                    )}
                    {selectedTab === 'sent' && (
                      <>
                        <Send className='w-5 h-5 text-blue-400' />
                        <div>
                          <h2 className='text-base font-semibold text-gray-100'>Solicitudes Enviadas</h2>
                          <p className='text-xs text-gray-400'>{sentPagination.totalElements || 0} enviadas</p>
                        </div>
                      </>
                    )}
                    {selectedTab === 'received' && (
                      <>
                        <Inbox className='w-5 h-5 text-purple-400' />
                        <div>
                          <h2 className='text-base font-semibold text-gray-100'>Solicitudes Recibidas</h2>
                          <p className='text-xs text-gray-400'>{receivedPagination.totalElements || 0} recibidas</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Lista de matches scrolleable - Optimizado para mobile */}
                <div className='flex-1 overflow-y-auto p-2 md:p-4'>
                  {selectedTab === 'all' && renderMatchList(filteredAllMatches, 'all', 'No tienes conversaciones aún', allPagination)}
                  {selectedTab === 'accepted' &&
                    renderMatchList(filteredAcceptedMatches, 'accepted', 'No tienes matches aún', acceptedPagination)}
                  {selectedTab === 'sent' && renderMatchList(filteredSentMatches, 'sent', 'No has enviado solicitudes', sentPagination)}
                  {selectedTab === 'received' &&
                    renderMatchList(filteredReceivedMatches, 'received', 'No has recibido solicitudes', receivedPagination)}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </LiteContainer>

      {/* Modal de confirmación para retirar match */}
      <Modal
        classNames={{
          backdrop: 'bg-gray-900/50 backdrop-blur-sm',
          base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-secondary-500/5',
          header: 'border-b border-gray-800',
          body: 'py-6',
          footer: 'border-t border-gray-800'
        }}
        isOpen={isWithdrawModalOpen}
        placement='center'
        size='sm'
        onOpenChange={handleWithdrawModalChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
                {/* Avatar con badge de acción */}
                <div className='relative'>
                  <Avatar
                    isBordered
                    className='w-20 h-20'
                    classNames={{
                      base: 'ring-4 ring-amber-500/30'
                    }}
                    color='warning'
                    name={`${withdrawCounterpartUser?.name || ''} ${withdrawCounterpartUser?.lastName || ''}`.trim()}
                    src={withdrawCounterpartUser?.mainImage?.url || withdrawCounterpartUser?.mainImage}
                  />
                  <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                    <Undo2 className='w-4 h-4 text-white' />
                  </div>
                </div>
                {/* Título y subtítulo */}
                <div className='text-center'>
                  <h3 className='text-xl font-bold text-white mb-1'>
                    ¿Retirar solicitud a {`${withdrawCounterpartUser?.name || ''}`.trim() || 'este usuario'}?
                  </h3>
                  <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                    <AlertTriangle className='w-3 h-3' />
                    Recuperarás tu intento de match
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className='text-center space-y-2'>
                  <p className='text-gray-300 text-sm'>Al retirar la solicitud, recuperarás el intento y podrás usarlo con otra persona.</p>
                </div>
              </ModalBody>

              <ModalFooter className='justify-center gap-3 pb-6'>
                <Button
                  className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]'
                  radius='full'
                  variant='flat'
                  onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  className='bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold min-w-[120px]'
                  isLoading={interactionLoading}
                  radius='full'
                  startContent={!interactionLoading ? <Undo2 className='w-4 h-4' /> : null}
                  onPress={handleConfirmWithdraw}>
                  Retirar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de advertencia de WhatsApp */}
      <Modal
        classNames={{
          backdrop: 'bg-gray-900/50 backdrop-blur-sm',
          base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-green-500/5',
          header: 'border-b border-gray-800',
          body: 'py-6',
          footer: 'border-t border-gray-800'
        }}
        isOpen={isWhatsAppModalOpen}
        placement='center'
        size='sm'
        onOpenChange={onWhatsAppModalOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
                {/* Avatar con badge de acción */}
                <div className='relative'>
                  <Avatar
                    isBordered
                    className='w-20 h-20'
                    classNames={{
                      base: 'ring-4 ring-green-500/30'
                    }}
                    color='success'
                    name={selectedUserForWhatsApp?.name || 'Usuario'}
                    src={selectedUserForWhatsApp?.avatar}
                  />
                  <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                    <MessageSquare className='w-4 h-4 text-white' />
                  </div>
                </div>
                {/* Título y subtítulo */}
                <div className='text-center'>
                  <h3 className='text-xl font-bold text-white mb-1'>Conectar por WhatsApp</h3>
                  <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                    <AlertTriangle className='w-3 h-3' />
                    Estás a punto de salir de Feeling
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-amber-500/10 border border-amber-500/20 rounded-lg p-3'>
                    <div className='flex items-start gap-2'>
                      <AlertTriangle className='w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5' />
                      <div className='space-y-1.5'>
                        <p className='text-xs text-amber-200 font-semibold'>Importante</p>
                        <ul className='text-xs text-gray-300 space-y-1 list-disc list-inside'>
                          <li>
                            Serás redirigido a WhatsApp para chatear con{' '}
                            <span className='font-semibold text-white'>{selectedUserForWhatsApp?.name}</span>
                          </li>
                          <li>Las conversaciones fuera de Feeling no están bajo nuestro control</li>
                          <li>Cuida tu información personal y reporta cualquier comportamiento inapropiado</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className='bg-gray-800/40 rounded-lg p-3 border border-gray-700/50'>
                    <p className='text-xs text-gray-400 text-center'>
                      Feeling está comprometido con tu seguridad. Si experimentas algún problema, repórtalo desde la sección de{' '}
                      <span className='text-primary-400 font-semibold'>Ayuda</span>.
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className='justify-center gap-3 pb-6'>
                <Button
                  className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]'
                  radius='full'
                  variant='flat'
                  onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold min-w-[140px]'
                  radius='full'
                  startContent={<ExternalLink className='w-4 h-4' />}
                  onPress={() => {
                    confirmOpenWhatsApp()
                    onClose()
                  }}>
                  Abrir WhatsApp
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de advertencia de Email */}
      <Modal
        classNames={{
          backdrop: 'bg-gray-900/50 backdrop-blur-sm',
          base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-blue-500/5',
          header: 'border-b border-gray-800',
          body: 'py-6',
          footer: 'border-t border-gray-800'
        }}
        isOpen={isEmailModalOpen}
        placement='center'
        size='sm'
        onOpenChange={onEmailModalOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
                {/* Avatar con badge de acción */}
                <div className='relative'>
                  <Avatar
                    isBordered
                    className='w-20 h-20'
                    classNames={{
                      base: 'ring-4 ring-blue-500/30'
                    }}
                    color='primary'
                    name={selectedUserForEmail?.name || 'Usuario'}
                    src={selectedUserForEmail?.avatar}
                  />
                  <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                    <Mail className='w-4 h-4 text-white' />
                  </div>
                </div>
                {/* Título y subtítulo */}
                <div className='text-center'>
                  <h3 className='text-xl font-bold text-white mb-1'>Conectar por Email</h3>
                  <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                    <AlertTriangle className='w-3 h-3' />
                    Estás a punto de salir de Feeling
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className='space-y-4'>
                  <div className='bg-amber-500/10 border border-amber-500/20 rounded-lg p-3'>
                    <div className='flex items-start gap-2'>
                      <AlertTriangle className='w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5' />
                      <div className='space-y-1.5'>
                        <p className='text-xs text-amber-200 font-semibold'>Importante</p>
                        <ul className='text-xs text-gray-300 space-y-1 list-disc list-inside'>
                          <li>
                            Se abrirá tu cliente de correo para contactar a{' '}
                            <span className='font-semibold text-white'>{selectedUserForEmail?.name}</span>
                          </li>
                          <li>Las conversaciones fuera de Feeling no están bajo nuestro control</li>
                          <li>Cuida tu información personal y reporta cualquier comportamiento inapropiado</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className='bg-gray-800/40 rounded-lg p-3 border border-gray-700/50'>
                    <p className='text-xs text-gray-400 text-center'>
                      Feeling está comprometido con tu seguridad. Si experimentas algún problema, repórtalo desde la sección de{' '}
                      <span className='text-primary-400 font-semibold'>Ayuda</span>.
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className='justify-center gap-3 pb-6'>
                <Button
                  className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]'
                  radius='full'
                  variant='flat'
                  onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold min-w-[140px]'
                  radius='full'
                  startContent={<ExternalLink className='w-4 h-4' />}
                  onPress={() => {
                    confirmOpenEmail()
                    onClose()
                  }}>
                  Abrir Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para aceptar match */}
      <Modal
        classNames={{
          backdrop: 'bg-gray-900/50 backdrop-blur-sm',
          base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-secondary-500/5',
          header: 'border-b border-gray-800',
          body: 'py-6',
          footer: 'border-t border-gray-800'
        }}
        isOpen={isAcceptModalOpen}
        placement='center'
        size='sm'
        onOpenChange={handleAcceptModalChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
                {/* Avatar con badge de acción */}
                <div className='relative'>
                  <Avatar
                    isBordered
                    className='w-20 h-20'
                    classNames={{
                      base: 'ring-4 ring-pink-500/30'
                    }}
                    color='danger'
                    name={`${actionCounterpartUser?.name || ''} ${actionCounterpartUser?.lastName || ''}`.trim()}
                    src={actionCounterpartUser?.mainImage?.url || actionCounterpartUser?.mainImage}
                  />
                  <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                    <Heart className='w-4 h-4 text-white fill-current' />
                  </div>
                </div>
                {/* Título y subtítulo */}
                <div className='text-center'>
                  <h3 className='text-xl font-bold text-white mb-1'>
                    ¿Hacer match con {`${actionCounterpartUser?.name || ''}`.trim() || 'este usuario'}?
                  </h3>
                  <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                    <Heart className='w-3 h-3 text-pink-400' />
                    Aceptar NO consume intentos
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className='text-center space-y-2'>
                  <p className='text-gray-300 text-sm'>
                    Si <span className='font-semibold text-pink-400'>{`${actionCounterpartUser?.name || ''}`.trim()}</span> te gustó,
                    ¡aceptar el match es gratis!
                  </p>
                </div>
              </ModalBody>

              <ModalFooter className='justify-center gap-3 pb-6'>
                <Button
                  className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]'
                  radius='full'
                  variant='flat'
                  onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  className='bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold min-w-[140px]'
                  isLoading={interactionLoading}
                  radius='full'
                  startContent={!interactionLoading ? <Heart className='w-4 h-4 fill-current' /> : null}
                  onPress={handleConfirmAccept}>
                  Confirmar Match
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para rechazar match */}
      <Modal
        classNames={{
          backdrop: 'bg-gray-900/50 backdrop-blur-sm',
          base: 'bg-gray-900 border border-gray-700 shadow-2xl shadow-secondary-500/5',
          header: 'border-b border-gray-800',
          body: 'py-6',
          footer: 'border-t border-gray-800'
        }}
        isOpen={isRejectModalOpen}
        placement='center'
        size='sm'
        onOpenChange={handleRejectModalChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col items-center gap-3 pt-6'>
                {/* Avatar con badge de acción */}
                <div className='relative'>
                  <Avatar
                    isBordered
                    className='w-20 h-20'
                    classNames={{
                      base: 'ring-4 ring-gray-700/30 grayscale'
                    }}
                    color='default'
                    name={`${actionCounterpartUser?.name || ''} ${actionCounterpartUser?.lastName || ''}`.trim()}
                    src={actionCounterpartUser?.mainImage?.url || actionCounterpartUser?.mainImage}
                  />
                  <div className='absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-lg'>
                    <X className='w-4 h-4 text-gray-300' strokeWidth={2.5} />
                  </div>
                </div>
                {/* Título y subtítulo */}
                <div className='text-center'>
                  <h3 className='text-xl font-bold text-white mb-1'>
                    ¿Rechazar a {`${actionCounterpartUser?.name || ''}`.trim() || 'este usuario'}?
                  </h3>
                  <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                    <AlertTriangle className='w-3 h-3' />
                    Esta persona no podrá volver a contactarte
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className='text-center space-y-2'>
                  <p className='text-gray-300 text-sm'>
                    <span className='font-semibold text-white'>{`${actionCounterpartUser?.name || ''}`.trim()}</span> no podrá enviarte otra
                    solicitud en el futuro.
                  </p>
                </div>
              </ModalBody>

              <ModalFooter className='justify-center gap-3 pb-6'>
                <Button
                  className='bg-gray-800 hover:bg-gray-700 text-gray-300 min-w-[100px]'
                  radius='full'
                  variant='flat'
                  onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  className='bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold min-w-[120px]'
                  isLoading={interactionLoading}
                  radius='full'
                  startContent={!interactionLoading ? <X className='w-4 h-4' strokeWidth={2.5} /> : null}
                  onPress={handleConfirmReject}>
                  Rechazar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
})

MyMatches.displayName = 'MyMatches'

export default MyMatches
