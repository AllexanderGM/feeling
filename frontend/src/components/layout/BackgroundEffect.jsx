import './backgroundEffect.scss'

/**
 * Componente que crea un fondo oscuro con elipses difuminadas animadas
 * Utiliza un archivo SCSS para estilos mantenibles y organizados
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido que irá sobre el fondo
 * @param {Object} props.style - Estilos adicionales para el contenedor
 * @param {string} props.className - Clases adicionales para el contenedor
 * @returns {React.ReactElement}
 */
const BackgroundEffect = ({ children, style = {}, className = '' }) => {
  return (
    <div className={`background-container ${className}`} style={style}>
      <div className='top-ellipse' />
      <div className='bottom-ellipse' />
      <div className='light-orb-1' />
      <div className='light-orb-2' />
      <div className='light-orb-3' />
      <div className='light-orb-4' />
      <div className='light-orb-5' />
      <div className='light-orb-6' />
      <div className={`content`}>{children}</div>
    </div>
  )
}

export default BackgroundEffect
