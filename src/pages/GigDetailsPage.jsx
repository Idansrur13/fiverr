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

export function GigDetailsPage() {
  const { gigId } = useParams()
  const gig = useSelector((state) => state.gigModule.gig)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false
    const controller = new AbortController()

    async function fetchGig() {
      setIsLoading(true)
      setError(null)
      try {
        await loadGig(gigId, controller.signal)
      } catch (err) {
        if (!isCancelled) {
          setError(
            err?.code === 'NOT_FOUND'
              ? 'Gig not found'
              : 'Failed to load gig. Please try again later.',
          )
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchGig()

    return () => {
      isCancelled = true
      controller.abort()
      store.dispatch({ type: SET_GIG, gig: null })
    }
  }, [gigId])

  if (isLoading) return <div className="loader">Loading...</div>
  if (error) return <div className="error-msg">{error}</div>
  if (!gig) return <div className="error-msg">Gig not found</div>

  const { title, description, category, owner, images, reviews = [] } = gig
  const rating = owner?.rating
  const reviewsCount = reviews.length

  const categoryName = typeof category === 'string' ? category : category?.name
  const parentCategoryName = typeof category === 'object' ? category?.parent?.name : null

  function formatCategoryName(name) {
    if (!name) return ''
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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
                <span className="separator"> / </span>
                <Link
                  to={`/explore?category=${category.parent.name.toLowerCase().replace(' ', '-')}`}
                >
                  {formatCategoryName(parentCategoryName)}
                </Link>
              </>
            )}
            <span className="separator"> / </span>
            <Link to={`/explore?category=${categoryName.toLowerCase().replace(' ', '-')}`}>
              {formatCategoryName(categoryName)}
            </Link>
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
