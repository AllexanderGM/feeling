import { NavbarItem, Link as HeroLink, Button } from '@heroui/react'

const NavbarRegularPortion = () => {
  return (
    <>
      <NavbarItem className="lg:flex text-sm">
        <HeroLink className="text-sm md:text-base" href="/register">
          Crear Cuenta
        </HeroLink>
      </NavbarItem>

      <NavbarItem>
        <HeroLink className="text-sm md:text-base" href="/login">
          <Button color="primary" className="text-sm md:text-base">
            Iniciar sesión
          </Button>
        </HeroLink>
      </NavbarItem>
    </>
  )
}

export default NavbarRegularPortion
