// ========================================
// SERVICIOS UTILITARIOS BASE
// ========================================
// Contiene los servicios fundamentales y clases base

// Servicios base para comunicación HTTP
export { default as ServiceREST } from './serviceREST.js'
export { default as ServiceNoREST } from './serviceNoREST.js'
export { default as api } from './api.js'

// Export por defecto del servicio principal
export { default } from './api.js'
