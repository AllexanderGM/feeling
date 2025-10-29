# Componentes de Pago - Feeling Platform

Componentes UI reutilizables para páginas de estado de pago en eventos y matches.

## 📁 Estructura

```
src/components/payment/
├── PaymentDetailRow.jsx     # Fila de detalle de transacción
├── PaymentStatusBadge.jsx   # Badge de estado de pago
├── PaymentStatusCard.jsx    # Card principal con estado
├── index.js                 # Exportaciones
└── README.md                # Este archivo
```

## 🎯 Componentes

### PaymentDetailRow

Muestra una fila de detalle con label y valor.

**Props:**

- `label` (string): Etiqueta del campo
- `value` (string|number): Valor a mostrar

**Ejemplo:**

```jsx
import { PaymentDetailRow } from '@components/payment'
;<PaymentDetailRow label='ID de transacción' value='11979555-1761314156-38572' />
```

**Resultado:**

```
┌─────────────────────────────────┐
│ ID DE TRANSACCIÓN               │
│ 11979555-1761314156-38572       │
└─────────────────────────────────┘
```

---

### PaymentStatusBadge

Badge que muestra el estado del pago con icono.

**Props:**

- `status` (string): Estado del pago (APPROVED, PENDING, etc.)
- `config` (object): Configuración visual del estado
  - `badgeClass` (string): Clases CSS para el badge
- `icon` (Component): Icono opcional (default: CalendarDays)

**Ejemplo:**

```jsx
import { PaymentStatusBadge } from '@components/payment'
import { PaymentService } from '@services/payment'

const config = PaymentService.getStatusConfig('APPROVED')

<PaymentStatusBadge
  status="APPROVED"
  config={config}
/>
```

**Resultado:**

```
┌────────────────────────────────┐
│ 📅 Estado reportado: APPROVED  │ (fondo verde)
└────────────────────────────────┘
```

---

### PaymentStatusCard

Card principal que muestra el estado del pago con icono grande, título y descripción.

**Props:**

- `statusConfig` (object): Configuración del estado
  - `icon` (Component): Icono del estado
  - `iconClass` (string): Clases CSS para el icono
  - `title` (string): Título del estado
- `message` (string): Mensaje personalizado (opcional)
- `description` (string): Descripción por defecto
- `badge` (ReactNode): Badge de estado a mostrar

**Ejemplo:**

```jsx
import { PaymentStatusCard, PaymentStatusBadge } from '@components/payment'
import { PaymentService } from '@services/payment'

const config = PaymentService.getStatusConfig('APPROVED')

<PaymentStatusCard
  statusConfig={config}
  message="Tu reserva quedó confirmada"
  description={config.description}
  badge={<PaymentStatusBadge status="APPROVED" config={config} />}
/>
```

**Resultado:**

```
┌───────────────────────────────────────────┐
│              ┌─────────┐                  │
│              │    ✓    │ (icono grande)   │
│              └─────────┘                  │
│                                           │
│        ¡Pago confirmado!                  │
│   Tu reserva quedó confirmada             │
│                                           │
│   ┌──────────────────────────────┐       │
│   │ 📅 Estado reportado: APPROVED│       │
│   └──────────────────────────────┘       │
└───────────────────────────────────────────┘
```

## 💡 Uso Conjunto

### Página completa de estado de pago

```jsx
import { Card, CardBody, Divider } from '@heroui/react'
import { PaymentStatusCard, PaymentStatusBadge, PaymentDetailRow } from '@components/payment'
import { PaymentService, WompiAdapter } from '@services/payment'

const EventPaymentStatus = () => {
  const [searchParams] = useSearchParams()

  // Extraer parámetros
  const params = WompiAdapter.extractAllParams(searchParams)
  const status = PaymentService.normalizeStatus(params.status)
  const config = PaymentService.getStatusConfig(status)

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      {/* Card principal de estado */}
      <PaymentStatusCard
        statusConfig={config}
        description={config.description}
        badge={<PaymentStatusBadge status={status} config={config} />}
      />

      {/* Card con detalles */}
      <Card>
        <CardBody>
          <div className='grid gap-3 sm:grid-cols-2'>
            <PaymentDetailRow label='ID de transacción' value={params.transactionId} />
            <PaymentDetailRow label='Referencia' value={params.reference} />
            <PaymentDetailRow label='Ambiente' value={params.environment} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
```

## 🎨 Estilos

Todos los componentes usan:

- **Tema oscuro** (gray-800, gray-900, gray-950)
- **Backdrop blur** para efecto de vidrio
- **Bordes sutiles** (border-gray-700/50)
- **Texto legible** (gray-100, gray-200, gray-300)

## 🔄 Integración con PaymentService

Estos componentes están diseñados para trabajar con `PaymentService`:

```javascript
// 1. Normalizar estado
const status = PaymentService.normalizeStatus(rawStatus)

// 2. Obtener configuración visual
const config = PaymentService.getStatusConfig(status)

// 3. Usar en componentes
<PaymentStatusCard statusConfig={config} ... />
<PaymentStatusBadge status={status} config={config} />
```

## 📦 Exportaciones

Todos los componentes se exportan desde `index.js`:

```javascript
export { PaymentDetailRow } from './PaymentDetailRow.jsx'
export { PaymentStatusBadge } from './PaymentStatusBadge.jsx'
export { PaymentStatusCard } from './PaymentStatusCard.jsx'
```

## 🚀 Uso en Páginas

### Eventos

`src/pages/event/payment/EventPaymentStatus.jsx`

### Matches (próximamente)

`src/pages/matches/purchase/MatchPaymentStatus.jsx`

## ✨ Beneficios

- ✅ **Reutilizables**: Un solo código para eventos y matches
- ✅ **Consistentes**: UI uniforme en toda la plataforma
- ✅ **Mantenibles**: Cambios en un solo lugar
- ✅ **Documentados**: Ejemplos claros de uso
- ✅ **Testeables**: Componentes aislados y simples
