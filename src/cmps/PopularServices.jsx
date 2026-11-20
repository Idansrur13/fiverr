import { useNavigate } from 'react-router-dom'
import { setFilterBy } from '../store/gig.actions'

const POPULAR_SERVICES = [
  { name: 'Website Development', category: 'programming-tech', imgSeed: 'website-development' },
  { name: 'Logo Design', category: 'graphics-design', imgSeed: 'logo-design' },
  { name: 'SEO', category: 'digital-marketing', imgSeed: 'seo' },
  { name: 'Video Editing', category: 'video-animation', imgSeed: 'video-editing' },
  { name: 'Social Media Marketing', category: 'digital-marketing', imgSeed: 'social-media' },
  { name: 'Voice Over', category: 'music-audio', imgSeed: 'voice-over' },
  { name: 'Translation', category: 'writing-translation', imgSeed: 'translation' },
]

export function PopularServices() {
  const navigate = useNavigate()

  function onServiceClick(category) {
    setFilterBy({ category, txt: '' })
    navigate('/explore')
  }

  return (
    <section className="popular-services">
      <h2>Popular services</h2>
      <ul className="popular-services-list">
        {POPULAR_SERVICES.map(({ name, category, imgSeed }) => (
          <li key={name}>
            <button
              type="button"
              className="popular-service"
              onClick={() => onServiceClick(category)}
            >
              <span className="popular-service-name">{name}</span>
              <img
                className="popular-service-img"
                src={`https://picsum.photos/seed/${imgSeed}/400/300`}
                alt=""
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
