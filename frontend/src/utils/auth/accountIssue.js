const normalize = value => {
  if (!value) return ''

  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const detectAccountType = (message = '', code = '') => {
  const normalizedMessage = normalize(message)
  const normalizedCode = code?.toString().toUpperCase() || ''

  if (normalizedCode === 'EVENT_ACCOUNT_INCOMPLETE') return 'event'
  if (normalizedCode === 'ACCOUNT_REQUIRES_PASSWORD') return 'event'

  if (normalizedMessage.includes('guest') || normalizedMessage.includes('invitad')) {
    return 'guest'
  }

  if (
    normalizedMessage.includes('evento') ||
    normalizedMessage.includes('event') ||
    (normalizedMessage.includes('registrad') && normalizedMessage.includes('evento'))
  ) {
    return 'event'
  }

  return null
}

export const parseAccountIssue = (result, fallbackEmail = null) => {
  if (!result) return null

  const backendMessage = result.message || result.error?.response?.data?.message || result.error?.message || ''
  const backendCode =
    result.code ||
    result.error?.response?.data?.code ||
    result.error?.response?.data?.error ||
    result.status ||
    result.error?.response?.status ||
    ''

  const type = detectAccountType(backendMessage, backendCode)

  if (!type) return null

  const rawEmail =
    result.email ||
    result.details?.email ||
    result.error?.response?.data?.email ||
    result.error?.response?.data?.details?.email ||
    fallbackEmail

  const normalizedEmail = rawEmail ? rawEmail.trim().toLowerCase() : null

  return {
    type,
    message: backendMessage || null,
    code: backendCode || null,
    status: result.status || result.error?.response?.status || null,
    email: normalizedEmail
  }
}

export default parseAccountIssue
