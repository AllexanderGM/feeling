import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip
} from '@heroui/react'
import { Package, DollarSign, Star, Check, CreditCard } from 'lucide-react'

const PlanPurchaseModal = ({ isOpen, onClose, plans, onPurchase, currentAttempts }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              <h2 className="text-xl font-bold">Comprar Plan de Match</h2>
              <p className="text-sm text-gray-400 font-normal">
                Te quedan {currentAttempts} intentos. ¡Compra más para seguir conectando!
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="gap-6">
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`border ${
                  plan.popular 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-purple-900/30' 
                    : 'border-gray-600 bg-gray-700/30'
                } hover:border-blue-400 transition-colors cursor-pointer`}
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-100">{plan.name}</h3>
                        {plan.popular && (
                          <Chip
                            size="sm"
                            color="primary"
                            startContent={<Star className="w-3 h-3" />}
                            className="text-xs"
                          >
                            Más Popular
                          </Chip>
                        )}
                      </div>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">
                            {plan.attempts} {plan.attempts === 1 ? 'intento' : 'intentos'} de match
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">
                            Válido por 30 días
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">
                            Soporte 24/7
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        ${plan.price}
                      </div>
                      <div className="text-sm text-gray-400 mb-4">USD</div>
                      
                      <Button
                        color={plan.popular ? 'primary' : 'secondary'}
                        className="w-full"
                        startContent={<CreditCard className="w-4 h-4" />}
                        onPress={() => onPurchase(plan)}
                      >
                        Comprar
                      </Button>
                    </div>
                  </div>

                  {/* Value calculation */}
                  <div className="mt-4 pt-4 border-t border-gray-600/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Precio por intento:</span>
                      <span className="text-gray-300 font-medium">
                        ${(plan.price / plan.attempts).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Security notice */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-400 mb-1">Compra Segura</p>
                <p className="text-sm text-green-300">
                  Todas las transacciones están protegidas con encriptación SSL de 256 bits. 
                  Puedes cancelar tu plan en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={onClose}
            className="border-gray-600 text-gray-300"
          >
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PlanPurchaseModal