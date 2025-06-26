import { Button } from '@heroui/react'

export default function LoadDataError({ children }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-400">{children}</p>
        <Button variant="bordered" onPress={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}
