import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'
import { ProtectedRoute } from './cmps/ProtectedRoute'
import { routes } from './routes'
import { loadWishlist } from './store/wishlist.actions'

export function RootCmp() {
  const userId = useSelector((storeState) => storeState.userModule.user?.id)

  // The hearts need the user's saved gigs on every page, so they reload on login / logout
  useEffect(() => {
    loadWishlist().catch(() => {})
  }, [userId])

  return (
    <section className="app main-layout">
      <AppHeader />
      <main className="main-content full main-layout">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.isProtected ? (
                  <ProtectedRoute>
                    <route.component />
                  </ProtectedRoute>
                ) : (
                  <route.component />
                )
              }
            />
          ))}
        </Routes>
      </main>
      <AppFooter />
    </section>
  )
}
