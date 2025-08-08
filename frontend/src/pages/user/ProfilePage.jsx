import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Avatar, Divider, Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import { getUserByEmail } from '../../services/user/userService.js'
import { Logger } from '@utils/logger.js'

const ProfilePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.email) {
          const data = await getUserByEmail(user.email)
          Logger.debug('Datos del usuario recibidos', { data }, { category: Logger.CATEGORIES.USER })
          setUserData({
            ...data,
            name: data.name || user.name,
            lastName: data.lastName || user.lastName,
            email: data.email || user.email,
            role: data.role || user.role,
            image: data.image || user.avatar
          })
        }
      } catch (error) {
        Logger.error('Error al cargar datos del usuario:', error, { category: Logger.CATEGORIES.USER })
        setError('Error al cargar los datos del usuario')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-pulse'>Cargando perfil...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Card className='max-w-md w-full'>
          <CardBody>
            <div className='text-center'>
              <p className='text-xl text-red-600'>{error}</p>
              <p className='mt-2'>Por favor, intenta de nuevo más tarde</p>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Card className='max-w-md w-full'>
          <CardBody>
            <div className='text-center'>
              <p className='text-xl text-red-600'>No se ha encontrado información del usuario</p>
              <p className='mt-2'>Por favor, inicia sesión para ver tu perfil</p>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center w-full min-h-screen bg-gray-100 py-10 px-4'>
      <Card className='max-w-xl w-full p-5'>
        <CardHeader className='flex flex-col items-center pb-0'>
          <Avatar
            src={userData.image}
            size='lg'
            isBordered
            color={userData.role === 'admin' ? 'danger' : 'primary'}
            className='w-20 h-20 text-large'
          />
          <h1 className='text-2xl font-bold mt-4'>
            {userData.name} {userData.lastName}
          </h1>
          <p className='text-gray-500'>{userData.email}</p>
          <div className='mt-2'>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                userData.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
              {userData.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </CardHeader>

        <CardBody className='py-8'>
          <Divider className='my-4' />

          <div className='space-y-6'>
            <div>
              <h2 className='text-lg font-semibold mb-2'>Información Personal</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500'>ID de Usuario</p>
                  <p>{userData.id || user.id}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500'>Documento</p>
                  <p>{userData.document || 'No especificado'}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500'>Teléfono</p>
                  <p>{userData.phone || 'No especificado'}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500'>Fecha de Nacimiento</p>
                  <p>{userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'No especificada'}</p>
                </div>
              </div>
            </div>

            <div className='pt-4 flex justify-end gap-4'>
              <Button color='danger' variant='light' onPress={() => navigate('/')}>
                Volver
              </Button>
              <Button color='primary' className='bg-[#E86C6E]' onPress={() => navigate('/edit-profile')}>
                Editar Perfil
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ProfilePage
