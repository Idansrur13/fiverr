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
import { WishlistPage } from './pages/WishlistPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes = [
  { path: '/', component: HomePage },
  { path: '/explore', component: ExplorePage },
  { path: '/user/:userId', component: SellerProfilePage },
  { path: '/gig/:gigId', component: GigDetailsPage },
  { path: '/checkout/:gigId', component: CheckoutPage, isProtected: true },
  { path: '/orders', component: BuyerOrdersPage, isProtected: true },
  { path: '/wishlist', component: WishlistPage, isProtected: true },
  { path: '/orders/:orderId', component: OrderDetailsPage, isProtected: true },
  { path: '/seller/orders', component: SellerOrdersPage, isProtected: true },
  { path: '/profile', component: ProfilePage, isProtected: true },
  { path: '/seller/dashboard', component: SellerDashboardPage, isProtected: true },
  { path: '/seller/gigs', component: SellerGigsPage, isProtected: true },
  { path: '/seller/gigs/new', component: GigEditPage, isProtected: true },
  { path: '/seller/gigs/:gigId/edit', component: GigEditPage, isProtected: true },
  { path: '*', component: NotFoundPage },
]
