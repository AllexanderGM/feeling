export default function LiteContainer({ children, className = '', ariaLabel = "Contenedor principal" }) {
  return (
    <div 
      className={`flex flex-col justify-content-center items-center w-full max-w-3xl m-auto ${className}`}
      role="main"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}
