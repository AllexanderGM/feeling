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
import CompleteProfile from '@pages/user/completeProfile/CompleteProfile.jsx'
import WelcomeOnboarding from '@pages/user/WelcomeOnboarding.jsx'
// Páginas de la aplicación
import Home from '@pages/home/Home.jsx'
// Constantes
import { APP_PATHS } from '@constants/paths.js'

// Componentes de protección
import {
  RequireAuthOnly,
  RequireVerifiedUser,
  RequireCompleteProfile,
  RequireAdmin,
  RedirectIfAuthenticated,
  RedirectIfProfileComplete
} from './RequireAuth.jsx'

// Crear el router con todas las rutas
const router = createBrowserRouter([
  {
    path: APP_PATHS.ROOT,
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
            path: APP_PATHS.PUBLIC.WELCOME.slice(1),
            element: (
              <RedirectIfAuthenticated redirectTo={APP_PATHS.ROOT}>
                <Welcome />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: APP_PATHS.PUBLIC.API_STATUS.slice(1),
            element: <ApiStatus />
          },

          // ========================================
          // RUTAS DE AUTENTICACIÓN
          // ========================================
          {
            path: APP_PATHS.AUTH.LOGIN.slice(1),
            element: (
              <RedirectIfAuthenticated redirectTo={APP_PATHS.ROOT}>
                <Login />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: APP_PATHS.AUTH.REGISTER.slice(1),
            element: (
              <RedirectIfAuthenticated redirectTo={APP_PATHS.AUTH.VERIFY_EMAIL}>
                <Register />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: APP_PATHS.AUTH.VERIFY_EMAIL.slice(1),
            element: (
              <RedirectIfAuthenticated redirectTo={APP_PATHS.ROOT}>
                <VerifyEmail />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: APP_PATHS.AUTH.VERIFY_EMAIL_TOKEN.slice(1),
            element: (
              <RequireAuthOnly>
                <VerifyEmail />
              </RequireAuthOnly>
            )
          },
          {
            path: APP_PATHS.AUTH.FORGOT_PASSWORD.slice(1),
            element: (
              <RedirectIfAuthenticated redirectTo={APP_PATHS.ROOT}>
                <ForgotPassword />
              </RedirectIfAuthenticated>
            )
          },
          {
            path: APP_PATHS.AUTH.RESET_PASSWORD.slice(1),
            element: (
              <RedirectIfAuthenticated redirectTo={APP_PATHS.ROOT}>
                <ResetPassword />
              </RedirectIfAuthenticated>
            )
          },

          // ========================================
          // RUTAS DEL FLUJO DE REGISTRO
          // ========================================
          {
            path: APP_PATHS.USER.COMPLETE_PROFILE.slice(1),
            element: (
              <RequireVerifiedUser>
                <RedirectIfProfileComplete>
                  <CompleteProfile />
                </RedirectIfProfileComplete>
              </RequireVerifiedUser>
            )
          },
          {
            path: APP_PATHS.USER.WELCOME_ONBOARDING.slice(1),
            element: (
              <RequireCompleteProfile>
                <WelcomeOnboarding />
              </RequireCompleteProfile>
            )
          },

          // ========================================
          // RUTAS DE MATCHING Y FUNCIONALIDADES PRINCIPALES
          // ========================================
          {
            path: APP_PATHS.USER.MATCHES.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Página de Matches - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: APP_PATHS.USER.SEARCH.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Búsqueda de Usuarios - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: APP_PATHS.USER.EVENTS.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Eventos - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: APP_PATHS.USER.PROFILE.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Mi Perfil - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: APP_PATHS.USER.PROFILE_BY_ID.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Ver Perfil de Usuario - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: APP_PATHS.USER.SETTINGS.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Configuración - Por implementar</div>
              </RequireCompleteProfile>
            )
          },
          {
            path: APP_PATHS.USER.FAVORITES.slice(1),
            element: (
              <RequireCompleteProfile>
                <div>Favoritos - Por implementar</div>
              </RequireCompleteProfile>
            )
          },

          // ========================================
          // RUTAS ADMINISTRATIVAS
          // ========================================
          {
            path: APP_PATHS.ADMIN.ROOT.slice(1),
            element: (
              <RequireAdmin>
                <div>Panel de Administración - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: APP_PATHS.ADMIN.USERS.slice(1),
            element: (
              <RequireAdmin>
                <div>Gestión de Usuarios - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: APP_PATHS.ADMIN.EVENTS.slice(1),
            element: (
              <RequireAdmin>
                <div>Gestión de Eventos - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: APP_PATHS.ADMIN.STATS.slice(1),
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
            path: APP_PATHS.LEGAL.TERMS.slice(1),
            element: <div>Términos y Condiciones - Por implementar</div>
          },
          {
            path: APP_PATHS.LEGAL.PRIVACY.slice(1),
            element: <div>Política de Privacidad - Por implementar</div>
          },
          {
            path: APP_PATHS.LEGAL.SUPPORT.slice(1),
            element: <div>Centro de Soporte - Por implementar</div>
          },

          // ========================================
          // RUTA 404
          // ========================================
          {
            path: APP_PATHS.NOT_FOUND,
            element: <NotFound />
          }
        ]
      }
    ]
  }
])

export default router
