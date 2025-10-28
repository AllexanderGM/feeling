import useAsyncOperation from '../utils/useAsyncOperation.js'
import useError from '../utils/useError.js'

const useMatchOperations = (options = {}) => {
  const asyncHelpers = useAsyncOperation(options)
  const errorHelpers = useError()

  return {
    ...asyncHelpers,
    ...errorHelpers
  }
}

export default useMatchOperations
