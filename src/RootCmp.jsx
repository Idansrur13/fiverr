import { Routes, Route } from 'react-router-dom'
import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'
import { routes } from './routes'

export function RootCmp() {
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
