import { useContext, useMemo } from 'react'
import AuthContext from '@contexts/AuthContext.jsx'

import useAsyncOperation from '../utils/useAsyncOperation.js'
import useError from '../utils/useError.js'

const DEFAULT_ASYNC_OPTIONS = {
  showNotifications: true,
  autoHandleAuth: true
}

const useAuthOperations = () => {
  const authContext = useContext(AuthContext)

  if (!authContext) {
    throw new Error('useAuthOperations debe ser utilizado dentro de AuthProvider')
  }

  const asyncOptions = useMemo(
    () => ({
      authContext,
      showNotifications: DEFAULT_ASYNC_OPTIONS.showNotifications,
      autoHandleAuth: DEFAULT_ASYNC_OPTIONS.autoHandleAuth
    }),
    [authContext]
  )

  const errorHelpers = useError(authContext)
  const asyncHelpers = useAsyncOperation(asyncOptions)

  return {
    authContext,
    ...asyncHelpers,
    ...errorHelpers
  }
}

export default useAuthOperations
