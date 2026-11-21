import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { setFilterBy } from '../store/gig.actions'

const POPULAR_TAGS = [
  // Every tag matches at least one title in src/data/gigs.json
  'logo',
  'website',
  'video',
  'wordpress',
  'voice over',
]

export function HomeHero() {
  const navigate = useNavigate()

  function onTagClick(tag) {
    setFilterBy({ txt: tag, category: '' })
    navigate('/explore')
  }

  return (
    <section className="home-hero">
      <h1>
        Our freelancers
        <br />
        will take it from here
      </h1>
      <SearchBar />
      <ul className="home-hero-tags">
        {POPULAR_TAGS.map((tag) => (
          <li key={tag}>
            <button type="button" className="home-hero-tag" onClick={() => onTagClick(tag)}>
              {tag}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
