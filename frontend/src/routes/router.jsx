import { createBrowserRouter } from 'react-router-dom'
// Layouts
import Layout from '@layouts/Layout.jsx'
import App from '@routes/App.jsx'
// Páginas públicas
import Welcome from '@pages/general/Welcome'
import NotFound from '@pages/general/NotFound'
import ApiStatus from '@pages/general/ApiStatus'
// Páginas de autenticación
import Login from '@pages/auth/Login'
import Register from '@pages/auth/Register'
import VerifyEmail from '@pages/auth/VerifyEmail'
import ForgotPassword from '@pages/auth/ForgotPassword'
import ResetPassword from '@pages/auth/ResetPassword'
// Páginas del flujo de registro
import CompleteProfile from '@pages/user/CompleteProfile.jsx'
// Páginas de la aplicación
import Home from '@pages/app/Home'

// Componentes de protección
import { RequireVerifiedUser, RequireCompleteProfile, RequireAdmin, RedirectIfAuthenticated } from './RequireAuth.jsx'
// Crear el router con todas las rutas
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <Layout />,
        children: [
          // ========================================
          // RUTAS PRINCIPALES DE LA APLICACIÓN
          // ========================================
          {
            index: true,
            element: (
              <RequireCompleteProfile>
                <Home />
              </RequireCompleteProfile>
            )
          },

          // ========================================
          // RUTAS PÚBLICAS
          // ========================================
          {
            path: 'welcome',
            element: (
              <RedirectIfAuthenticated redirectTo="/app">
                <Welcome />
              </RedirectIfAuthenticated>
            )
          },
          { path: 'api-status', element: <ApiStatus /> },

          // ========================================
          // RUTAS DE AUTENTICACIÓN
          // ========================================
          {
            path: 'login',
            element: (
              <RedirectIfAuthenticated redirectTo="/app">
                <Login />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: 'register',
            element: (
              <RedirectIfAuthenticated redirectTo="/app">
                <Register />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: 'verify-email',
            element: <VerifyEmail />
          },
          {
            path: 'verify-email/:token',
            element: <VerifyEmail />
          },
          {
            path: 'forgot-password',
            element: (
              <RedirectIfAuthenticated redirectTo="/app">
                <ForgotPassword />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: 'reset-password/:token',
            element: (
              <RedirectIfAuthenticated redirectTo="/app">
                <ResetPassword />
              </RedirectIfAuthenticated>
            )
          },

          // ========================================
          // RUTAS DEL FLUJO DE REGISTRO
          // ========================================
          {
            path: 'complete-profile',
            element: (
              <RequireVerifiedUser>
                <CompleteProfile />
              </RequireVerifiedUser>
            )
          },

          // ========================================
          // RUTAS DE MATCHING Y FUNCIONALIDADES PRINCIPALES
          // ========================================
          {
            path: 'matches',
            element: (
              <RequireCompleteProfile>
                <div>Página de Matches - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: 'search',
            element: (
              <RequireCompleteProfile>
                <div>Búsqueda de Usuarios - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: 'events',
            element: (
              <RequireCompleteProfile>
                <div>Eventos - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: 'profile',
            element: (
              <RequireCompleteProfile>
                <div>Mi Perfil - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: 'profile/:userId',
            element: (
              <RequireCompleteProfile>
                <div>Ver Perfil de Usuario - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: 'settings',
            element: (
              <RequireCompleteProfile>
                <div>Configuración - Por implementar</div>
              </RequireCompleteProfile>
            )
          },

          // ========================================
          // RUTAS ADMINISTRATIVAS
          // ========================================
          {
            path: 'admin',
            element: (
              <RequireAdmin>
                <div>Panel de Administración - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: 'admin/users',
            element: (
              <RequireAdmin>
                <div>Gestión de Usuarios - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: 'admin/events',
            element: (
              <RequireAdmin>
                <div>Gestión de Eventos - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: 'admin/statistics',
            element: (
              <RequireAdmin>
                <div>Estadísticas - Por implementar</div>
              </RequireAdmin>
            )
          },

          // ========================================
          // RUTAS DE PÁGINAS LEGALES
          // ========================================
          {
            path: 'terminos',
            element: <div>Términos y Condiciones - Por implementar</div>
          },
          {
            path: 'privacidad',
            element: <div>Política de Privacidad - Por implementar</div>
          },
          {
            path: 'soporte',
            element: <div>Centro de Soporte - Por implementar</div>
          },

          // ========================================
          // RUTA 404
          // ========================================
          {
            path: '*',
            element: <NotFound />
          }
        ]
      }
    ]
  }
])

export default router
