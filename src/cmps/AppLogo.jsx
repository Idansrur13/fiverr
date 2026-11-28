import { Link } from 'react-router-dom'

// The site's wordmark: "makerr" in dark text + a green dot, in fiverr's visual pattern.
// The text takes the link's color (currentColor), so the footer can show it in grey.
export function AppLogo({ className = '' }) {
  return (
    <Link to="/" className={`app-logo ${className}`}>
      <svg
        className="app-logo-svg"
        viewBox="0 0 90 28"
        width="90"
        height="28"
        role="img"
        aria-label="makerr"
      >
        <text
          className="app-logo-text"
          x="0"
          y="22"
          textLength="80"
          lengthAdjust="spacingAndGlyphs"
        >
          makerr
        </text>
        <circle className="app-logo-dot" cx="85.5" cy="19.5" r="3.5" />
      </svg>
    </Link>
  )
}
