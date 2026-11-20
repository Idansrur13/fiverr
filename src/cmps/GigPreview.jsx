import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

const LEVEL_LABELS = {
  NEW: 'New Seller',
  LEVEL_1: 'Level 1',
  LEVEL_2: 'Level 2',
  TOP_RATED: 'Top Rated',
}

export function GigPreview({ gig }) {
  const { id, title, price, images = [], owner, reviews = [] } = gig
  const reviewsCount = reviews.length

  return (
    <article className="gig-preview">
      <Link to={`/gig/${id}`} className="gig-preview-link">
        <img className="gig-preview-img" src={images[0]} alt={title} />
        <div className="gig-preview-seller">
          <img className="gig-preview-avatar" src={owner.imgUrl} alt="" />
          <span className="gig-preview-seller-name">{owner.fullname}</span>
          {LEVEL_LABELS[owner.level] && (
            <span className={`gig-preview-level ${owner.level === 'TOP_RATED' ? 'top-rated' : ''}`}>
              {LEVEL_LABELS[owner.level]}
            </span>
          )}
        </div>
        <h3 className="gig-preview-title">{title}</h3>
        {reviewsCount > 0 && (
          <p className="gig-preview-rating">
            <Star size={14} className="gig-preview-star" aria-hidden="true" />
            <span className="gig-preview-rating-value">{owner.rating.toFixed(1)}</span>
            <span className="gig-preview-reviews-count">({reviewsCount})</span>
          </p>
        )}
        <p className="gig-preview-price">From ${price}</p>
      </Link>
    </article>
  )
}
