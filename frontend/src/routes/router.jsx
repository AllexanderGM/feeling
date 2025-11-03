import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@layouts/Layout.jsx'
import PremiumLayout from '@layouts/PremiumLayout.jsx'
import App from '@routes/App.jsx'
import LoadData from '@components/layout/LoadData'
import { APP_PATHS } from '@constants/paths.js'

import {
  RequireAuthOnly,
  RequireCompleteProfile,
  RequireAdmin,
  RedirectIfAuthenticated,
  RedirectIfProfileComplete
} from './RequireAuth.jsx'

const Welcome = lazy(() => import('@pages/general/Welcome'))
const NotFound = lazy(() => import('@pages/general/NotFound'))
const ApiStatus = lazy(() => import('@pages/general/ApiStatus'))
const ContactPage = lazy(() => import('@pages/general/ContactPage'))

const Login = lazy(() => import('@pages/auth/Login'))
const Register = lazy(() => import('@pages/auth/Register'))
const VerifyEmail = lazy(() => import('@pages/auth/VerifyEmail'))
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'))

const Complete = lazy(() => import('@pages/user/complete/Complete.jsx'))
const WelcomeOnboarding = lazy(() => import('@pages/user/WelcomeOnboarding.jsx'))

const Home = lazy(() => import('@pages/home/Home.jsx'))
const Profile = lazy(() => import('@pages/user/me/Me.jsx'))
const Settings = lazy(() => import('@pages/user/settings/Settings.jsx'))
const Help = lazy(() => import('@pages/support/Help.jsx'))
const Favorites = lazy(() => import('@pages/user/favorites/Favorites.jsx'))
const Search = lazy(() => import('@pages/user/search/Search.jsx'))
const UserDetail = lazy(() => import('@pages/user/detail/Detail.jsx'))
const Notifications = lazy(() => import('@pages/user/notifications/Notifications.jsx'))

const EventsPage = lazy(() => import('@pages/event/Event.jsx'))
const EventDetail = lazy(() => import('@pages/event/detail/EventDetail.jsx'))
const EventCheckout = lazy(() => import('@pages/event/payment/EventCheckout.jsx'))
const EventPayment = lazy(() => import('@pages/event/payment/EventPayment.jsx'))
const EventPaymentSuccess = lazy(() => import('@pages/event/payment/EventPaymentSuccess.jsx'))
const EventPaymentError = lazy(() => import('@pages/event/payment/EventPaymentError.jsx'))
const EventPaymentStatus = lazy(() => import('@pages/event/payment/EventPaymentStatus.jsx'))

const PurchasePlans = lazy(() => import('@pages/matches/purchase/PurchasePlans.jsx'))
const Checkout = lazy(() => import('@pages/matches/purchase/Checkout.jsx'))
const Payment = lazy(() => import('@pages/matches/purchase/Payment.jsx'))
const MatchPaymentStatus = lazy(() => import('@pages/matches/purchase/PaymentStatus.jsx'))
const PaymentSuccess = lazy(() => import('@pages/matches/purchase/PaymentSuccess.jsx'))
const PaymentError = lazy(() => import('@pages/matches/purchase/PaymentError.jsx'))

const MyMatches = lazy(() => import('@pages/matches/myMatches/MyMatches.jsx'))

const AdminDashboard = lazy(() => import('@pages/admin/dashboard/AdminDashboard.jsx'))
const UsersManagement = lazy(() => import('@pages/user/management/Management.jsx'))
const PlansManagement = lazy(() => import('@pages/matches/admin/PlansManagement.jsx'))
const ComplaintManagement = lazy(() => import('@pages/support/admin/ComplaintManagement.jsx'))
const SimplifiedComplaintManagement = lazy(() => import('@pages/support/admin/SimplifiedComplaintManagement.jsx'))
const UserComplaints = lazy(() => import('@pages/support/user/UserComplaints.jsx'))
const EventManagement = lazy(() => import('@pages/event/admin/EventManagement.jsx'))
const ConfigurationManagement = lazy(() => import('@pages/admin/configuration/ConfigurationManagement.jsx'))

const GenericTableExample = lazy(() => import('@pages/examples/GenericTableExample.jsx'))
const UserTableTest = lazy(() => import('@pages/examples/UserTableTest.jsx'))

const RouteSuspense = ({ children }) => {
  return <Suspense fallback={<LoadData>Cargando vista...</LoadData>}>{children}</Suspense>
}

const guard = (component, props = {}) => ({ component, props })

const wrapWithGuards = (element, guards = []) => {
  return guards.reduceRight((acc, { component: GuardComponent, props }) => {
    return <GuardComponent {...props}>{acc}</GuardComponent>
  }, element)
}

const createRouteElement = ({ component: Component, element, guards = [], suspense = true }) => {
  const baseElement = element ?? (Component ? <Component /> : null)
  const guardedElement = guards.length > 0 ? wrapWithGuards(baseElement, guards) : baseElement

  return suspense ? <RouteSuspense>{guardedElement}</RouteSuspense> : guardedElement
}

const normalizePath = path => {
  if (typeof path !== 'string' || path === '' || path === APP_PATHS.NOT_FOUND) return path

  return path.startsWith('/') ? path.slice(1) : path
}

const createRoute = ({ path, index = false, ...elementOptions }) => {
  const route = {
    element: createRouteElement(elementOptions)
  }

  if (index) {
    route.index = true
  } else {
    route.path = normalizePath(path)
  }

  return route
}

const ComingSoon = ({ title, message, features = [] }) => {
  return (
    <section className='max-w-3xl mx-auto p-6 space-y-4 text-center'>
      <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
      <p className='text-gray-600'>{message}</p>
      {features.length > 0 && (
        <ul className='list-disc list-inside text-sm text-gray-600 space-y-1'>
          {features.map(feature => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

const mainRoutes = [
  createRoute({ index: true, component: Home, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.MATCHES, component: MyMatches, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.SEARCH, component: Search, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.EVENTS, component: EventsPage }),
  createRoute({ path: APP_PATHS.USER.EVENT_DETAIL, component: EventDetail }),
  createRoute({ path: APP_PATHS.USER.EVENT_CHECKOUT, component: EventCheckout }),
  createRoute({ path: APP_PATHS.USER.EVENT_PAYMENT, component: EventPayment }),
  createRoute({ path: APP_PATHS.USER.EVENT_PAYMENT_SUCCESS, component: EventPaymentSuccess }),
  createRoute({ path: APP_PATHS.USER.EVENT_PAYMENT_ERROR, component: EventPaymentError }),
  createRoute({ path: APP_PATHS.USER.EVENT_PAYMENT_STATUS, component: EventPaymentStatus }),
  createRoute({ path: APP_PATHS.USER.PROFILE, component: Profile, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.PROFILE_BY_ID, component: UserDetail, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.SETTINGS, component: Settings, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.FAVORITES, component: Favorites, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.NOTIFICATIONS, component: Notifications, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.SUPPORT, component: UserComplaints, guards: [guard(RequireCompleteProfile)] })
]

const adminRoutes = [
  createRoute({ path: APP_PATHS.ADMIN.ROOT, component: AdminDashboard, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.USERS, component: UsersManagement, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.EVENTS, component: EventManagement, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.MATCH_PLANS, component: PlansManagement, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.REQUESTS, component: ComplaintManagement, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.SETTINGS, component: ConfigurationManagement, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.PROFILE, component: Profile, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.HELP, component: SimplifiedComplaintManagement, guards: [guard(RequireAdmin)] }),
  createRoute({ path: APP_PATHS.ADMIN.SETTINGS_PROFILE, component: Settings, guards: [guard(RequireAdmin)] })
]

const exampleRoutes = [
  createRoute({ path: 'examples/generic-table', component: GenericTableExample }),
  createRoute({ path: 'examples/user-table-test', component: UserTableTest })
]

const generalRoutes = [
  createRoute({ path: APP_PATHS.GENERAL.CONTACT, component: ContactPage, guards: [guard(RequireAuthOnly)] }),
  createRoute({ path: APP_PATHS.GENERAL.HELP, component: Help, guards: [guard(RequireAuthOnly)] })
]

const publicRoutes = [
  createRoute({
    path: APP_PATHS.PUBLIC.WELCOME,
    component: Welcome,
    guards: [guard(RedirectIfAuthenticated, { redirectTo: APP_PATHS.ROOT })]
  }),
  createRoute({ path: APP_PATHS.PUBLIC.API_STATUS, component: ApiStatus })
]

const authRoutes = [
  createRoute({
    path: APP_PATHS.AUTH.LOGIN,
    component: Login,
    guards: [guard(RedirectIfAuthenticated, { redirectTo: APP_PATHS.ROOT })]
  }),
  createRoute({
    path: APP_PATHS.AUTH.REGISTER,
    component: Register,
    guards: [guard(RedirectIfAuthenticated, { redirectTo: APP_PATHS.AUTH.VERIFY_EMAIL })]
  }),
  createRoute({
    path: APP_PATHS.AUTH.VERIFY_EMAIL,
    component: VerifyEmail,
    guards: [guard(RedirectIfAuthenticated, { redirectTo: APP_PATHS.ROOT })]
  }),
  createRoute({ path: APP_PATHS.AUTH.VERIFY_EMAIL_TOKEN, component: VerifyEmail, guards: [guard(RequireAuthOnly)] }),
  createRoute({
    path: APP_PATHS.AUTH.FORGOT_PASSWORD,
    component: ForgotPassword,
    guards: [guard(RedirectIfAuthenticated, { redirectTo: APP_PATHS.ROOT })]
  }),
  createRoute({
    path: APP_PATHS.AUTH.RESET_PASSWORD,
    component: ResetPassword,
    guards: [guard(RedirectIfAuthenticated, { redirectTo: APP_PATHS.ROOT })]
  })
]

const registrationRoutes = [
  createRoute({
    path: APP_PATHS.USER.COMPLETE_PROFILE,
    component: Complete,
    guards: [guard(RequireAuthOnly), guard(RedirectIfProfileComplete)]
  })
]

const legalRoutes = [
  createRoute({
    path: APP_PATHS.LEGAL.TERMS,
    element: <ComingSoon message='Esta sección estará disponible pronto.' title='Términos y Condiciones' />,
    suspense: false
  }),
  createRoute({
    path: APP_PATHS.LEGAL.PRIVACY,
    element: <ComingSoon message='Estamos preparando el contenido de privacidad.' title='Política de Privacidad' />,
    suspense: false
  }),
  createRoute({
    path: APP_PATHS.LEGAL.SUPPORT,
    element: <ComingSoon message='Muy pronto podrás acceder a la ayuda especializada desde aquí.' title='Centro de Soporte' />,
    suspense: false
  })
]

const layoutRoutes = [
  ...mainRoutes,
  ...adminRoutes,
  ...exampleRoutes,
  ...generalRoutes,
  ...publicRoutes,
  ...authRoutes,
  ...registrationRoutes,
  ...legalRoutes,
  createRoute({ path: APP_PATHS.NOT_FOUND, component: NotFound })
]

const premiumRoutes = [
  createRoute({ path: APP_PATHS.USER.PURCHASE_PLANS, component: PurchasePlans, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.PURCHASE_CHECKOUT, component: Checkout, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.PURCHASE_PAYMENT, component: Payment, guards: [guard(RequireCompleteProfile)] }),
  createRoute({
    path: APP_PATHS.USER.PURCHASE_PAYMENT_STATUS,
    component: MatchPaymentStatus,
    guards: [guard(RequireCompleteProfile)]
  }),
  createRoute({ path: APP_PATHS.USER.PURCHASE_SUCCESS, component: PaymentSuccess, guards: [guard(RequireCompleteProfile)] }),
  createRoute({ path: APP_PATHS.USER.PURCHASE_ERROR, component: PaymentError, guards: [guard(RequireCompleteProfile)] })
]

const onboardingRoute = createRoute({
  path: APP_PATHS.USER.WELCOME_ONBOARDING,
  component: WelcomeOnboarding,
  guards: [guard(RequireCompleteProfile)]
})

const router = createBrowserRouter([
  {
    path: APP_PATHS.ROOT,
    element: <App />,
    errorElement: createRouteElement({ component: NotFound }),
    children: [
      {
        path: '',
        element: <Layout />,
        children: layoutRoutes
      },
      {
        path: '',
        element: <PremiumLayout />,
        children: premiumRoutes
      },
      onboardingRoute
    ]
  }
])

export default router
