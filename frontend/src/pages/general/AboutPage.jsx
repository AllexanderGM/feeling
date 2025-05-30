import { Card, CardBody, CardHeader, Avatar, Button } from '@heroui/react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import Diego from '@assets/perfiles/Diego.jpeg'
import Alejandra from '@assets/perfiles/Alejandra.jpeg'
import Kevin from '@assets/perfiles/Kevin.jpeg'
import Adriana from '@assets/perfiles/Adriana.jpeg'
import Jeisson from '@assets/perfiles/Jeisson.jpeg'
import Yerlin from '@assets/perfiles/Yerlin.jpeg'
import Adrian from '@assets/perfiles/Adrian.jpeg'
import Andres from '@assets/perfiles/Andres.jpeg'

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Diego Contreras',
      role: 'Frontend Developer',
      description: 'Desarrollo de componentes y UI',
      github: 'https://github.com/ItsDiegoTBG',
      linkedin: 'https://www.linkedin.com/in/diego-contreras-8a9627230/',
      image: Diego
    },
    {
      name: 'Alejandra Díaz',
      role: 'Backend Developer',
      description: 'Desarrollo de APIs y lógica de negocio',
      github: 'https://github.com/aleja-osorio',
      linkedin: 'https://www.linkedin.com/in/alejandra-diaz-osorio-55949b71/',
      image: Alejandra
    },
    {
      name: 'Kevin Payé',
      role: 'Backend Developer',
      description: 'Desarrollo de APIs y lógica de negocio',
      github: 'https://github.com/arkezam',
      linkedin: 'https://www.linkedin.com/in/kevin-paye/',
      image: Kevin
    },
    {
      name: 'Adriana Cadavid',
      role: 'QA Tester',
      description: 'Testing y control de calidad',
      github: 'https://github.com/adrianalcadavid5',
      linkedin: 'https://www.linkedin.com/in/adriana-cadavid-9a9b8177/',
      image: Adriana
    },
    {
      name: 'Jeisson Gavilán',
      role: 'DevOps/Infraestructura',
      description: 'Gestión de infraestructura y despliegue',
      github: 'https://github.com/AllexanderGM',
      linkedin: 'https://www.linkedin.com/in/jeisson-alexander',
      image: Jeisson
    },
    {
      name: 'Yerlin Quintero',
      role: 'Database Administrator',
      description: 'Gestión y optimización de bases de datos',
      github: 'https://github.com/YeyeAndrew',
      linkedin: 'https://www.linkedin.com/in/yerlin-quintero/',
      image: Yerlin
    },
    {
      name: 'Adrián Encalada',
      role: 'QA Tester/Diseñador UI',
      description: 'Testing y diseño de interfaces de usuario',
      github: 'https://github.com/AdrianEncalada',
      linkedin: 'https://www.linkedin.com/in/adrián-encalada-ramírez-018a74193/',
      image: Adrian
    },
    {
      name: 'Andrés Ferrada',
      role: 'UI/UX y Frontend Developer',
      description: 'Diseño de interfaces y desarrollo frontend',
      github: 'https://github.com/and-fer',
      linkedin: 'https://www.linkedin.com/in/andres-ferrada/',
      image: Andres
    }
  ]

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 mb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sobre Glocal Tours</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Somos un equipo apasionado por el turismo y la tecnología, comprometidos con crear experiencias únicas para nuestros usuarios.
          Nuestra misión es conectar viajeros con destinos increíbles a través de una plataforma innovadora y fácil de usar.
        </p>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Nuestro Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-col items-center pb-0">
                <Avatar src={member.image} size="lg" isBordered color="primary" className="w-24 h-24" />
                <h3 className="text-xl font-semibold mt-4">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </CardHeader>
              <CardBody className="text-center flex flex-col h-[120px]">
                <p className="text-sm text-gray-600 mb-4 flex-1">{member.description}</p>
                <div className="flex justify-center gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    variant="light"
                    aria-label="GitHub"
                    as="a"
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2">
                    <FaGithub className="text-lg" />
                  </Button>
                  <Button
                    isIconOnly
                    color="primary"
                    variant="light"
                    aria-label="LinkedIn"
                    as="a"
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2">
                    <FaLinkedin className="text-lg" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AboutPage
