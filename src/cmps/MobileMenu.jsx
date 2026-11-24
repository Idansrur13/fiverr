import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { categoryService } from '../services/category.service'
import { utilService } from '../services/util.service'

const CATEGORIES = categoryService.getCategories()
const DESKTOP_QUERY = '(min-width: 769px)'

export function MobileMenu({ onClose, isLoggedIn = false, onOpenLogin = () => {} }) {
  const panelRef = useRef(null)

  // Close on a click outside the panel, or on Escape (focus goes back to the hamburger)
  useEffect(() => {
    function onMouseDown(ev) {
      if (!panelRef.current?.contains(ev.target)) onClose()
    }
    function onKeyDown(ev) {
      if (ev.key === 'Escape') onClose({ returnFocus: true })
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  // The page behind the menu must not scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // The menu exists only on mobile, so widening the window closes it
  useEffect(() => {
    const mediaQuery = window.matchMedia?.(DESKTOP_QUERY)
    if (!mediaQuery?.addEventListener) return
    const onChange = (ev) => {
      if (ev.matches) onClose()
    }
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [onClose])

  useEffect(() => {
    panelRef.current?.querySelector('button, a')?.focus()
  }, [])

  function openLogin(mode) {
    onClose()
    onOpenLogin(mode)
  }

  return (
    <div className="mobile-menu">
      <div className="mobile-menu-backdrop" aria-hidden="true" />
      <div
        className="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        ref={panelRef}
      >
        <button
          type="button"
          className="mobile-menu-close"
          aria-label="Close menu"
          onClick={() => onClose({ returnFocus: true })}
        >
          <X size={24} />
        </button>
        {!isLoggedIn && (
          <div className="mobile-menu-auth">
            <button type="button" className="btn-join" onClick={() => openLogin('signup')}>
              Join Fiverr
            </button>
            <button
              type="button"
              className="mobile-menu-sign-in"
              onClick={() => openLogin('login')}
            >
              Sign in
            </button>
          </div>
        )}
        <nav aria-label="Mobile">
          <ul className="mobile-menu-links">
            <li>
              <Link to="/explore" onClick={() => onClose()}>
                Explore
              </Link>
            </li>
            <li>
              <Link to="/seller/dashboard" onClick={() => onClose()}>
                Freelance on Fiverr
              </Link>
            </li>
            <li>
              <Link to="/orders" onClick={() => onClose()}>
                Orders
              </Link>
            </li>
          </ul>
          <h3 className="mobile-menu-title">Categories</h3>
          <ul className="mobile-menu-links">
            {CATEGORIES.map(({ name, slug }) => (
              <li key={slug}>
                <Link to={utilService.getExploreUrl({ category: slug })} onClick={() => onClose()}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
