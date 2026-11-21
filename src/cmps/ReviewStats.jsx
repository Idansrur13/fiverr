import { Star } from 'lucide-react'
import { reviewService } from '../services/review.service'

export function ReviewStats({ reviews = [] }) {
  const { avg, total, counts } = reviewService.getStats(reviews)

  return (
    <section className="review-stats" aria-label="Review ratings">
      <div className="review-stats-summary">
        <Star size={20} fill="currentColor" aria-hidden="true" />
        <strong>{avg.toFixed(1)}</strong>
        <span>{total.toLocaleString()} reviews</span>
      </div>
      <div className="review-stats-breakdown">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = counts[rating]
          const percentage = total ? (count / total) * 100 : 0

          return (
            <div className="review-stats-row" key={rating}>
              <span className="review-stats-label">{rating} stars</span>
              <div
                className="review-stats-track"
                role="progressbar"
                aria-label={`${rating} star reviews`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={count}
              >
                <span className="review-stats-bar" style={{ width: `${percentage}%` }} />
              </div>
              <span className="review-stats-count">{count}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
