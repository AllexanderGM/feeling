export default function LiteContainer({ children, className = '', ariaLabel = 'Contenedor principal' }) {
  return (
    <div
      aria-label={ariaLabel}
      className={`flex flex-col justify-center items-center w-full max-w-3xl m-auto min-h-[calc(100vh-4rem)] pt-16 ${className}`}
      role='main'>
      {children}
    </div>
  )
}
