import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { setFilterBy } from '../store/gig.actions'

// The label is what the user sees; `txt` is what's searched.
// Every txt matches at least one title in src/data/gigs.json.
const POPULAR_TAGS = [
  { label: 'Logo Design', txt: 'logo' },
  { label: 'Website Development', txt: 'website' },
  { label: 'Video Editing', txt: 'video' },
  { label: 'WordPress', txt: 'wordpress' },
  { label: 'Voice Over', txt: 'voice over' },
]

// Text wordmarks: we don't have the companies' official logo files
const TRUSTED_BY = ['Meta', 'Google', 'Netflix', 'P&G', 'PayPal', 'Payoneer']

export function HomeHero() {
  const navigate = useNavigate()

  function onTagClick(txt) {
    setFilterBy({ txt, category: '' })
    // The filter goes in the URL, which is what Explore reads (#28)
    navigate(`/explore?${new URLSearchParams({ txt })}`)
  }

  return (
    <section className="home-hero full main-layout">
      <div className="home-hero-content">
        <h1>
          Our freelancers
          <br />
          will take it from here
        </h1>
        <SearchBar placeholder="Search for any service..." />
        <ul className="home-hero-tags" aria-label="Popular searches">
          {POPULAR_TAGS.map(({ label, txt }) => (
            <li key={txt}>
              <button type="button" className="home-hero-tag" onClick={() => onTagClick(txt)}>
                {label}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="home-hero-trusted">
        <span>Trusted by:</span>
        <ul aria-label="Trusted by">
          {TRUSTED_BY.map((company) => (
            <li key={company}>{company}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
