import { useState, useEffect } from 'react'
import { Form, Input, Button, DatePicker } from '@heroui/react'
import useAuth from '@hooks/useAuth'
import { updateProfile } from '@services/userService'

const CompleteProfile = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    lastName: '',
    document: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    image: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      setSuccess(true)
    } catch (err) {
      setError(`Error al actualizar perfil: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl mb-6">Completa tu perfil</h1>

      {success && <div className="bg-green-100 text-green-800 p-4 mb-6 rounded">¡Perfil actualizado correctamente!</div>}

      {error && <div className="bg-red-100 text-red-800 p-4 mb-6 rounded">{error}</div>}

      <Form onSubmit={handleSubmit}>
        {/* Los campos del formulario para los datos adicionales */}
        <Input
          label="Apellido"
          value={formData.lastName}
          onChange={e => setFormData({ ...formData, lastName: e.target.value })}
          className="mb-4"
        />

        {/* Agregar el resto de campos... */}

        <Button type="submit" isLoading={loading} disabled={loading} className="mt-4">
          Guardar información
        </Button>
      </Form>
    </div>
  )
}

export default CompleteProfile
