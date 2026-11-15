import { HomePage } from './pages/HomePage'
import { ExplorePage } from './pages/ExplorePage'
import { SellerProfilePage } from './pages/SellerProfilePage'
import { GigDetailsPage } from './pages/GigDetailsPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { BuyerOrdersPage } from './pages/BuyerOrdersPage'
import { OrderDetailsPage } from './pages/OrderDetailsPage'
import { SellerOrdersPage } from './pages/SellerOrdersPage'
import { ProfilePage } from './pages/ProfilePage'
import { SellerDashboardPage } from './pages/SellerDashboardPage'
import { SellerGigsPage } from './pages/SellerGigsPage'
import { GigEditPage } from './pages/GigEditPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes = [
  { path: '/', component: HomePage },
  { path: '/explore', component: ExplorePage },
  { path: '/user/:userId', component: SellerProfilePage },
  { path: '/gig/:gigId', component: GigDetailsPage },
  { path: '/checkout/:gigId', component: CheckoutPage },
  { path: '/orders', component: BuyerOrdersPage },
  { path: '/orders/:orderId', component: OrderDetailsPage },
  { path: '/seller/orders', component: SellerOrdersPage },
  { path: '/profile', component: ProfilePage },
  { path: '/seller/dashboard', component: SellerDashboardPage },
  { path: '/seller/gigs', component: SellerGigsPage },
  { path: '/seller/gigs/new', component: GigEditPage },
  { path: '/seller/gigs/:gigId/edit', component: GigEditPage },
  { path: '*', component: NotFoundPage },
]
