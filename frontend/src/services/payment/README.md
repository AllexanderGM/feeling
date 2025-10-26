# Módulo de Pagos - Feeling Platform

Este módulo contiene servicios y utilidades compartidas para el manejo de pagos en la plataforma Feeling.

## 📁 Estructura

```
src/services/payment/
├── paymentService.js      # Servicio base con utilidades compartidas
├── wompiAdapter.js        # Adaptador para integración con Wompi
├── index.js               # Exportaciones centralizadas
└── README.md              # Este archivo
```

## 🎯 Propósito

Este módulo centraliza la lógica compartida de pagos que se utiliza en:
- **Pagos de eventos** (`src/pages/event/payment/`)
- **Compra de planes de match** (`src/pages/matches/purchase/`)

## 📦 Componentes

### PaymentService

Servicio base que proporciona:

#### Gestión de Estados
- `normalizeStatus(status)` - Normaliza estados de pago
- `getStatusConfig(status)` - Obtiene configuración visual por estado
- `isSuccessStatus(status)` - Verifica si el pago fue exitoso
- `isFailureStatus(status)` - Verifica si el pago fue rechazado
- `isPendingStatus(status)` - Verifica si el pago está pendiente

#### Formateo
- `formatCurrency(amount)` - Formatea montos en COP
- `formatTransactionDate(date)` - Formatea fechas de transacción

#### Extracción de Datos
- `extractEntityTypeFromReference(reference)` - Extrae tipo de entidad (event/match)
- `extractEntityIdFromReference(reference)` - Extrae ID de la entidad

### WompiAdapter

Adaptador especializado para Wompi que proporciona:

#### Extracción de Parámetros URL
- `extractTransactionId(searchParams)` - ID de transacción
- `extractReference(searchParams)` - Referencia de pago
- `extractStatus(searchParams)` - Estado del pago
- `extractEnvironment(searchParams)` - Ambiente (test/prod)
- `extractAllParams(searchParams)` - Todos los parámetros

#### Manejo de Webhooks
- `formatWebhookPayload(payload)` - Formatea payload del webhook
- `isValidTransaction(transaction)` - Valida transacción

#### Utilidades
- `getCheckoutUrl(checkoutId, env)` - URL del checkout de Wompi
- `getErrorMessage(errorCode)` - Mensaje amigable por código de error

## 💡 Uso

### Ejemplo 1: Normalizar estado de pago

```javascript
import { PaymentService } from '@services/payment'

const status = 'approved'
const normalizedStatus = PaymentService.normalizeStatus(status) // 'APPROVED'
const config = PaymentService.getStatusConfig(normalizedStatus)

console.log(config.title) // '¡Pago confirmado!'
console.log(config.iconClass) // 'text-green-400'
```

### Ejemplo 2: Extraer parámetros de URL de Wompi

```javascript
import { WompiAdapter } from '@services/payment'

const searchParams = new URLSearchParams(window.location.search)
const params = WompiAdapter.extractAllParams(searchParams)

console.log(params.transactionId) // '11979555-1761314156-38572'
console.log(params.status) // 'APPROVED'
```

### Ejemplo 3: Extraer información de referencia

```javascript
import { PaymentService } from '@services/payment'

const reference = 'EVENT-123-1634567890'
const entityType = PaymentService.extractEntityTypeFromReference(reference) // 'event'
const entityId = PaymentService.extractEntityIdFromReference(reference) // 123
```

### Ejemplo 4: Formatear montos

```javascript
import { PaymentService } from '@services/payment'

const amount = 50000
const formatted = PaymentService.formatCurrency(amount) // '$50.000'
```

## 🔄 Estados de Pago Soportados

| Estado | Descripción | Color |
|--------|-------------|-------|
| `APPROVED` | Pago confirmado | Verde |
| `PENDING` | Pago en revisión | Amarillo |
| `DECLINED` | Pago rechazado | Rojo |
| `ERROR` | Error en verificación | Naranja |
| `VOIDED` | Pago anulado | Gris |
| `UNKNOWN` | Estado desconocido | Gris |

## 🎨 Configuración Visual

Cada estado incluye:
- **title**: Título a mostrar
- **description**: Descripción por defecto
- **icon**: Componente de icono (Lucide React)
- **iconClass**: Clases CSS para el icono
- **badgeClass**: Clases CSS para el badge

## 📝 Formato de Referencia de Pago

Las referencias de pago siguen el formato:
```
{TIPO}-{ID}-{TIMESTAMP}
```

Ejemplos:
- `EVENT-123-1634567890` - Pago de evento con ID 123
- `MATCH-456-1634567890` - Compra de plan de match con ID 456

## 🔗 Integración con Componentes UI

Este módulo trabaja en conjunto con:
- `src/components/payment/` - Componentes UI compartidos
- `src/pages/event/payment/` - Páginas de pago de eventos
- `src/pages/matches/purchase/` - Páginas de compra de planes

## 🚀 Próximas Mejoras

- [ ] Agregar soporte para más pasarelas de pago
- [ ] Implementar caché de transacciones
- [ ] Agregar tests unitarios
- [ ] Documentar flujo de webhooks
- [ ] Agregar métricas de conversión

## 📚 Referencias

- [Documentación Wompi](https://docs.wompi.co/)
- [Guía de integración](https://docs.wompi.co/docs/es/integracion-checkout)
