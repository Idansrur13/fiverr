import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { setFilterBy } from '../store/gig.actions'

const CATEGORIES = [
  { name: 'Graphics & Design', slug: 'graphics-design' },
  { name: 'Programming & Tech', slug: 'programming-tech' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Video & Animation', slug: 'video-animation' },
  { name: 'Writing & Translation', slug: 'writing-translation' },
  { name: 'Music & Audio', slug: 'music-audio' },
  { name: 'Business', slug: 'business' },
  { name: 'AI Services', slug: 'ai-services' },
]

export function CategoryBar() {
  const selectedCategory = useSelector((storeState) => storeState.gigModule.filterBy.category)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeSlug = pathname === '/explore' ? selectedCategory : ''

  function onSelectCategory(slug) {
    setFilterBy({ category: slug, txt: '' })
    navigate('/explore')
  }

  return (
    <nav className="category-bar" aria-label="Categories">
      <ul>
        {CATEGORIES.map(({ name, slug }) => (
          <li key={slug}>
            <button
              type="button"
              className={slug === activeSlug ? 'active' : ''}
              aria-pressed={slug === activeSlug}
              onClick={() => onSelectCategory(slug)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
