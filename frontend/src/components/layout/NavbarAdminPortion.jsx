import { NavbarItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User, Link as HeroLink } from '@heroui/react'
import { useAuth } from '@context/AuthContext.jsx'
import { useCreateTour } from '@context/CreateTourContext.jsx'

const NavbarAdmin = ({ avatar, name, lastName, email }) => {
  const { logout } = useAuth()
  const { openCreateTourModal } = useCreateTour()

  return (
    <>
      <div className="hidden sm:flex gap-3 items-center">
        <NavbarItem>
          <HeroLink
            color="primary"
            className="hover:text-red-600 sm:text-sm md:text-base"
            href="#"
            onClick={e => {
              e.preventDefault()
              openCreateTourModal()
            }}>
            Crear tour
          </HeroLink>
        </NavbarItem>

        <NavbarItem>
          <HeroLink color="primary" className="hover:text-red-600 sm:text-sm md:text-base" href="/admin">
            Admin panel
          </HeroLink>
        </NavbarItem>
      </div>

      <div className="flex gap-3 items-center">
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <User
                avatarProps={{
                  src: avatar
                }}
                description={email}
                name={`${name} ${lastName}`}
              />
            </DropdownTrigger>

            <DropdownMenu aria-label="Profile Actions">
              <DropdownItem key="profile" href="/profile-user">
                Mi perfil
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={logout}>
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </div>
    </>
  )
}

export default NavbarAdmin
