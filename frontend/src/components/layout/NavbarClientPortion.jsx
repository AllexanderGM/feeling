import { NavbarItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from '@heroui/react'
import { useAuth } from '@context/AuthContext.jsx'

import FavoritesCount from '../../pages/favorites/components/FavoritesCount.jsx'

const NavbarClientPortion = ({ avatar, name, lastName, email }) => {
  const { logout } = useAuth()
  console.log('name from navbar client portion:', name)

  return (
    <div className="flex gap-3 items-center">
      <NavbarItem>
        <FavoritesCount />
      </NavbarItem>

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
            <DropdownItem key="favorites" href="/favoritos">
              Mis tours favoritos
            </DropdownItem>
            <DropdownItem key="bookings" href="/mis-reservas">
              Mis reservas
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={logout}>
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarItem>
    </div>
  )
}

export default NavbarClientPortion
