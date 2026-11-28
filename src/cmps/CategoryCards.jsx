import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Clapperboard,
  Code,
  LayoutGrid,
  Languages,
  Megaphone,
  Music,
  PenTool,
  Sparkles,
} from 'lucide-react'
import { setFilterBy } from '../store/gig.actions'
import { categoryService } from '../services/category.service'
import { utilService } from '../services/util.service'

// The icons are UI, so they live here and category.service stays data only
const CATEGORY_ICONS = {
  'graphics-design': PenTool,
  'programming-tech': Code,
  'digital-marketing': Megaphone,
  'video-animation': Clapperboard,
  'writing-translation': Languages,
  'music-audio': Music,
  business: Briefcase,
  'ai-services': Sparkles,
}

const CATEGORIES = categoryService.getCategories()

export function CategoryCards() {
  const navigate = useNavigate()

  function onCardClick(slug) {
    setFilterBy({ category: slug, txt: '' })
    // The filter goes in the URL, which is what Explore reads (#28)
    navigate(utilService.getExploreUrl({ category: slug }))
  }

  return (
    <nav className="category-cards" aria-label="Browse categories">
      <ul>
        {CATEGORIES.map(({ name, slug }) => {
          // A category added later without an icon still gets one
          const Icon = CATEGORY_ICONS[slug] ?? LayoutGrid
          return (
            <li key={slug}>
              <button type="button" className="category-card" onClick={() => onCardClick(slug)}>
                <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
                <span>{name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
