import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home } from 'lucide-react'

import { loadGig } from '../store/gig.actions'
import { SET_GIG } from '../store/gig.reducer'
import { store } from '../store/store'
import { GigGallery } from '../cmps/GigGallery'
import { SellerOverview } from '../cmps/SellerOverview'
import { AboutSeller } from '../cmps/AboutSeller'
import { OrderCard } from '../cmps/OrderCard'

function formatCategoryName(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function GigDetailsPage() {
  const { gigId } = useParams()
  const gig = useSelector((state) => state.gigModule.gig)
  const [loadedGigId, setLoadedGigId] = useState(null)

  useEffect(() => {
    let isCancelled = false

    loadGig(gigId)
      .catch(() => null)
      .finally(() => {
        if (!isCancelled) setLoadedGigId(gigId)
      })

    return () => {
      isCancelled = true
      store.dispatch({ type: SET_GIG, gig: null })
    }
  }, [gigId])

  if (loadedGigId !== gigId) return <div className="loader">Loading...</div>
  if (gig?.id !== gigId) return <div className="error-msg">Gig not found</div>

  const { title, description, category, owner, images, reviews = [] } = gig
  const rating = owner?.rating
  const reviewsCount = reviews.length

  return (
    <section className="gig-details-page">
      <div className="gig-details-main">
        {category && (
          <nav className="gig-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" aria-label="Home">
              <Home size={16} />
            </Link>
            <span className="separator"> / </span>
            <Link to={`/explore?category=${category}`}>{formatCategoryName(category)}</Link>
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
      <aside className="gig-details-sidebar">
        <OrderCard gig={gig} />
      </aside>
    </section>
  )
}
