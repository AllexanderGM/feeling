import { useState, useEffect, useCallback, useRef } from 'react'
import { Logger } from '@utils/logger.js'

const useUserSearch = (fetchUsers, initialPage = 0, initialRowsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(initialPage)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [isSearching, setIsSearching] = useState(false)

  const debounceTimer = useRef(null)

  // Debounce de la búsqueda
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    setIsSearching(true)

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setIsSearching(false)
    }, 500) // 500ms de delay

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery])

  // Ejecutar búsqueda cuando cambie el query debounced, página o filas por página
  useEffect(() => {
    Logger.debug(Logger.CATEGORIES.USER, 'ejecutar búsqueda usuario', {
      page,
      rowsPerPage,
      query: debouncedQuery
    })

    fetchUsers(page, rowsPerPage, debouncedQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, rowsPerPage])

  // Handlers
  const handleSearchChange = useCallback(
    value => {
      setSearchQuery(value || '')
      // Reset a la primera página cuando se hace una nueva búsqueda
      if (page !== 0) {
        setPage(0)
      }
    },
    [page]
  )

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setPage(0)
  }, [])

  const handlePageChange = useCallback(newPage => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback(newRowsPerPage => {
    setRowsPerPage(newRowsPerPage)
    setPage(0) // Reset a primera página
  }, [])

  return {
    // Estados
    searchQuery,
    debouncedQuery,
    page,
    rowsPerPage,
    isSearching,

    // Handlers
    handleSearchChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,

    // Para compatibilidad con componente existente
    filterValue: searchQuery,
    onSearchChange: handleSearchChange,
    onClear: handleClearSearch,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange
  }
}

export default useUserSearch
