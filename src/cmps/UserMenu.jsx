import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { logout } from '../store/user.actions'

export function UserMenu({ onOpenLogin }) {
  const user = useSelector((storeState) => storeState.userModule.user)
  const [isOpen, setIsOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const menuRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function onMouseDown(ev) {
      if (!menuRef.current?.contains(ev.target)) setIsOpen(false)
    }
    function onKeyDown(ev) {
      if (ev.key !== 'Escape') return
      setIsOpen(false)
      btnRef.current?.focus()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  function toggleMenu() {
    setErrorMsg('')
    setIsOpen((prevIsOpen) => !prevIsOpen)
  }

  async function onLogout() {
    setErrorMsg('')
    try {
      await logout()
      setIsOpen(false)
    } catch {
      setErrorMsg('Could not log out. Please try again.')
    }
  }

  if (!user) {
    return (
      <>
        <button type="button" className="nav-sign-in" onClick={() => onOpenLogin('login')}>
          Sign in
        </button>
        <button type="button" className="btn-join" onClick={() => onOpenLogin('signup')}>
          Join
        </button>
      </>
    )
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-btn"
        ref={btnRef}
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-controls="user-menu-panel"
        onClick={toggleMenu}
      >
        {user.imgUrl ? (
          <img src={user.imgUrl} alt={user.fullname} className="user-avatar" />
        ) : (
          <span className="user-avatar user-avatar-initial" role="img" aria-label={user.fullname}>
            {user.fullname.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
      {isOpen && (
        <div id="user-menu-panel" className="user-menu-panel">
          <div className="user-menu-header">
            <p className="user-menu-name">{user.fullname}</p>
            <p className="user-menu-email">{user.email}</p>
          </div>
          <ul className="user-menu-links">
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
            </li>
            <li>
              <Link to="/orders" onClick={() => setIsOpen(false)}>
                Orders
              </Link>
            </li>
            <li>
              <Link to="/seller/dashboard" onClick={() => setIsOpen(false)}>
                Switch to selling
              </Link>
            </li>
            <li>
              <button type="button" className="user-menu-logout" onClick={onLogout}>
                Logout
              </button>
            </li>
          </ul>
          {errorMsg && (
            <p className="user-menu-error" role="alert">
              {errorMsg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
