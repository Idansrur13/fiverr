import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { categoryService } from '../services/category.service'
import { utilService } from '../services/util.service'

const MOBILE_QUERY = '(max-width: 768px)'

// A link without `to` is a page that doesn't exist yet, so it shows as plain text
const COLUMNS = [
  {
    id: 'categories',
    title: 'Categories',
    links: categoryService.getCategories().map(({ name, slug }) => ({
      label: name,
      to: utilService.getExploreUrl({ category: slug }),
    })),
  },
  {
    id: 'clients',
    title: 'For Clients',
    links: [
      { label: 'How it works' },
      { label: 'Explore', to: '/explore' },
      { label: 'My orders', to: '/orders' },
    ],
  },
  {
    id: 'freelancers',
    title: 'For Freelancers',
    links: [
      { label: 'Become a seller', to: '/seller/dashboard' },
      { label: 'My gigs', to: '/seller/gigs' },
    ],
  },
]

function getIsMobile() {
  return Boolean(window.matchMedia?.(MOBILE_QUERY).matches)
}

export function AppFooter() {
  const [isMobile, setIsMobile] = useState(getIsMobile)
  const [openColumnIds, setOpenColumnIds] = useState([])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(MOBILE_QUERY)
    if (!mediaQuery?.addEventListener) return
    const onChange = (ev) => setIsMobile(ev.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  function onToggleColumn(columnId) {
    setOpenColumnIds((prevIds) =>
      prevIds.includes(columnId) ? prevIds.filter((id) => id !== columnId) : [...prevIds, columnId],
    )
  }

  return (
    <footer className="app-footer full main-layout">
      <div className="footer-columns">
        {COLUMNS.map(({ id, title, links }) => {
          const isOpen = openColumnIds.includes(id)
          const listId = `footer-${id}`
          return (
            <section key={id} className="footer-column">
              <h3 className="footer-column-title">
                {isMobile ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    onClick={() => onToggleColumn(id)}
                  >
                    {title}
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                ) : (
                  title
                )}
              </h3>
              <ul id={listId} hidden={isMobile && !isOpen}>
                {links.map(({ label, to }) => (
                  <li key={label}>{to ? <Link to={to}>{label}</Link> : <span>{label}</span>}</li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <div className="footer-bottom">
        <Link to="/" className="logo">
          fiverr<span className="logo-dot">.</span>
        </Link>
        <p className="footer-copyright">© {new Date().getFullYear()} Fiverr clone</p>
      </div>
    </footer>
  )
}
