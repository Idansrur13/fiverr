import { useNavigate } from 'react-router-dom'
import { setFilterBy } from '../store/gig.actions'

// txt narrows each card inside its category, so two cards never show the same list.
// Every txt matches at least one title in src/data/gigs.json.
const POPULAR_SERVICES = [
  {
    name: 'Website Development',
    category: 'programming-tech',
    txt: 'website',
    imgSeed: 'website-development',
  },
  { name: 'Logo Design', category: 'graphics-design', txt: 'logo', imgSeed: 'logo-design' },
  { name: 'SEO', category: 'digital-marketing', txt: 'seo', imgSeed: 'seo' },
  { name: 'Video Editing', category: 'video-animation', txt: 'edit', imgSeed: 'video-editing' },
  {
    name: 'Social Media Marketing',
    category: 'digital-marketing',
    txt: 'instagram',
    imgSeed: 'social-media',
  },
  { name: 'Voice Over', category: 'music-audio', txt: 'voice over', imgSeed: 'voice-over' },
  { name: 'Translation', category: 'writing-translation', txt: 'translat', imgSeed: 'translation' },
]

export function PopularServices() {
  const navigate = useNavigate()

  function onServiceClick({ category, txt }) {
    setFilterBy({ category, txt })
    navigate('/explore')
  }

  return (
    <section className="popular-services">
      <h2>Popular services</h2>
      <ul className="popular-services-list">
        {POPULAR_SERVICES.map((service) => (
          <li key={service.name}>
            <button
              type="button"
              className="popular-service"
              onClick={() => onServiceClick(service)}
            >
              <span className="popular-service-name">{service.name}</span>
              <img
                className="popular-service-img"
                src={`https://picsum.photos/seed/${service.imgSeed}/400/300`}
                alt=""
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
