import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Globe, Sparkles } from 'lucide-react'
import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'
import { CategoryBar } from './CategoryBar'

export function AppHeader() {
  const { pathname } = useLocation()
  const filterTxt = useSelector((storeState) => storeState.gigModule.filterBy.txt)
  const isHomePage = pathname === '/'

  return (
    <header className="app-header full main-layout">
      <div className="header-content">
        <Link to="/" className="logo">
          fiverr<span className="logo-dot">.</span>
        </Link>
        {!isHomePage && <SearchBar key={filterTxt} />}
        <nav className="main-nav">
          <button type="button" className="nav-ai">
            Connect to your AI
            <Sparkles size={16} className="nav-ai-icon" />
            <ChevronDown size={18} />
          </button>
          <NavLink to="/seller/dashboard" className="nav-freelance">
            Freelance on Fiverr
          </NavLink>
          <button type="button" className="nav-lang">
            <Globe size={18} />
            EN
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <button type="button" className="nav-sign-in">
            Sign in
          </button>
          <button type="button" className="btn-join">
            Join
          </button>
        </nav>
        <UserMenu />
      </div>
      <CategoryBar />
    </header>
  )
}
