import { useCallback, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown, Globe, Menu, Sparkles } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { UserMenu } from './UserMenu'
import { OrdersDropdown } from './OrdersDropdown'
import { SearchBar } from './SearchBar'
import { CategoryBar } from './CategoryBar'
import { MobileMenu } from './MobileMenu'
import { useScrollPast } from '../customHooks/useScrollPast'

const SOLID_HEADER_SCROLL_Y = 150

export function AppHeader() {
  const { pathname } = useLocation()
  const filterTxt = useSelector((storeState) => storeState.gigModule.filterBy.txt)
  const isHomePage = pathname === '/'
  const isScrolledPast = useScrollPast(SOLID_HEADER_SCROLL_Y)
  const isTransparent = isHomePage && !isScrolledPast
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuBtnRef = useRef(null)

  const headerClassName = [
    'app-header full main-layout',
    isHomePage && 'home-header',
    isTransparent && 'transparent',
  ]
    .filter(Boolean)
    .join(' ')

  const closeMenu = useCallback(({ returnFocus = false } = {}) => {
    setIsMenuOpen(false)
    if (returnFocus) menuBtnRef.current?.focus()
  }, [])

  const isLoggedIn = useSelector((storeState) => Boolean(storeState.userModule.user))
  const [loginMode, setLoginMode] = useState(null)
  const closeLogin = useCallback(() => setLoginMode(null), [])

  return (
    <header className={headerClassName}>
      <div className="header-content">
        <button
          type="button"
          className="btn-menu"
          ref={menuBtnRef}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="logo">
          fiverr<span className="logo-dot">.</span>
        </Link>
        {!isTransparent && <SearchBar key={filterTxt} />}
        <nav className="main-nav">
          <button type="button" className="nav-ai">
            Connect to your AI
            <Sparkles size={16} className="nav-ai-icon" />
            <ChevronDown size={18} />
          </button>
          <NavLink to="/seller/dashboard" className="nav-freelance">
            Freelance on Fiverr
          </NavLink>
          <OrdersDropdown />
          <button type="button" className="nav-lang">
            <Globe size={18} />
            EN
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <UserMenu onOpenLogin={setLoginMode} />
        </nav>
      </div>
      {!isTransparent && <CategoryBar />}
      {isMenuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  )
}
