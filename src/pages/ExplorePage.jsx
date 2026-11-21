import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { loadGigs } from '../store/gig.actions'

export function ExplorePage() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const gigs = useSelector((state) => state.gigModule.gigs)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let isCancelled = false

    async function fetchGigs() {
      setIsLoading(true)
      setError(null)
      try {
        await loadGigs({ category }, controller.signal)
      } catch {
        if (!isCancelled) setError('Failed to load gigs. Please try again later.')
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchGigs()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [category])

  return (
    <section className="explore-page">
      <h1>Explore</h1>
      {isLoading && <p>Loading gigs...</p>}
      {error && <p className="error-msg">{error}</p>}
      {!isLoading && !error && gigs.length === 0 && <p>No gigs found</p>}
      {!isLoading && !error && gigs.length > 0 && (
        <ul className="explore-gig-list">
          {gigs.map((gig) => (
            <li key={gig.id}>
              <Link to={`/gig/${gig.id}`}>{gig.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
