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
      <div className="text-center mb-8">
        <img src={logo} alt="Logo Feeling" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Crea tu perfil</h1>
      </div>

      <div className="space-y-8 lg:space-y-6">
        {/* Foto de perfil */}
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <Avatar src={profileImage} className="w-32 h-32" showFallback name="?" />
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-image" />
            <Button as="label" htmlFor="profile-image" color="default" variant="bordered" className="cursor-pointer">
              Cargar foto de perfil
            </Button>
          </div>
        </div>

        {/* Campo básico */}
        <div className="lg:max-w-md mx-auto">
          <Input label="Nombre" placeholder="Tu nombre" variant="bordered" className="text-white" />
        </div>

        <div className="lg:max-w-md mx-auto">
          <DatePicker label="Fecha de nacimiento" variant="bordered" className="text-white" />
        </div>

        {/* Género */}
        <div className="lg:max-w-md mx-auto">
          <p className="text-white text-lg mb-4">¿Con qué género te identificas?</p>
          <RadioGroup orientation="horizontal" className="text-white">
            <Radio value="hombre" className="text-white">
              Hombre
            </Radio>
            <Radio value="mujer" className="text-white">
              Mujer
            </Radio>
            <Radio value="gay" className="text-white">
              Gay
            </Radio>
          </RadioGroup>
        </div>

        {/* Categorías */}
        <div className="lg:max-w-2xl mx-auto">
          <div className="flex gap-4 justify-center">
            {categoryButtons.map(category => (
              <Button
                key={category.id}
                className={`${category.className} transition-all duration-300 hover:scale-105 ${selectedCategory === category.id ? 'ring-2 ring-white/50' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                size="lg">
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Más sobre ti */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Más sobre ti</h2>

          {/* Estatura */}
          <div className="mb-6">
            <p className="text-white mb-4">Estatura: {height} cm</p>
            <Slider
              size="lg"
              step={1}
              color="primary"
              showSteps={false}
              showTooltip={true}
              showOutline={true}
              minValue={140}
              maxValue={220}
              value={height}
              onChange={setHeight}
              className="max-w-md"
            />
          </div>

          {/* Dropdowns de información personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select label="Color de ojos" variant="bordered" className="text-white">
              {eyeColors.map(color => (
                <SelectItem key={color.key} value={color.key}>
                  {color.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Color de cabello" variant="bordered" className="text-white">
              {hairColors.map(color => (
                <SelectItem key={color.key} value={color.key}>
                  {color.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Tono de piel" variant="bordered" className="text-white">
              {skinTones.map(tone => (
                <SelectItem key={tone.key} value={tone.key}>
                  {tone.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Nivel de estudios" variant="bordered" className="text-white">
              {educationLevels.map(level => (
                <SelectItem key={level.key} value={level.key}>
                  {level.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Profesión" variant="bordered" className="text-white">
              {professions.map(prof => (
                <SelectItem key={prof.key} value={prof.key}>
                  {prof.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Religión" variant="bordered" className="text-white">
              {religions.map(religion => (
                <SelectItem key={religion.key} value={religion.key}>
                  {religion.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Deportes" variant="bordered" className="text-white">
              {sports.map(sport => (
                <SelectItem key={sport.key} value={sport.key}>
                  {sport.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Consumo de alcohol" variant="bordered" className="text-white">
              {alcoholConsumption.map(level => (
                <SelectItem key={level.key} value={level.key}>
                  {level.label}
                </SelectItem>
              ))}
            </Select>

            <Select label="Consumo de tabaco" variant="bordered" className="text-white">
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
          <h3 className="text-xl font-semibold text-white mb-4">Fotos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {profilePhotos.map((photo, index) => (
              <div key={index} className="relative">
                <Card className="bg-white/10 border border-white/20">
                  <CardBody className="p-0">
                    {photo ? (
                      <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-white/60">
                        <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
                <input type="file" accept="image/*" onChange={e => handlePhotoUpload(index, e)} className="hidden" id={`photo-${index}`} />
                <Button
                  as="label"
                  htmlFor={`photo-${index}`}
                  size="sm"
                  variant="flat"
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 cursor-pointer">
                  {photo ? 'Cambiar' : 'Agregar'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Acerca de ti */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Acerca de ti</h3>
          <Textarea placeholder="Cuéntanos algo sobre ti..." variant="bordered" minRows={4} className="text-white" />
        </div>

        {/* Gustos e intereses */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Gustos e intereses</h3>
          <div className="flex gap-2 mb-4 lg:max-w-2xl mx-auto">
            <Input
              placeholder="Agregar interés"
              value={newInterest}
              onChange={e => setNewInterest(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addInterest()}
              variant="bordered"
              className="flex-1"
            />
            <Button color="default" onClick={addInterest}>
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-2xl mx-auto">
            {interests.map((interest, index) => (
              <Chip key={index} onClose={() => removeInterest(interest)} variant="flat" color="default">
                {interest}
              </Chip>
            ))}
          </div>
        </div>

        {/* Botón de submit */}
        <div className="text-center pt-6">
          <Button color="default" size="lg" className="w-full max-w-md transition-all duration-300 hover:scale-105">
            Crear perfil
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileCreation
