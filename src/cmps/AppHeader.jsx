import { useCallback, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Globe, Menu } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { AppLogo } from './AppLogo'
import { UserMenu } from './UserMenu'
import { OrdersDropdown } from './OrdersDropdown'
import { SearchBar } from './SearchBar'
import { CategoryBar } from './CategoryBar'
import { MobileMenu } from './MobileMenu'
import { useScrollPast } from '../customHooks/useScrollPast'

const SHOW_SEARCH_SCROLL_Y = 150

export function AppHeader() {
  const { pathname } = useLocation()
  const filterTxt = useSelector((storeState) => storeState.gigModule.filterBy.txt)
  const isHomePage = pathname === '/'
  const isScrolledPast = useScrollPast(SHOW_SEARCH_SCROLL_Y)
  const isSearchShown = !isHomePage || isScrolledPast
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuBtnRef = useRef(null)

  const headerClassName = [
    'app-header full main-layout',
    isHomePage && 'home-header',
    isHomePage && isScrolledPast && 'scrolled',
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
          <Menu size={20} />
        </button>
        <AppLogo />
        {isSearchShown && <SearchBar key={filterTxt} />}
        <nav className="main-nav">
          <NavLink to="/seller/dashboard" className="nav-freelance">
            Freelance on Fiverr
          </NavLink>
          <OrdersDropdown />
          <button type="button" className="nav-lang">
            <Globe size={16} aria-hidden="true" />
            EN
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <UserMenu onOpenLogin={setLoginMode} />
        </nav>
      </div>
      <CategoryBar />
      {isMenuOpen && (
        <MobileMenu onClose={closeMenu} isLoggedIn={isLoggedIn} onOpenLogin={setLoginMode} />
      )}
      {loginMode && <LoginModal mode={loginMode} onClose={closeLogin} />}
    </header>
  )
}
