import { Logger } from './logger.js'

const fetchData = async (url, options = {}) => {
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    const config = {
      method: 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `HTTP Error: ${response.status}`)
    }

    return { success: true, data: await response.json() }
  } catch (error) {
    Logger.error(Logger.CATEGORIES.NETWORK, 'fetch data', error, {
      context: { url, options }
    })
    return { success: false, error: error.message }
  }
}

export default fetchData
