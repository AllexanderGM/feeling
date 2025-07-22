import { Card, CardBody, CardFooter } from '@heroui/react'
// Descomentar para habilitar los tooltips
// import { Tooltip } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

import './cardCategories.scss'

// Descomentar para habilitar las descripciones y colores personalizados
/*
// Descripciones para tooltips
const CATEGORY_DESCRIPTIONS = {
  'Playa': 'Descubre los mejores destinos de playa',
  'Vacaciones': 'Tours completos para relajarte',
  'Aventura': 'Experiencias emocionantes para aventureros',
  'Ecoturismo': 'Turismo sostenible y respetuoso con la naturaleza',
  'Lujo': 'Viajes exclusivos con el máximo confort',
  'Ciudad': 'Explora las ciudades más fascinantes',
  'Montaña': 'Aventuras en las cumbres más impresionantes',
  'Crucero': 'Viajes por mar con todas las comodidades',
  'Adrenalina': 'Para los amantes de las emociones fuertes'
};

// Mapeo de colores para las categorías
const CATEGORY_COLORS = {
  'Playa': 'hover:text-blue-500',
  'Vacaciones': 'hover:text-emerald-500',
  'Aventura': 'hover:text-amber-500',
  'Ecoturismo': 'hover:text-lime-500',
  'Lujo': 'hover:text-purple-500',
  'Ciudad': 'hover:text-rose-500',
  'Montaña': 'hover:text-teal-500',
  'Crucero': 'hover:text-indigo-500',
  'Adrenalina': 'hover:text-orange-500'
};
*/

const CardCategories = ({ item }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    console.log(`Navegando a la categoría: ${item.title} (tag: ${item.tag})`)
    navigate(`/categoria/${item.title.toLowerCase()}`)
  }

  // Descomentar para habilitar colores personalizados
  // const categoryColor = CATEGORY_COLORS[item.title] || 'hover:text-primary';
  // const categoryDescription = CATEGORY_DESCRIPTIONS[item.title] || 'Explora tours en esta categoría';

  // Versión con diseño original
  return (
    <Card className="card-categories" isPressable shadow="sm" onPress={handleCardClick}>
      <CardBody className="card-categories-body">
        <span className="material-symbols-outlined">{item.icon}</span>
      </CardBody>
      <CardFooter className="card-categories-footer">{item.title}</CardFooter>
    </Card>
  )

  // Versión con tooltips y colores personalizados (descomentar para usar)
  /*
  return (
    <Tooltip content={categoryDescription} placement="bottom">
      <Card
        className={`card-categories ${categoryColor}`}
        isPressable
        shadow="sm"
        onPress={handleCardClick}
      >
        <CardBody className="card-categories-body">
          <span className="material-symbols-outlined">{item.icon}</span>
        </CardBody>
        <CardFooter className="card-categories-footer">{item.title}</CardFooter>
      </Card>
    </Tooltip>
  );
  */
}

export default CardCategories
