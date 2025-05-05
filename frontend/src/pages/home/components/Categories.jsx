import CardCategories from './CardCategories.jsx'
import './categories.scss'

const Categories = () => {
  const list = [
    {
      title: 'Playa',
      icon: 'pool'
    },
    {
      title: 'Ecoturismo',
      icon: 'Eco'
    },
    {
      title: 'Montaña',
      icon: 'Landscape'
    },
    {
      title: 'Vacaciones',
      icon: 'beach_access'
    },
    {
      title: 'Lujo',
      icon: 'hotel_class'
    },
    {
      title: 'Crucero',
      icon: 'directions_boat'
    },
    {
      title: 'Aventura',
      icon: 'hiking'
    },
    {
      title: 'Ciudad',
      icon: 'location_city'
    },
    {
      title: 'Adrenalina',
      icon: 'paragliding'
    }
  ]

  return (
    <div className="categories">
      {list.map((item, index) => (
        <CardCategories key={index} item={item} />
      ))}
    </div>
  )
}

export default Categories
