import { Link } from '@heroui/react'

import { Facebook, GitHub, Instagram } from '../../utils/socialMediaIcons.jsx'
import Iso from '../../utils/Iso.jsx'

const url_facebook = 'https://www.facebook.com/p/Beautiful-places-in-the-world-100064591513384/'
const url_insta = 'https://www.instagram.com/lugares_del_mundo/'
const url_github = 'https://github.com/AllexanderGM/DH-G2-Final.git'

const Footer = () => {
  return (
    <footer className="w-full py-6 px-8 border-t flex flex-col md:flex-row md:justify-between md:items-center">
      <div className="flex items-center md:flex-grow justify-center md:justify-start">
        <Iso className="h-5 mb-1 md:mb-0" color="oklch(0.707 0.022 261.325)" hoverColor="#E86C6E" />
      </div>

      <div className="flex md:flex-grow justify-center">
        <span className="text-sm text-gray-500">© Feeling. {new Date().getFullYear()}</span>
      </div>

      <div className="flex flex-1 items-center justify-center md:justify-end space-x-4 mt-4 md:mt-0">
        <Link href={url_facebook} isExternal>
          <Facebook height="25" color="oklch(0.707 0.022 261.325)" />
        </Link>

        <Link href={url_insta} isExternal>
          <Instagram height="20" color="oklch(0.707 0.022 261.325)" />
        </Link>

        <Link href={url_github} isExternal>
          <GitHub height="28" color="oklch(0.707 0.022 261.325)" />
        </Link>
      </div>
    </footer>
  )
}

export default Footer
