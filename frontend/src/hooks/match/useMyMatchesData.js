import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { matchQueryService } from '@services'
import { Logger } from '@utils/logger.js'

import useMatchOperations from './useMatchOperations.js'

const createPagination = (overrides = {}) => ({
  page: overrides.page ?? 0,
  size: overrides.size ?? 10,
  totalPages: overrides.totalPages ?? 0,
  totalElements: overrides.totalElements ?? 0
})

const normalizeMatchesResponse = (response, fallbackSize = 10) => {
  if (!response) {
    return { items: [], pagination: createPagination({ size: fallbackSize }) }
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: createPagination({
        size: fallbackSize,
        totalElements: response.length,
        totalPages: response.length > 0 ? 1 : 0
      })
    }
  }

  const baseItems = Array.isArray(response.content) ? response.content : []
  const items = baseItems.length > 0 ? baseItems : Array.isArray(response.data) ? response.data : response.id ? [response] : []
  const paginationSource = response.pageable || {}

  const size = response.size ?? paginationSource.pageSize ?? fallbackSize
  const totalElements = response.totalElements ?? items.length
  const page = response.number ?? response.page ?? paginationSource.pageNumber ?? 0
  const totalPages = response.totalPages ?? paginationSource.totalPages ?? (size ? Math.ceil(totalElements / size) : 0)

  return {
    items,
    pagination: createPagination({
      page,
      size,
      totalElements,
      totalPages
    })
  }
}

const fetchers = {
  all: (page, size) => matchQueryService.getMatchHistory(null, null, null, page, size),
  accepted: (page, size) => matchQueryService.getAcceptedMatches(page, size),
  sent: (page, size) => matchQueryService.getSentMatches(page, size),
  received: (page, size) => matchQueryService.getReceivedMatches(page, size)
}

const operationNames = {
  all: 'obtener historial de matches',
  accepted: 'obtener matches aceptados',
  sent: 'obtener matches enviados',
  received: 'obtener matches recibidos'
}

const successMessages = {
  all: 'Matches cargados correctamente.',
  accepted: 'Matches aceptados cargados correctamente.',
  sent: 'Matches enviados cargados correctamente.',
  received: 'Matches recibidos cargados correctamente.'
}

const APPEND_RETRY_DELAY_MS = 15000

const useMyMatchesData = (options = {}) => {
  const { handleError, withLoading, handleApiResponse, loading } = useMatchOperations({
    showNotifications: false,
    ...options
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const pendingRequestsRef = useRef(new Map())
  const initialLoadRef = useRef(false)
  const attemptedTabsRef = useRef(new Set())
  const appendCooldownRef = useRef(new Map())

  const [allMatches, setAllMatches] = useState([])
  const [acceptedMatches, setAcceptedMatches] = useState([])
  const [sentMatches, setSentMatches] = useState([])
  const [receivedMatches, setReceivedMatches] = useState([])

  const [allPagination, setAllPagination] = useState(createPagination())
  const [acceptedPagination, setAcceptedPagination] = useState(createPagination())
  const [sentPagination, setSentPagination] = useState(createPagination())
  const [receivedPagination, setReceivedPagination] = useState(createPagination())

  const getStateHandlers = useMemo(
    () => ({
      all: {
        setItems: setAllMatches,
        setPagination: setAllPagination,
        pagination: allPagination
      },
      accepted: {
        setItems: setAcceptedMatches,
        setPagination: setAcceptedPagination,
        pagination: acceptedPagination
      },
      sent: {
        setItems: setSentMatches,
        setPagination: setSentPagination,
        pagination: sentPagination
      },
      received: {
        setItems: setReceivedMatches,
        setPagination: setReceivedPagination,
        pagination: receivedPagination
      }
    }),
    [allPagination, acceptedPagination, sentPagination, receivedPagination]
  )

  const runFetch = useCallback(
    async ({ type, page = 0, size = 10, append = false, showNotifications = false, force = false }) => {
      const fetcher = fetchers[type]
      const handlers = getStateHandlers[type]

      if (!fetcher || !handlers) {
        Logger.warn(Logger.CATEGORIES.SERVICE, 'useMyMatchesData', 'Fetcher no definido', { type })

        return null
      }

      const pendingKey = `${type}-${append ? 'append' : 'replace'}-${page}`

      if (append) {
        const lastAttempt = appendCooldownRef.current.get(type)
        const retryDelay = options.appendRetryDelay ?? APPEND_RETRY_DELAY_MS

        if (lastAttempt && Date.now() - lastAttempt < retryDelay) {
          return null
        }
      } else {
        if (!force && attemptedTabsRef.current.has(type)) {
          return null
        }
        attemptedTabsRef.current.add(type)
      }

      if (pendingRequestsRef.current.has(pendingKey)) {
        return pendingRequestsRef.current.get(pendingKey)
      }

      const execute = async () => {
        const rawResponse = await fetcher(page, size)
        const { items, pagination } = normalizeMatchesResponse(rawResponse, size)

        handlers.setItems(prev => (append ? [...prev, ...items] : items))
        handlers.setPagination(() =>
          append
            ? createPagination({
                ...pagination,
                page: pagination.page,
                size: pagination.size
              })
            : pagination
        )

        return { items, pagination }
      }

      const requestPromise = append
        ? (async () => {
            setLoadingMore(true)

            try {
              const data = await execute()

              appendCooldownRef.current.delete(type)

              return data
            } catch (error) {
              appendCooldownRef.current.set(type, Date.now())
              handleError(error, { customMessage: 'Error al cargar más resultados' })
              throw error
            } finally {
              setLoadingMore(false)
            }
          })()
        : (async () => {
            const result = await withLoading(execute, operationNames[type] || 'obtener matches')

            return handleApiResponse(result, successMessages[type], { showNotifications })
          })()

      pendingRequestsRef.current.set(pendingKey, requestPromise)

      try {
        return await requestPromise
      } finally {
        pendingRequestsRef.current.delete(pendingKey)
      }
    },
    [getStateHandlers, handleError, handleApiResponse, withLoading]
  )

  const loadInitialAll = useCallback(async () => {
    await runFetch({ type: 'all', page: 0, size: allPagination.size || 10 })
  }, [allPagination.size, runFetch])

  const loadMoreByType = useCallback(
    async type => {
      const handlers = getStateHandlers[type]

      if (!handlers) return

      const { pagination } = handlers

      if (pagination.page >= pagination.totalPages - 1) return

      const retryDelay = options.appendRetryDelay ?? APPEND_RETRY_DELAY_MS
      const lastAttempt = appendCooldownRef.current.get(type)

      if (lastAttempt && Date.now() - lastAttempt < retryDelay) {
        return
      }

      await runFetch({
        type,
        page: pagination.page + 1,
        size: pagination.size,
        append: true
      })
    },
    [getStateHandlers, runFetch]
  )

  useEffect(() => {
    if (initialLoadRef.current) {
      return
    }

    initialLoadRef.current = true

    loadInitialAll().catch(error => {
      Logger.error(Logger.CATEGORIES.SERVICE, 'useMyMatchesData', 'Error en carga inicial de matches', { error })
      handleError(error, { customMessage: 'No pudimos cargar tus matches. Intenta nuevamente.' })
    })
  }, [handleError, loadInitialAll])

  const state = useMemo(
    () => ({
      all: { items: allMatches, pagination: allPagination },
      accepted: { items: acceptedMatches, pagination: acceptedPagination },
      sent: { items: sentMatches, pagination: sentPagination },
      received: { items: receivedMatches, pagination: receivedPagination }
    }),
    [allMatches, allPagination, acceptedMatches, acceptedPagination, sentMatches, sentPagination, receivedMatches, receivedPagination]
  )

  return {
    loading,
    loadingMore,
    state,
    loadByType: runFetch,
    loadMoreByType
  }
}

export default useMyMatchesData
