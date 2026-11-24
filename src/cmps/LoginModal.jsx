import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { login, signup } from '../store/user.actions'

const PASSWORD_MIN_LENGTH = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TEXTS = {
  login: {
    title: 'Sign in to your account',
    submit: 'Sign in',
    sending: 'Signing in...',
    switchPrompt: "Don't have an account?",
    switchAction: 'Join here',
  },
  signup: {
    title: 'Create a new account',
    submit: 'Join',
    sending: 'Joining...',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
  },
}

export function LoginModal({ mode: initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode)
  const [fields, setFields] = useState({ fullname: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitErrorMsg, setSubmitErrorMsg] = useState('')
  const [isSending, setIsSending] = useState(false)
  const panelRef = useRef(null)
  const isSignup = mode === 'signup'
  const texts = TEXTS[mode]

  useEffect(() => {
    function onMouseDown(ev) {
      if (!panelRef.current?.contains(ev.target)) onClose()
    }
    function onKeyDown(ev) {
      if (ev.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    panelRef.current?.querySelector('input')?.focus()
  }, [mode])

  function handleChange({ target }) {
    setFields((prevFields) => ({ ...prevFields, [target.name]: target.value }))
    setErrors((prevErrors) => ({ ...prevErrors, [target.name]: '' }))
  }

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setErrors({})
    setSubmitErrorMsg('')
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const newErrors = validate(fields, isSignup)
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    const email = fields.email.trim()
    setIsSending(true)
    setSubmitErrorMsg('')
    try {
      if (isSignup) {
        await signup({ fullname: fields.fullname.trim(), email, password: fields.password })
      } else {
        await login({ email, password: fields.password })
      }
      onClose()
    } catch (err) {
      setSubmitErrorMsg(err.message || 'Something went wrong. Please try again.')
      setIsSending(false)
    }
  }

  return createPortal(
    <div className="login-modal">
      <div className="login-modal-backdrop" aria-hidden="true" />
      <div
        className="login-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        ref={panelRef}
      >
        <button
          type="button"
          className="login-modal-close"
          aria-label="Close"
          onClick={() => onClose()}
        >
          <X size={20} />
        </button>
        <h2 id="login-modal-title">{texts.title}</h2>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <div className="login-field">
              <label htmlFor="login-fullname">Full name</label>
              <input
                id="login-fullname"
                name="fullname"
                autoComplete="name"
                value={fields.fullname}
                onChange={handleChange}
                aria-invalid={!!errors.fullname}
                aria-describedby="login-fullname-error"
              />
              <p id="login-fullname-error" className="login-field-error">
                {errors.fullname}
              </p>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby="login-email-error"
            />
            <p id="login-email-error" className="login-field-error">
              {errors.email}
            </p>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={fields.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby="login-password-error"
            />
            <p id="login-password-error" className="login-field-error">
              {errors.password}
            </p>
          </div>

          {submitErrorMsg && (
            <p className="login-submit-error" role="alert">
              {submitErrorMsg}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={isSending}>
            {isSending ? texts.sending : texts.submit}
          </button>
        </form>

        <p className="login-switch">
          {texts.switchPrompt}{' '}
          <button type="button" onClick={switchMode}>
            {texts.switchAction}
          </button>
        </p>
      </div>
    </div>,
    document.body,
  )
}

function validate({ fullname, email, password }, isSignup) {
  return {
    fullname: isSignup && !fullname.trim() ? 'Full name is required' : '',
    email: EMAIL_PATTERN.test(email.trim()) ? '' : 'Enter a valid email',
    password:
      password.length >= PASSWORD_MIN_LENGTH
        ? ''
        : `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  }
}
