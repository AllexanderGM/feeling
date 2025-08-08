export default function LiteContainer({ children, className = '', ariaLabel = 'Contenedor principal' }) {
  return (
    <div
      className={`flex flex-col justify-center items-center w-full max-w-3xl m-auto min-h-[calc(100vh-4rem)] pt-16 ${className}`}
      role='main'
      aria-label={ariaLabel}>
      {children}
    </div>
  )
}
