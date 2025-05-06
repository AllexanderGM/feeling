import { createBrowserRouter } from 'react-router-dom'
// Layouts
import DynamicLayout from '@layouts/DynamicLayout.jsx'
// Páginas
import HomePage from '@pages/home/Home.jsx'
import DetalleTour from '@pages/tourDetail/DetalleTour.jsx'
import NotFoundPage from '@pages/notFound/NotFoundPage.jsx'
import RegistrarUsuario from '@pages/register/RegistrarUsuario.jsx'
import AdminPage from '@pages/admin/AdminPage.jsx'
import ProfilePage from '@pages/user/ProfilePage.jsx'
import EditUserProfile from '@pages/userEdit/EditUserProfile.jsx'
import BookingHistoryPage from '@pages/bookingHistory/BookingHistoryPage.jsx'
import Users from '@components/Users.jsx'
import ConfirmReserv from '@pages/confirmReservation/ConfirmReserv.jsx'
import CategoryPage from '@pages/category/CategoryPage.jsx'
import AboutPage from '@pages/about/AboutPage.jsx'
import ToursPage from '@pages/tours/ToursPage.jsx'
import ContactPage from '@pages/contact/ContactPage.jsx'
/* Aplicación matches */
// Layout
import AppLayout from '@layouts/AppLayout.jsx'
// Páginas
import App from '@pages/app/App.jsx'
import Login from '@pages/app/auth/Login.jsx'
import Register from '@pages/app/auth/Register.jsx'
/* import Dashboard from '@pages/app/Dashboard.jsx'
import MatchesPage from '@pages/app/MatchesPage.jsx'
import EventsPage from '@pages/app/EventsPage.jsx'
import AppLoginPage from '@pages/app/AppLoginPage.jsx'

import UserSearchPage from '@pages/app/UserSearchPage.jsx'
import UserProfileView from '@pages/app/UserProfileView.jsx' */

import RootApp from './RootApp.jsx'
import RequireAuth from './RequireAuth.jsx'

// Crear el router con todas las rutas
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootApp />,
    errorElement: <NotFoundPage />,
    children: [
      // Rutas públicas con DynamicLayout
      {
        path: '',
        element: <DynamicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'tour/:id', element: <DetalleTour /> },
          { path: 'login', element: <Login /> },
          { path: 'register', element: <RegistrarUsuario /> },
          { path: 'users', element: <Users /> },
          { path: 'about', element: <AboutPage /> },
          { path: 'tours', element: <ToursPage /> },
          { path: 'contacto', element: <ContactPage /> },
          {
            path: 'tour/:id/confirm',
            element: (
              <RequireAuth>
                <ConfirmReserv />
              </RequireAuth>
            )
          },
          { path: 'categoria/:categoryName', element: <CategoryPage /> },
          {
            path: 'profile-user',
            element: (
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            )
          },
          {
            path: 'edit-profile',
            element: (
              <RequireAuth>
                <EditUserProfile />
              </RequireAuth>
            )
          },
          {
            path: 'mis-reservas',
            element: (
              <RequireAuth>
                <BookingHistoryPage />
              </RequireAuth>
            )
          },
          // Rutas protegidas para administradores
          {
            path: 'admin',
            element: (
              <RequireAuth requiredRole="admin">
                <AdminPage />
              </RequireAuth>
            )
          },
          {
            path: 'profile-admin',
            element: (
              <RequireAuth requiredRole="admin">
                <ProfilePage />
              </RequireAuth>
            )
          }
        ]
      },

      // Rutas para la aplicación de matches (fuera del DynamicLayout)
      {
        path: 'app',
        element: <AppLayout />,
        children: [
          // Páginas públicas dentro de app
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },

          // Páginas protegidas dentro de app
          {
            index: true,
            element: (
              <RequireAuth>
                <App />
              </RequireAuth>
            )
          }
          /* {
            path: 'matches',
            element: (
              <RequireAuth>
                <MatchesPage />
              </RequireAuth>
            )
          },
          {
            path: 'events',
            element: (
              <RequireAuth>
                <EventsPage />
              </RequireAuth>
            )
          },
          {
            path: 'search',
            element: (
              <RequireAuth>
                <UserSearchPage />
              </RequireAuth>
            )
          },
          {
            path: 'profile/:userId',
            element: (
              <RequireAuth>
                <UserProfileView />
              </RequireAuth>
            )
          } */
        ]
      }
    ]
  }
])

export default router
