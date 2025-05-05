import CardPriceDetalle from './CardPriceDetalle.jsx'
import CardCalendario from './CardCalendario.jsx'

const CardDetalle = ({ tour, onReservar }) => {
  // Para la demostración, si no tenemos tour, creamos uno de ejemplo
  const demoTour = {
    id: 1,
    name: 'Tour al Valle del Aconcagua',
    adultPrice: 69.99,
    childPrice: 39.99,
    description: 'Descubre la belleza natural del Valle del Aconcagua con este tour de día completo',
    images: ['https://via.placeholder.com/800x600?text=Valle+del+Aconcagua'],
    destination: {
      country: 'Chile',
      city: { name: 'Valparaíso' }
    }
  }

  const tourToUse = tour || demoTour

  return (
    <div className="lg:col-span-2 rounded-lg">
      <CardPriceDetalle tourToUse={tourToUse} />
      <CardCalendario tour={tour} tourToUse={tourToUse} onReservar={onReservar} />
    </div>
  )
}

export default CardDetalle
