import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Select, SelectItem, Divider } from '@heroui/react'
import { useAuth } from '@context/AuthContext.jsx'
import { User, Users, Mail } from 'lucide-react'

const ConfirmationDetails = ({ tourInfo, onSelectionChange }) => {
  const { user } = useAuth()

  // Estado para las selecciones
  const [selectedAdults, setSelectedAdults] = useState(1) // Mínimo 1 adulto (el usuario logueado)
  const [selectedChildren, setSelectedChildren] = useState(0)

  // Crear opciones para adultos (desde 1 hasta 10)
  const adultOptions = Array.from({ length: 10 }, (_, i) => ({
    key: `${i + 1}`,
    label: `${i + 1}`,
    value: i + 1
  }))

  // Crear opciones para niños (desde 0 hasta 10)
  const childOptions = Array.from({ length: 11 }, (_, i) => ({
    key: `${i}`,
    label: `${i}`,
    value: i
  }))

  // Manejadores de cambios
  const handleAdultsChange = e => {
    // Convertir explícitamente el valor a número entero
    const numAdults = parseInt(e.target.value, 10) || 1
    setSelectedAdults(numAdults)
    onSelectionChange?.({ adults: numAdults, children: selectedChildren })
  }

  const handleChildrenChange = e => {
    // Convertir explícitamente el valor a número entero
    const numChildren = parseInt(e.target.value, 10) || 0
    setSelectedChildren(numChildren)
    onSelectionChange?.({ adults: selectedAdults, children: numChildren })
  }

  // Efectos para inicializar con el usuario logueado
  useEffect(() => {
    if (user) {
      // Notificar el componente padre de las selecciones iniciales
      // Asegurarse de que los valores sean numéricos
      onSelectionChange?.({
        adults: parseInt(selectedAdults, 10) || 1,
        children: parseInt(selectedChildren, 10) || 0
      })
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Cargando información del usuario...</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <h2 className="text-xl font-semibold text-gray-800">Confirmación de Detalles</h2>
      </CardHeader>
      <CardBody>
        {/* Datos del usuario (no editables) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nombre completo</p>
                <p className="font-medium">{`${user.name || 'Usuario'} ${user.lastName || ''}`}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Perfil de usuario"
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center border-2 border-primary-100">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Usuario registrado</p>
                <p className="text-xs text-gray-400">Los datos de tu perfil se usarán para esta reserva</p>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Selección de adultos y niños */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Número de personas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <label htmlFor="adults" className="text-gray-700">
                    Adultos
                  </label>
                </div>
                <span className="text-xs bg-primary-50 text-primary py-1 px-2 rounded">${tourInfo?.adultPrice || 0} / persona</span>
              </div>

              <Select
                id="adults"
                className="w-full"
                size="sm"
                items={adultOptions}
                labelPlacement="outside-left"
                placeholder="Seleccione cantidad"
                selectedKeys={[`${selectedAdults}`]}
                onChange={handleAdultsChange}>
                {item => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
              <p className="text-xs text-gray-500">El primer adulto eres tú</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <label htmlFor="children" className="text-gray-700">
                    Niños
                  </label>
                </div>
                <span className="text-xs bg-primary-50 text-primary py-1 px-2 rounded">${tourInfo?.childPrice || 0} / persona</span>
              </div>

              <Select
                id="children"
                className="w-full"
                size="sm"
                items={childOptions}
                labelPlacement="outside-left"
                placeholder="Seleccione cantidad"
                selectedKeys={[`${selectedChildren}`]}
                onChange={handleChildrenChange}>
                {item => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
              <p className="text-xs text-gray-500">Menores de 12 años</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default ConfirmationDetails
