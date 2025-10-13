import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Select,
  SelectItem,
  DatePicker,
  RadioGroup,
  Radio,
  Slider,
  Textarea,
  Chip,
  Avatar,
  Card,
  CardBody
} from '@heroui/react'
import logo from '@assets/logo/logo-grey-dark.svg'

const ProfileCreation = () => {
  const [animateIn, setAnimateIn] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [height, setHeight] = useState(170)
  const [selectedCategory, setSelectedCategory] = useState('hetero')
  const [interests, setInterests] = useState([])
  const [newInterest, setNewInterest] = useState('')
  const [profilePhotos, setProfilePhotos] = useState([null, null, null, null])

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100)

    return () => clearTimeout(timer)
  }, [])

  const handleImageUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = e => setProfileImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = (index, event) => {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = e => {
        const newPhotos = [...profilePhotos]

        newPhotos[index] = e.target.result
        setProfilePhotos(newPhotos)
      }
      reader.readAsDataURL(file)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest('')
    }
  }

  const removeInterest = interestToRemove => {
    setInterests(interests.filter(interest => interest !== interestToRemove))
  }

  const categoryButtons = [
    {
      id: 'hetero',
      label: 'Hetero',
      className: 'bg-[#18181B] text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'
    },
    {
      id: 'spirit',
      label: 'Spirit',
      className: 'bg-[#18181B] text-[#fcb87a] shadow-[0_0_20px_rgba(252,184,122,0.3)] hover:shadow-[0_0_30px_rgba(252,184,122,0.5)]'
    },
    {
      id: 'rouse',
      label: 'Rouse',
      className: 'bg-[#18181B] text-gray-300 shadow-[0_0_20px_rgba(156,163,175,0.3)] hover:shadow-[0_0_30px_rgba(156,163,175,0.5)]'
    }
  ]

  const eyeColors = [
    { key: 'marron', label: 'Marrón' },
    { key: 'azul', label: 'Azul' },
    { key: 'verde', label: 'Verde' },
    { key: 'miel', label: 'Miel' },
    { key: 'gris', label: 'Gris' },
    { key: 'negro', label: 'Negro' }
  ]

  const hairColors = [
    { key: 'negro', label: 'Negro' },
    { key: 'marron', label: 'Marrón' },
    { key: 'rubio', label: 'Rubio' },
    { key: 'rojo', label: 'Rojo' },
    { key: 'gris', label: 'Gris' },
    { key: 'otro', label: 'Otro' }
  ]

  const skinTones = [
    { key: 'claro', label: 'Claro' },
    { key: 'medio', label: 'Medio' },
    { key: 'moreno', label: 'Moreno' },
    { key: 'oscuro', label: 'Oscuro' }
  ]

  const educationLevels = [
    { key: 'secundaria', label: 'Secundaria' },
    { key: 'tecnico', label: 'Técnico' },
    { key: 'universitario', label: 'Universitario' },
    { key: 'posgrado', label: 'Posgrado' },
    { key: 'otro', label: 'Otro' }
  ]

  const professions = [
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'profesional', label: 'Profesional' },
    { key: 'empresario', label: 'Empresario' },
    { key: 'freelancer', label: 'Freelancer' },
    { key: 'otro', label: 'Otro' }
  ]

  const religions = [
    { key: 'catolica', label: 'Católica' },
    { key: 'cristiana', label: 'Cristiana' },
    { key: 'judaica', label: 'Judía' },
    { key: 'islamica', label: 'Islámica' },
    { key: 'budista', label: 'Budista' },
    { key: 'agnostico', label: 'Agnóstico' },
    { key: 'ateo', label: 'Ateo' },
    { key: 'otro', label: 'Otro' }
  ]

  const sports = [
    { key: 'futbol', label: 'Fútbol' },
    { key: 'basketball', label: 'Basketball' },
    { key: 'tennis', label: 'Tenis' },
    { key: 'natacion', label: 'Natación' },
    { key: 'gym', label: 'Gimnasio' },
    { key: 'running', label: 'Running' },
    { key: 'ciclismo', label: 'Ciclismo' },
    { key: 'ninguno', label: 'Ninguno' }
  ]

  const alcoholConsumption = [
    { key: 'nunca', label: 'Nunca' },
    { key: 'ocasional', label: 'Ocasionalmente' },
    { key: 'social', label: 'Social' },
    { key: 'regular', label: 'Regular' }
  ]

  const tobaccoConsumption = [
    { key: 'nunca', label: 'Nunca' },
    { key: 'ocasional', label: 'Ocasionalmente' },
    { key: 'social', label: 'Social' },
    { key: 'regular', label: 'Regular' }
  ]

  return (
    <div
      className={`w-full max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 py-8 transition-all duration-700 ease-out transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {/* Logo */}
      <div className='text-center mb-8'>
        <img alt='Logo Feeling' className='w-24 h-24 mx-auto mb-4' src={logo} />
        <h1 className='text-3xl font-bold text-white mb-2'>Crea tu perfil</h1>
      </div>

      <div className='space-y-8 lg:space-y-6'>
        {/* Foto de perfil */}
        <div className='text-center'>
          <div className='relative inline-block mb-4'>
            <Avatar showFallback className='w-32 h-32' name='?' src={profileImage} />
          </div>
          <div>
            <input accept='image/*' className='hidden' id='profile-image' type='file' onChange={handleImageUpload} />
            <Button as='label' className='cursor-pointer' color='default' htmlFor='profile-image' variant='bordered'>
              Cargar foto de perfil
            </Button>
          </div>
        </div>

        {/* Campo básico */}
        <div className='lg:max-w-md mx-auto'>
          <Input className='text-white' label='Nombre' placeholder='Tu nombre' variant='bordered' />
        </div>

        <div className='lg:max-w-md mx-auto'>
          <DatePicker className='text-white' label='Fecha de nacimiento' variant='bordered' />
        </div>

        {/* Género */}
        <div className='lg:max-w-md mx-auto'>
          <p className='text-white text-lg mb-4'>¿Con qué género te identificas?</p>
          <RadioGroup className='text-white' orientation='horizontal'>
            <Radio className='text-white' value='hombre'>
              Hombre
            </Radio>
            <Radio className='text-white' value='mujer'>
              Mujer
            </Radio>
            <Radio className='text-white' value='gay'>
              Gay
            </Radio>
          </RadioGroup>
        </div>

        {/* Categorías */}
        <div className='lg:max-w-2xl mx-auto'>
          <div className='flex gap-4 justify-center'>
            {categoryButtons.map(category => (
              <Button
                key={category.id}
                className={`${category.className} transition-all duration-300 hover:scale-105 ${selectedCategory === category.id ? 'ring-2 ring-white/50' : ''}`}
                size='lg'
                onClick={() => setSelectedCategory(category.id)}>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Más sobre ti */}
        <div>
          <h2 className='text-2xl font-semibold text-white mb-6'>Más sobre ti</h2>

          {/* Estatura */}
          <div className='mb-6'>
            <p className='text-white mb-4'>Estatura: {height} cm</p>
            <Slider
              className='max-w-md'
              color='primary'
              maxValue={220}
              minValue={140}
              showOutline={true}
              showSteps={false}
              showTooltip={true}
              size='lg'
              step={1}
              value={height}
              onChange={setHeight}
            />
          </div>

          {/* Dropdowns de información personal */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Select className='text-white' label='Color de ojos' variant='bordered'>
              {eyeColors.map(color => (
                <SelectItem key={color.key} value={color.key}>
                  {color.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Color de cabello' variant='bordered'>
              {hairColors.map(color => (
                <SelectItem key={color.key} value={color.key}>
                  {color.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Tono de piel' variant='bordered'>
              {skinTones.map(tone => (
                <SelectItem key={tone.key} value={tone.key}>
                  {tone.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Nivel de estudios' variant='bordered'>
              {educationLevels.map(level => (
                <SelectItem key={level.key} value={level.key}>
                  {level.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Profesión' variant='bordered'>
              {professions.map(prof => (
                <SelectItem key={prof.key} value={prof.key}>
                  {prof.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Religión' variant='bordered'>
              {religions.map(religion => (
                <SelectItem key={religion.key} value={religion.key}>
                  {religion.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Deportes' variant='bordered'>
              {sports.map(sport => (
                <SelectItem key={sport.key} value={sport.key}>
                  {sport.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Consumo de alcohol' variant='bordered'>
              {alcoholConsumption.map(level => (
                <SelectItem key={level.key} value={level.key}>
                  {level.label}
                </SelectItem>
              ))}
            </Select>

            <Select className='text-white' label='Consumo de tabaco' variant='bordered'>
              {tobaccoConsumption.map(level => (
                <SelectItem key={level.key} value={level.key}>
                  {level.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Fotos */}
        <div>
          <h3 className='text-xl font-semibold text-white mb-4'>Fotos</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-2xl mx-auto'>
            {profilePhotos.map((photo, index) => (
              <div key={index} className='relative'>
                <Card className='bg-white/10 border border-white/20'>
                  <CardBody className='p-0'>
                    {photo ? (
                      <img alt={`Foto ${index + 1}`} className='w-full h-32 object-cover rounded-lg' src={photo} />
                    ) : (
                      <div className='w-full h-32 flex items-center justify-center text-white/60'>
                        <span className='material-symbols-outlined text-3xl'>add_photo_alternate</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
                <input accept='image/*' className='hidden' id={`photo-${index}`} type='file' onChange={e => handlePhotoUpload(index, e)} />
                <Button
                  as='label'
                  className='absolute -bottom-2 left-1/2 transform -translate-x-1/2 cursor-pointer'
                  htmlFor={`photo-${index}`}
                  size='sm'
                  variant='flat'>
                  {photo ? 'Cambiar' : 'Agregar'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Acerca de ti */}
        <div>
          <h3 className='text-xl font-semibold text-white mb-4'>Acerca de ti</h3>
          <Textarea className='text-white' minRows={4} placeholder='Cuéntanos algo sobre ti...' variant='bordered' />
        </div>

        {/* Gustos e intereses */}
        <div>
          <h3 className='text-xl font-semibold text-white mb-4'>Gustos e intereses</h3>
          <div className='flex gap-2 mb-4 lg:max-w-2xl mx-auto'>
            <Input
              className='flex-1'
              placeholder='Agregar interés'
              value={newInterest}
              variant='bordered'
              onChange={e => setNewInterest(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addInterest()}
            />
            <Button color='default' onClick={addInterest}>
              Agregar
            </Button>
          </div>
          <div className='flex flex-wrap gap-2 lg:max-w-2xl mx-auto'>
            {interests.map((interest, index) => (
              <Chip key={index} color='default' variant='flat' onClose={() => removeInterest(interest)}>
                {interest}
              </Chip>
            ))}
          </div>
        </div>

        {/* Botón de submit */}
        <div className='text-center pt-6'>
          <Button className='w-full max-w-md transition-all duration-300 hover:scale-105' color='default' size='lg'>
            Crear perfil
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileCreation
