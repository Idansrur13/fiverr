import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { GigList } from '../cmps/GigList'
import { loadGigs } from '../store/gig.actions'
import { categoryService } from '../services/category.service'
import { useFilterSearchParams } from '../customHooks/useFilterSearchParams'

export function ExplorePage() {
  const [filterBy] = useFilterSearchParams()
  const gigs = useSelector((storeState) => storeState.gigModule.gigs)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let ignore = false

    async function onLoadGigs() {
      setIsLoading(true)
      setHasError(false)
      try {
        await loadGigs(filterBy)
      } catch {
        if (!ignore) setHasError(true)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    onLoadGigs()
    return () => {
      ignore = true
    }
  }, [filterBy])

  return (
    <section className="explore-page">
      <h1>{getTitle(filterBy)}</h1>
      {isLoading && <p className="explore-page-status">Loading…</p>}
      {!isLoading && hasError && (
        <p className="explore-page-status error">Couldn't load services. Please try again.</p>
      )}
      {!isLoading && !hasError && (
        <>
          <p className="explore-page-count">
            {gigs.length} {gigs.length === 1 ? 'service' : 'services'} available
          </p>
          <GigList gigs={gigs} />
        </>
      )}
    </section>
  )
}

function getTitle({ txt, category }) {
  if (txt) return `Results for "${txt}"`
  if (category) return categoryService.getCategoryName(category)
  return 'Explore'
}
