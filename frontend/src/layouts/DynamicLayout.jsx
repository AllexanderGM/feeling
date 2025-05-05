import { Outlet } from 'react-router-dom'
import BackgroundEffect from '@components/layout/BackgroundEffect'
import Navbar from '@components/layout/Navbar'
import Footer from '@components/layout/Footer'
import ScrollToTop from '@components/ScrollToTop'

const DynamicLayout = () => {
  return (
    <BackgroundEffect className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </BackgroundEffect>
  )
}

export default DynamicLayout
