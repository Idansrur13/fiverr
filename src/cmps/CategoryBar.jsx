import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { setFilterBy } from '../store/gig.actions'
import { categoryService } from '../services/category.service'
import { utilService } from '../services/util.service'

const CATEGORIES = categoryService.getCategories()

export function CategoryBar() {
  const selectedCategory = useSelector((storeState) => storeState.gigModule.filterBy.category)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeSlug = pathname === '/explore' ? selectedCategory : ''

  function onSelectCategory(slug) {
    setFilterBy({ category: slug, txt: '' })
    navigate(utilService.getExploreUrl({ category: slug }))
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
