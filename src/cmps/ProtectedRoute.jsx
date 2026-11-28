import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LoginModal } from './LoginModal'

export function ProtectedRoute({ children }) {
  const user = useSelector((storeState) => storeState.userModule.user)
  const isAuthChecked = useSelector((storeState) => storeState.userModule.isAuthChecked)
  const [isLoginOpen, setIsLoginOpen] = useState(true)
  const closeLogin = useCallback(() => setIsLoginOpen(false), [])

  if (user) return children

  if (!isAuthChecked) {
    return <p className="protected-route-message">Loading...</p>
  }

  return (
    <section className="protected-route">
      <h1>Sign in to continue</h1>
      <p>You need to be signed in to see this page.</p>
      <div className="protected-route-actions">
        <button
          type="button"
          className="protected-route-sign-in"
          onClick={() => setIsLoginOpen(true)}
        >
          Sign in
        </button>
        <Link to="/">Back to home</Link>
      </div>
      {isLoginOpen && <LoginModal mode="login" onClose={closeLogin} />}
    </section>
  )
}
