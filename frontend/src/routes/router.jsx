import { createBrowserRouter } from 'react-router-dom'
// Layouts
import Layout from '@layouts/Layout.jsx'
import App from '@routes/App.jsx'
// Páginas públicas
import Welcome from '@pages/general/Welcome'
import NotFound from '@pages/general/NotFound'
import ApiStatus from '@pages/general/ApiStatus'
import ContactPage from '@pages/general/ContactPage'
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
import Profile from '@pages/user/profile/Profile.jsx'
// Páginas de administración
import UsersManagement from '@pages/user/usersManagement/UsersManagement.jsx'
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
                <Profile />
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
          {
            path: APP_PATHS.USER.NOTIFICATIONS.slice(1),
            element: (
              <RequireCompleteProfile>
                <div className="max-w-4xl mx-auto p-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Notificaciones</h1>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <p className="text-blue-800">📱 Sistema de notificaciones por implementar</p>
                      <p className="text-blue-600 text-sm mt-2">Próximamente podrás ver todas tus notificaciones aquí:</p>
                      <ul className="text-blue-600 text-sm mt-3 space-y-1">
                        <li>• Nuevos matches</li>
                        <li>• Mensajes recibidos</li>
                        <li>• Actualizaciones del sistema</li>
                        <li>• Recordatorios de eventos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </RequireCompleteProfile>
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
          // RUTAS ADMINISTRATIVAS
          // ========================================
          {
            path: APP_PATHS.ADMIN.ROOT.slice(1),
            element: (
              <RequireAdmin>
                <div>Dashboard de Administración - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: APP_PATHS.ADMIN.USERS.slice(1),
            element: (
              <RequireAdmin>
                <UsersManagement />
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
            path: APP_PATHS.ADMIN.REQUESTS.slice(1),
            element: (
              <RequireAdmin>
                <div>Gestión de PQR (Peticiones, Quejas y Reclamos) - Por implementar</div>
              </RequireAdmin>
            )
          },
          {
            path: APP_PATHS.ADMIN.SETTINGS.slice(1),
            element: (
              <RequireAdmin>
                <div>Configuración de la Plataforma - Por implementar</div>
              </RequireAdmin>
            )
          },

          // ========================================
          // RUTAS GENERALES (Accesibles para usuarios autenticados)
          // ========================================
          {
            path: 'contact',
            element: (
              <RequireAuthOnly>
                <ContactPage />
              </RequireAuthOnly>
            )
          },
          {
            path: 'help',
            element: (
              <RequireAuthOnly>
                <div className="max-w-4xl mx-auto p-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Centro de Ayuda</h1>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <p className="text-green-800">❓ Centro de ayuda por implementar</p>
                      <p className="text-green-600 text-sm mt-2">Próximamente encontrarás aquí:</p>
                      <ul className="text-green-600 text-sm mt-3 space-y-1">
                        <li>• Preguntas frecuentes (FAQ)</li>
                        <li>• Tutoriales paso a paso</li>
                        <li>• Guías de uso de la plataforma</li>
                        <li>• Videos explicativos</li>
                        <li>• Contacto con soporte técnico</li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-green-300">
                        <p className="text-green-700 text-sm font-medium">Mientras tanto, puedes contactarnos directamente:</p>
                        <a
                          href="/contact"
                          className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Ir a Contacto
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </RequireAuthOnly>
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
