import { Star } from 'lucide-react'
import { userService } from '../services/user.service'

export function SellerBadge({ level, rating, reviewsCount, showReviews = true, reviewsHref }) {
  const badgeLabel = userService.getLevelLabel(level) || level

  return (
    <div className="seller-badge">
      {level && (
        <span className={`badge-label ${level.toLowerCase().replace('_', '-')}`}>{badgeLabel}</span>
      )}
      {rating != null && (
        <span className="badge-rating">
          <span className="badge-stars" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="star-icon" size={14} fill="currentColor" />
            ))}
          </span>
          <strong className="rating-value">{rating.toFixed(1)}</strong>
          {showReviews &&
            reviewsCount != null &&
            (reviewsHref ? (
              <a className="reviews-count" href={reviewsHref}>
                ({reviewsCount.toLocaleString()} reviews)
              </a>
            ) : (
              <span className="reviews-count">({reviewsCount.toLocaleString()} reviews)</span>
            ))}
        </span>
      )}
    </div>
  )
}
