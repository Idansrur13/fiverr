import { Star } from 'lucide-react'

const BADGE_MAP = {
  NEW: 'New seller',
  LEVEL_1: 'Level 1 Seller',
  LEVEL_2: 'Level 2 Seller',
  TOP_RATED: 'Top Rated Seller',
}

export function SellerBadge({ level, rating, reviewsCount, showReviews = true }) {
  const badgeLabel = BADGE_MAP[level] || level

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
