import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { GigList } from '../cmps/GigList'
import { userService } from '../services/user.service'

export function SellerProfilePage() {
  const { userId } = useParams()
  // The result remembers which userId it's for, so a new userId shows "Loading…" by itself
  // status: 'ready' | 'not-found' | 'error'
  const [result, setResult] = useState({ userId: null, seller: null, status: null })

  useEffect(() => {
    let ignore = false

    userService
      .getById(userId)
      .then((seller) => {
        if (!ignore) setResult({ userId, seller, status: 'ready' })
      })
      .catch((err) => {
        if (ignore) return
        setResult({ userId, seller: null, status: err.status === 404 ? 'not-found' : 'error' })
      })

    return () => {
      ignore = true
    }
  }, [userId])

  const { seller, status } = result
  if (result.userId !== userId) {
    return <p className="seller-profile-status">Loading…</p>
  }
  if (status === 'not-found') {
    return (
      <section className="seller-profile-status">
        <h1>Seller not found</h1>
        <p>This seller doesn't exist or is no longer available.</p>
      </section>
    )
  }
  if (status === 'error') {
    return (
      <p className="seller-profile-status error">Couldn't load this seller. Please try again.</p>
    )
  }

  const { fullname, imgUrl, level, about, country, languages, createdAt, rating, reviewsCount } =
    seller
  const levelLabel = userService.getLevelLabel(level)
  const hasDetails = Boolean(country || languages.length || createdAt)

  return (
    <section className="seller-profile-page">
      <aside className="seller-profile-card">
        <img className="seller-profile-avatar" src={imgUrl} alt="" />
        <h1>{fullname}</h1>
        {levelLabel && <p className="seller-profile-level">{levelLabel}</p>}
        {reviewsCount > 0 && (
          <p className="seller-profile-rating">
            <Star size={16} className="seller-profile-star" aria-hidden="true" />
            <strong>{rating.toFixed(1)}</strong>
            <span>({reviewsCount} reviews)</span>
          </p>
        )}

        {hasDetails && (
          <dl className="seller-profile-details">
            {country && (
              <div>
                <dt>From</dt>
                <dd>{country}</dd>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <dt>Languages</dt>
                <dd>{languages.join(', ')}</dd>
              </div>
            )}
            {createdAt && (
              <div>
                <dt>Member since</dt>
                <dd>{formatMemberSince(createdAt)}</dd>
              </div>
            )}
          </dl>
        )}
        {about && <p className="seller-profile-about">{about}</p>}
      </aside>

      <div className="seller-profile-gigs">
        <h2>{fullname}'s Gigs</h2>
        {seller.gigs.length ? (
          <GigList gigs={seller.gigs} />
        ) : (
          <p className="seller-profile-empty">{fullname} has no active gigs right now.</p>
        )}
      </div>
    </section>
  )
}

function formatMemberSince(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
