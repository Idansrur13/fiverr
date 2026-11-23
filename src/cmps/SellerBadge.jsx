import { Star } from 'lucide-react'
import { userService } from '../services/user.service'

export function SellerBadge({ level, rating, reviewsCount, showReviews = true }) {
  const badgeLabel = userService.getLevelLabel(level) || level

  return (
    <div className="seller-badge">
      {level && (
        <span className={`badge-label ${level.toLowerCase().replace('_', '-')}`}>{badgeLabel}</span>
      )}
      {rating != null && (
        <span className="badge-rating">
          <Star className="star-icon" size={16} fill="currentColor" />
          <strong className="rating-value">{rating.toFixed(1)}</strong>
          {showReviews && reviewsCount != null && (
            <span className="reviews-count">({reviewsCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  )
}
