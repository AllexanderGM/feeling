export default function LiteContainer({ children, className = '' }) {
  return <div className={`flex flex-col justify-content-center items-center w-full max-w-3xl m-auto ${className}`}>{children}</div>
}
