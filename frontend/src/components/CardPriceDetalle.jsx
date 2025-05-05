import { Card, CardBody, CardHeader } from '@heroui/react'

const CardPriceDetalle = ({ tourToUse }) => {
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="bg-gray-100 py-4 px-6 flex justify-center items-center">
        <h3 className="font-semibold text-2xl text-gray-800">Precio</h3>
      </CardHeader>
      <CardBody className="flex flex-row justify-between items-center p-6">
        <div className="flex flex-col items-center px-12">
          <div className="text-sm text-gray-500 mb-1">Desde</div>
          <div className="font-bold text-3xl text-black mb-1">${tourToUse.childPrice}</div>
          <div className="text-sm text-gray-600">niño</div>
        </div>

        <div className="h-12 w-px bg-gray-200 mx-2"></div>

        <div className="flex flex-col items-center px-12">
          <div className="text-sm text-gray-500 mb-1">Desde</div>
          <div className="font-bold text-3xl text-black mb-1">${tourToUse.adultPrice}</div>
          <div className="text-sm text-gray-600">adulto</div>
        </div>
      </CardBody>
    </Card>
  )
}

export default CardPriceDetalle
