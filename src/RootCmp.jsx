import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'
import { routes } from './routes'
import { loadWishlist } from './store/wishlist.actions'

export function RootCmp() {
  // The hearts need the user's saved gigs on every page. After #33 this also runs on login / logout.
  useEffect(() => {
    loadWishlist().catch(() => {})
  }, [])

  return (
    <section className="app main-layout">
      <AppHeader />
      <main className="main-content full main-layout">
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Routes>
      </main>
      <AppFooter />
    </section>
  )
}
