import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
  Card,
  CardBody
} from '@heroui/react'
import { Package, DollarSign, Hash, FileText } from 'lucide-react'

const EditPlanForm = ({ isOpen, onClose, onSubmit, loading, plan }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attempts: '',
    price: '',
    isActive: true
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (plan && isOpen) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        attempts: plan.attempts?.toString() || '',
        price: plan.price?.toString() || '',
        isActive: plan.isActive ?? true
      })
    }
  }, [plan, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.attempts || parseInt(formData.attempts) <= 0) {
      newErrors.attempts = 'Debe ser un número mayor a 0'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Debe ser un precio válido mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const planData = {
      ...formData,
      attempts: parseInt(formData.attempts),
      price: parseFloat(formData.price)
    }

    onSubmit(planData)
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      attempts: '',
      price: '',
      isActive: true
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-gray-800 border border-gray-700",
        closeButton: "text-gray-400 hover:text-gray-200"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Editar Plan de Match</h2>
              <p className="text-sm text-gray-400 font-normal">
                Modifica la configuración del plan de match
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="gap-6">
          <div className="space-y-6">
            {/* Información básica */}
            <Card className="bg-gray-700/30 border-gray-600/50">
              <CardBody className="gap-4">
                <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Información Básica
                </h3>

                <Input
                  label="Nombre del Plan"
                  placeholder="Ej: Plan Básico, Plan Premium"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  startContent={<Package className="w-4 h-4 text-gray-400" />}
                  classNames={{
                    input: "text-gray-200",
                    inputWrapper: "bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500"
                  }}
                />

                <Textarea
                  label="Descripción"
                  placeholder="Describe las características y beneficios del plan"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description}
                  maxRows={3}
                  classNames={{
                    input: "text-gray-200",
                    inputWrapper: "bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500"
                  }}
                />
              </CardBody>
            </Card>

            {/* Configuración del plan */}
            <Card className="bg-gray-700/30 border-gray-600/50">
              <CardBody className="gap-4">
                <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-green-400" />
                  Configuración del Plan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Número de Intentos"
                    placeholder="1, 5, 10..."
                    value={formData.attempts}
                    onChange={(e) => handleInputChange('attempts', e.target.value)}
                    isInvalid={!!errors.attempts}
                    errorMessage={errors.attempts}
                    min="1"
                    startContent={<Hash className="w-4 h-4 text-gray-400" />}
                    classNames={{
                      input: "text-gray-200",
                      inputWrapper: "bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500"
                    }}
                  />

                  <Input
                    type="number"
                    label="Precio (USD)"
                    placeholder="2.99, 9.99, 16.99..."
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price}
                    min="0"
                    step="0.01"
                    startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
                    classNames={{
                      input: "text-gray-200",
                      inputWrapper: "bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500"
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div>
                    <p className="font-medium text-gray-200">Plan Activo</p>
                    <p className="text-sm text-gray-400">
                      Los usuarios podrán comprar este plan
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.isActive}
                    onValueChange={(value) => handleInputChange('isActive', value)}
                    color="success"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Estadísticas del plan actual */}
            {plan && (
              <Card className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-blue-900/20 border-purple-700/50">
                <CardBody>
                  <h3 className="text-lg font-medium text-purple-300 mb-3">Estadísticas Actuales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-400">{plan.totalPurchases || 0}</p>
                      <p className="text-xs text-gray-400">Total Compras</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        ${(plan.revenue || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400">Ingresos Generados</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Preview */}
            {(formData.name || formData.price || formData.attempts) && (
              <Card className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-purple-900/20 border-blue-700/50">
                <CardBody>
                  <h3 className="text-lg font-medium text-blue-300 mb-3">Vista Previa de Cambios</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-100">
                          {formData.name || 'Nombre del Plan'}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {formData.description || 'Descripción del plan'}
                        </p>
                        {formData.attempts && (
                          <p className="text-sm text-blue-400 mt-2">
                            {formData.attempts} {parseInt(formData.attempts) === 1 ? 'intento' : 'intentos'} de match
                          </p>
                        )}
                      </div>
                      {formData.price && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">
                            ${parseFloat(formData.price).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">USD</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            className="border-gray-600 text-gray-300"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            startContent={!loading && <Package className="w-4 h-4" />}
          >
            Actualizar Plan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditPlanForm