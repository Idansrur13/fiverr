import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { ImgCarousel } from './ImgCarousel'
import { userService } from '../services/user.service'

export function GigPreview({ gig }) {
  const { id, title, price, images = [], owner, reviews = [] } = gig
  const reviewsCount = reviews.length
  const rating = reviewsCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
    : 0
  const levelLabel = userService.getLevelLabel(owner.level)

  return (
    <article className="gig-preview">
      <ImgCarousel images={images} alt={title} linkTo={`/gig/${id}`} />
      {/* The seller and the gig are two links side by side, never one inside the other */}
      <div className="gig-preview-seller">
        <Link to={`/user/${owner.id}`} className="gig-preview-seller-link">
          <img className="gig-preview-avatar" src={owner.imgUrl} alt="" />
          <span className="gig-preview-seller-name">{owner.fullname}</span>
        </Link>
        {levelLabel && (
          <span className={`gig-preview-level ${owner.level === 'TOP_RATED' ? 'top-rated' : ''}`}>
            {levelLabel}
          </span>
        )}
      </div>
      <Link to={`/gig/${id}`} className="gig-preview-link">
        <h3 className="gig-preview-title">{title}</h3>
        {reviewsCount > 0 && (
          <p className="gig-preview-rating">
            <Star size={14} className="gig-preview-star" aria-hidden="true" />
            <span className="gig-preview-rating-value">{rating.toFixed(1)}</span>
            <span className="gig-preview-reviews-count">({reviewsCount})</span>
          </p>
        )}
        <p className="gig-preview-price">From ${price}</p>
      </Link>
    </article>
  )
}
