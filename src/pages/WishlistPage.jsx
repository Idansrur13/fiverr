import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { GigList } from '../cmps/GigList'
import { loadGigs } from '../store/gig.actions'

export function WishlistPage() {
  const gigIds = useSelector((storeState) => storeState.wishlistModule.gigIds)
  const gigs = useSelector((storeState) => storeState.gigModule.gigs)
  // status: 'loading' | 'ready' | 'error'
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let ignore = false

    loadGigs({})
      .then(() => {
        if (!ignore) setStatus('ready')
      })
      .catch(() => {
        if (!ignore) setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [])

  // Built from the store, so removing a heart here takes the gig off the page right away.
  // A saved id whose gig no longer exists is simply skipped.
  const savedGigs = gigs.filter((gig) => gigIds.includes(gig.id))

  function renderContent() {
    if (!gigIds.length) return <WishlistEmpty />
    if (status === 'loading') return <p className="wishlist-page-status">Loading…</p>
    if (status === 'error') {
      return (
        <p className="wishlist-page-status error">Couldn't load your wishlist. Please try again.</p>
      )
    }
    return savedGigs.length ? <GigList gigs={savedGigs} /> : <WishlistEmpty />
  }

  return (
    <section className="wishlist-page">
      <h1>My Wishlist</h1>
      {renderContent()}
    </section>
  )
}

function WishlistEmpty() {
  return (
    <div className="wishlist-page-empty">
      <h2>Your wishlist is empty</h2>
      <p>Tap the heart on any gig to save it here.</p>
      <Link to="/explore" className="wishlist-page-explore">
        Explore gigs
      </Link>
    </div>
  )
}
