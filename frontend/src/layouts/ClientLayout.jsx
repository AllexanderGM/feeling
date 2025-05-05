import { Outlet } from 'react-router-dom'
import Footer from '@components/layout/Footer'
import Navbar from '@components/layout/Navbar'
import ScrollToTop from '@components/ScrollToTop'

const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default ClientLayout
