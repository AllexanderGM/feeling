import useAsyncOperation from '../utils/useAsyncOperation.js'
import useError from '../utils/useError.js'

/**
 * Helper hook that centralizes async + error handling for event services.
 * Mirrors the pattern used in other domains so event hooks remain lean.
 */
const useEventOperations = (options = {}) => {
  const asyncHelpers = useAsyncOperation(options)
  const errorHelpers = useError()

  return {
    ...asyncHelpers,
    ...errorHelpers
  }
}

export default useEventOperations
