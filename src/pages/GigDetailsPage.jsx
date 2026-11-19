import { useEffect,useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Home } from 'lucide-react'

import { gigService } from '../services/gig.service'
import {GigGallery} from '../cmps/GigGallery'
import { SellerOverview } from '../cmps/SellerOverview'
import { AboutSeller } from '../cmps/AboutSeller'

export function GigDetailsPage() {
  const { gigId } = useParams()
  const [gig, setGig] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGig()
  }, [gigId])

  async function loadGig() {
    setIsLoading(true)
    try {
      const gigData = await gigService.getById(gigId)
      setGig(gigData || null)
    } catch {
      setGig(null)
    } finally {
      setIsLoading(false)
    }
  }
  if (isLoading) return <p>Loading...</p>
  if (!gig) return <p>Gig not found</p>
const { title, description, category, owner, images, rating, reviewsCount } = gig
  const categoryName = typeof category === 'string' ? category : category?.name
  const parentCategoryName = typeof category === 'object' ? category?.parent?.name : null
  return (
    <section className="gig-details-page">
      <div className="gig-details-main">
        {categoryName && (
          <nav className="gig-breadcrumbs">
            <Link to="/" aria-label="Home">
              <Home size={16} />
            </Link>
            {parentCategoryName && (
              <>
                {' / '}
                <span>{parentCategoryName}</span>
              </>
            )}
            {' / '}
            <span>{categoryName}</span>
          </nav>
        )}

      <h1>{title}</h1>
      <SellerOverview owner={owner} rating={rating} reviewsCount={reviewsCount} />
      <GigGallery images={images} />

      <section className="gig-about">
  <h2>About this gig</h2>
  <p>{description}</p>
</section>

      <AboutSeller owner={owner} rating={rating} reviewsCount={reviewsCount} />
      </div>
      <aside className="gig-details-sidebar"></aside>

    </section>
  )
}
