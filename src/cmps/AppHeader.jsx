import { Link, NavLink } from 'react-router-dom'
import { UserMenu } from './UserMenu'

export function AppHeader() {
  return (
    <header className="app-header full main-layout">
      <div className="header-content">
        <Link to="/" className="logo">
          fiverr<span className="logo-dot">.</span>
        </Link>
        <nav className="main-nav">
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/seller/dashboard">Become a Seller</NavLink>
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
