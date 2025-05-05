import './BackgroundEffect.scss'

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
      <div className="top-ellipse"></div>
      <div className="bottom-ellipse"></div>
      <div className="content">{children}</div>
    </div>
  )
}

export default BackgroundEffect
