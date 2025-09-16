import { Filter, RotateCcw } from 'lucide-react'
import { Button } from '@heroui/react'
import { getNavigationStyles } from './navigation/navigationUtils.js'

// Importar logos (solo versiones dark)
import logoGreyDark from '@assets/logo/logo-grey-dark.svg'
import logoPrimaryDark from '@assets/logo/logo-primary-dark.svg'
import logoSecondaryDark from '@assets/logo/logo-secondary-dark.svg'

const Header = ({ onOpenFilters, onRefresh, activeFiltersCount = 0, user }) => {
  const styles = getNavigationStyles()

  // Función para obtener el logo según la categoría del usuario
  const getLogo = () => {
    const categoryInterest = user?.profile?.categoryInterest || user?.categoryInterest

    const logoMap = {
      ROUSE: logoPrimaryDark,
      SPIRIT: logoSecondaryDark,
      ESSENCE: logoGreyDark,
      default: logoGreyDark
    }

    return logoMap[categoryInterest?.toUpperCase()] || logoMap.default
  }

  return (
    <div className='fixed top-0 md:top-4 left-0 md:left-4 right-0 md:right-4 z-50 px-4 md:px-0 py-3 md:py-0'>
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <div className={styles.container}>
          <img src={getLogo()} alt='Feeling Logo' className='h-5 w-auto object-contain' />
        </div>

        {/* Botones sin contenedor */}
        <div className='flex items-center gap-1'>
          {/* Botón Filtros */}
          <Button
            isIconOnly
            variant='flat'
            color='default'
            radius='full'
            size='lg'
            className={`${styles.button} ${styles.inactiveButton} bg-background/75 backdrop-blur-xl border border-gray-600/30 shadow-2xl ring-1 ring-primary-500/10 h-12 w-12`}
            onPress={onOpenFilters}>
            <div className='relative'>
              <Filter size={18} />
              {activeFiltersCount > 0 && (
                <div className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-semibold border border-background'>
                  {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
                </div>
              )}
            </div>
          </Button>

          {/* Botón Recargar */}
          <Button
            isIconOnly
            variant='flat'
            color='default'
            radius='full'
            size='lg'
            className={`${styles.button} ${styles.inactiveButton} bg-background/75 backdrop-blur-xl border border-gray-600/30 shadow-2xl ring-1 ring-primary-500/10 h-12 w-12`}
            onPress={onRefresh}>
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Header
