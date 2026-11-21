import { Star } from 'lucide-react'

function formatReviewDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ReviewPreview({ review }) {
  const reviewer = review.by || review.reviewer || review.user || {}
  const name = reviewer.fullname || reviewer.name || 'Anonymous reviewer'
  const rating = Number(review.rating) || 0
  const date = formatReviewDate(review.createdAt || review.date)
  const text = review.txt || review.text || ''

  return (
    <article className="review-preview">
      <header className="review-preview-header">
        {reviewer.imgUrl ? (
          <img className="review-preview-avatar" src={reviewer.imgUrl} alt="" />
        ) : (
          <span className="review-preview-avatar review-preview-avatar-fallback" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="review-preview-reviewer">
          <strong>{name}</strong>
          {reviewer.country && <span>{reviewer.country}</span>}
        </div>
      </header>
      <div className="review-preview-rating">
        <span className="review-preview-stars" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          ))}
        </span>
        {date && (
          <time dateTime={new Date(review.createdAt || review.date).toISOString()}>{date}</time>
        )}
      </div>
      <p className="review-preview-text">{text}</p>
    </article>
  )
}
