import { useState } from 'react'
import { ReviewPreview } from './ReviewPreview'

const INITIAL_REVIEW_COUNT = 5

export function ReviewList({ reviews = [] }) {
  const [showAll, setShowAll] = useState(false)

  if (!reviews.length) {
    return (
      <section className="review-list" aria-label="Reviews">
        <p className="review-list-empty">No reviews yet.</p>
      </section>
    )
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_REVIEW_COUNT)

  return (
    <section className="review-list" aria-label="Reviews">
      <div className="review-list-items">
        {visibleReviews.map((review, idx) => (
          <ReviewPreview
            key={review.id || `${review.createdAt || 'review'}-${idx}`}
            review={review}
          />
        ))}
      </div>
      {!showAll && reviews.length > INITIAL_REVIEW_COUNT && (
        <button className="review-list-show-more" type="button" onClick={() => setShowAll(true)}>
          Show more
        </button>
      )}
    </section>
  )
}
