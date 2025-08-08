export default function AttributeDetailRenderer({ detail, size = 'md', className = '' }) {
  if (!detail) return null

  const isColor = detail.startsWith('#')

  const sizeClasses = {
    sm: isColor ? 'w-3 h-3' : 'text-sm',
    md: isColor ? 'w-4 h-4' : 'text-lg',
    lg: isColor ? 'w-6 h-6' : 'text-xl',
    xl: isColor ? 'w-8 h-8' : 'text-2xl'
  }

  if (isColor) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full border border-gray-300 ${className}`}
        style={{ backgroundColor: detail }}
        title={detail}
      />
    )
  }

  return (
    <span
      className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
      style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}
      title={detail}>
      {detail}
    </span>
  )
}

// Componente para botón de atributo con detalle
export const AttributeButton = ({ option, isSelected, onClick, className = '' }) => {
  const baseClasses = `
    flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer
    ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}
    ${className}
  `

  return (
    <button type='button' onClick={() => onClick(option.value)} className={baseClasses}>
      <AttributeDetailRenderer detail={option.detail} size='md' />
      <span className='text-sm'>{option.label}</span>
    </button>
  )
}

// Componente para selector de color (específico para ojos/cabello)
export const ColorSelector = ({ options, selectedValue, onChange, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {options.map(option => (
        <button
          key={option.key}
          type='button'
          onClick={() => onChange(option.value)}
          className='relative group flex flex-col items-center p-2 transition-all'>
          <div
            className={`
              w-12 h-12 rounded-full border-3 transition-all
              ${selectedValue === option.value ? 'border-blue-500 shadow-lg scale-110' : 'border-gray-400 hover:border-gray-500'}
            `}
            style={{ backgroundColor: option.detail || '#808080' }}
          />
          <span className='text-xs text-gray-600 mt-1 text-center max-w-16 truncate'>{option.label}</span>

          {selectedValue === option.value && (
            <div className='absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs'>✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// Componente para grid de iconos (género, religión, etc.)
export const IconGrid = ({ options, selectedValue, onChange, columns = 3, className = '' }) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {options.map(option => (
        <button
          key={option.key}
          type='button'
          onClick={() => onChange(option.value)}
          className={`
            flex flex-col items-center p-4 rounded-lg border-2 transition-all
            ${selectedValue === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}>
          <AttributeDetailRenderer detail={option.detail} size='xl' className='mb-2' />
          <span className='text-sm text-center'>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
