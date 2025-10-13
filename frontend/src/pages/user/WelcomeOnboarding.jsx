import { useState, useEffect } from 'react'
import { Button, Avatar, AvatarGroup } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import LiteContainer from '@components/layout/LiteContainer'
import BackgroundEffect from '@components/layout/BackgroundEffect'
import logo from '@assets/logo/logo-grey-dark.svg'
import profile1 from '@assets/profiles/profile1.jpg'
import profile2 from '@assets/profiles/profile2.jpg'
import profile3 from '@assets/profiles/profile3.jpg'
import profile4 from '@assets/profiles/profile4.jpg'
import { APP_PATHS } from '@constants/paths.js'

const WelcomeOnboarding = () => {
  const [animateIn, setAnimateIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100)

    return () => clearTimeout(timer)
  }, [])

  const avatarUsers = [
    {
      src: profile1,
      name: 'María'
    },
    {
      src: profile2,
      name: 'Carlos'
    },
    {
      src: profile3,
      name: 'Ana'
    },
    {
      src: profile4,
      name: 'Ana'
    }
  ]

  return (
    <BackgroundEffect>
      <LiteContainer
        className={`flex flex-col items-center justify-center text-center px-6 py-8 mx-auto max-w-lg h-screen transition-all duration-700 ease-out transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className='mb-16'>
          <figure className='text-center mb-8'>
            <img alt='Logo Feeling' className='w-48 md:w-56 lg:w-64 mx-auto' src={logo} />
          </figure>
        </div>

        <div className='mb-12'>
          <h1 className='text-2xl md:text-3xl font-bold text-white mb-6 leading-tight'>
            ¡Comienza a<br />
            conocer
            <br />
            personas!
          </h1>
        </div>

        <div className='mb-16 flex justify-center'>
          <AvatarGroup isBordered className='flex justify-center' max={4} total={10}>
            {avatarUsers.map((user, index) => (
              <Avatar key={index} className='ring-4 ring-white/20' name={user.name} size='lg' src={user.src} />
            ))}
          </AvatarGroup>
        </div>

        <div className='w-full max-w-sm'>
          <Button
            className='w-full font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg'
            color='primary'
            radius='full'
            size='lg'
            onPress={() => {
              navigate(APP_PATHS.ROOT)
            }}>
            Continuar
          </Button>
        </div>
      </LiteContainer>
    </BackgroundEffect>
  )
}

export default WelcomeOnboarding
