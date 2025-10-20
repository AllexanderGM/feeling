# Flujo de Compra de Planes de Match

Este directorio contiene todas las páginas relacionadas con el proceso de compra de planes de match mediante la pasarela de pago Wompi.

## 📁 Estructura de Páginas

### 1. **PurchasePlans.jsx**

Página principal de planes de match donde el usuario puede ver todos los planes disponibles.

**Características:**

- Lista todos los planes activos disponibles
- Muestra información detallada de cada plan (precio, intentos, beneficios)
- Destaca el plan más popular
- Muestra los intentos actuales del usuario
- Incluye sección de FAQ y beneficios
- Diseño responsive con cards atractivas

**Ruta:** `/purchase/plans`

### 2. **Checkout.jsx**

Página de resumen de compra donde el usuario revisa los detalles antes de proceder al pago.

**Características:**

- Resumen del plan seleccionado
- Información de facturación (nombre, email)
- Cálculo de impuestos (IVA 19%)
- Total a pagar
- Aceptación de términos y condiciones
- Validaciones antes de proceder

**Ruta:** `/purchase/checkout`

### 3. **Payment.jsx**

Página de procesamiento de pago con integración de Wompi.

**Características:**

- Integración del widget de Wompi
- Carga dinámica del script de Wompi
- Muestra resumen del plan
- Métodos de pago disponibles (Tarjetas, PSE, Nequi, etc.)
- Indicadores de seguridad y encriptación
- Manejo de callbacks de Wompi

**Ruta:** `/purchase/payment`

### 4. **PaymentSuccess.jsx**

Página de confirmación de pago exitoso.

**Características:**

- Animación de confetti celebratorio
- Detalles de la transacción
- Información del plan adquirido
- Opciones para descargar recibo
- Botones de navegación a Matches o Inicio
- Información sobre próximos pasos
- Mensajes de agradecimiento

**Ruta:** `/purchase/success`

### 5. **PaymentError.jsx**

Página de error cuando el pago falla.

**Características:**

- Detalles del error ocurrido
- Razones comunes de fallos de pago
- Opciones para reintentar
- Botón de contacto con soporte
- Consejos para el siguiente intento
- Navegación alternativa

**Ruta:** `/purchase/error`

## 🔄 Flujo Completo

```
1. Usuario en /matches ve que no tiene intentos
   ↓
2. Click en "Comprar Plan" → /purchase/plans
   ↓
3. Selecciona un plan → /purchase/checkout
   ↓
4. Revisa detalles y acepta términos → /purchase/payment
   ↓
5. Completa pago con Wompi
   ↓
6a. Pago exitoso → /purchase/success
6b. Pago fallido → /purchase/error
```

## 🎨 Identidad Gráfica

Todas las páginas siguen la identidad visual de la aplicación:

- **Colores principales:** Azul, Púrpura, Rosa (gradientes)
- **Tema oscuro:** Fondo gris oscuro con elementos semitransparentes
- **Componentes:** Hero UI (Card, Button, Input, etc.)
- **Iconos:** Lucide React
- **Tipografía:** Sistema de escalas de Hero UI

## 🔐 Integración con Wompi

### Variables de Entorno

```env
VITE_WOMPI_PUBLIC_KEY=pub_test_YOUR_PUBLIC_KEY
```

### Configuración

- **Moneda:** COP (Pesos Colombianos)
- **Monto:** En centavos (precio \* 100)
- **Métodos de pago:** Tarjetas, PSE, Nequi, Bancolombia
- **Seguridad:** SSL 256 bits, PCI DSS

### Callbacks

El widget de Wompi maneja los siguientes estados:

- `APPROVED`: Pago aprobado → Redirige a /purchase/success
- `DECLINED`: Pago rechazado → Redirige a /purchase/error
- `ERROR`: Error en transacción → Redirige a /purchase/error

## 📝 Servicios Utilizados

### matchPlanService

- `getAvailablePlans()`: Obtiene planes activos
- `purchaseMatchPlan(planId)`: Procesa la compra del plan

### Schemas de Usuario

- `getUserMatches()`: Obtiene intentos disponibles del usuario
- `getUserEmail()`: Email del usuario
- `getUserName()` / `getUserLastName()`: Nombre completo

## 🛡️ Protección de Rutas

Todas las rutas de compra están protegidas con:

```jsx
<RequireCompleteProfile>
  <ComponenteDePago />
</RequireCompleteProfile>
```

Esto asegura que:

1. El usuario está autenticado
2. El usuario ha completado su perfil
3. El usuario tiene los permisos necesarios

## 🚀 Características de UX

### Validaciones

- Verificación de plan seleccionado
- Aceptación de términos obligatoria
- Validación de datos de usuario

### Feedback al Usuario

- Loaders durante carga
- Mensajes de error claros
- Confirmaciones visuales
- Animaciones de éxito/error

### Navegación

- Botones de retroceso en cada paso
- Breadcrumbs implícitos
- Redirecciones automáticas en caso de error

## 📱 Responsive Design

Todas las páginas son completamente responsive:

- **Mobile:** 1 columna, stack vertical
- **Tablet:** 2 columnas para algunas secciones
- **Desktop:** 3 columnas, layouts más complejos

## 🔧 Mantenimiento

### Actualizar Planes

Los planes se cargan dinámicamente desde el backend. Para actualizar:

1. Modificar planes en el panel de administración
2. Los cambios se reflejan automáticamente

### Modificar Wompi

Para cambiar configuración de Wompi:

1. Actualizar variables de entorno
2. Modificar componente Payment.jsx
3. Verificar callbacks y URLs de redirección

## 📚 Dependencias

- `react-router-dom`: Navegación entre páginas
- `@heroui/react`: Componentes UI
- `lucide-react`: Iconos
- `canvas-confetti`: Animación de éxito
- `react-helmet-async`: Meta tags SEO

## 🐛 Debugging

### Logs

Todos los errores se registran con Logger:

```javascript
Logger.error(Logger.CATEGORIES.SERVICE, 'operation_name', 'Error message', { context })
```

### Estados a Verificar

1. Plan en navigation state
2. Usuario autenticado
3. Datos de Wompi correctos
4. Variables de entorno configuradas

## 📞 Soporte

Si hay problemas con el flujo de pago:

1. Verificar consola del navegador
2. Revisar logs del backend
3. Verificar configuración de Wompi
4. Contactar soporte de Wompi si es necesario
