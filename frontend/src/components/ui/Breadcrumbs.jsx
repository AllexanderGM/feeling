import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Componente de breadcrumbs para mejorar la navegación y SEO
 */
const Breadcrumbs = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null

  return (
    <nav
      itemScope
      aria-label='Breadcrumb'
      className={`flex items-center gap-2 text-sm text-gray-400 ${className}`}
      itemType='https://schema.org/BreadcrumbList'>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div
            key={item.label}
            itemScope
            className='flex items-center gap-2'
            itemProp='itemListElement'
            itemType='https://schema.org/ListItem'>
            {item.href && !isLast ? (
              <Link className='hover:text-gray-200 transition-colors flex items-center gap-1' itemProp='item' to={item.href}>
                {index === 0 && item.showHomeIcon && <Home className='w-3.5 h-3.5' />}
                <span itemProp='name'>{item.label}</span>
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-200 font-medium' : ''} itemProp='name'>
                {index === 0 && item.showHomeIcon && <Home className='w-3.5 h-3.5 inline mr-1' />}
                {item.label}
              </span>
            )}
            <meta content={String(index + 1)} itemProp='position' />
            {!isLast && <ChevronRight className='w-3.5 h-3.5 text-gray-600' />}
          </div>
        )
      })}
    </nav>
  )
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      showHomeIcon: PropTypes.bool
    })
  ).isRequired,
  className: PropTypes.string
}

export default Breadcrumbs
