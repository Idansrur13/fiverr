export const reviewService = {
  getStats,
}

function getStats(reviews = []) {
  const reviewList = Array.isArray(reviews) ? reviews : []
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let ratingTotal = 0
  let ratedCount = 0

  reviewList.forEach((review) => {
    const rating = Number(review.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return

    counts[rating] += 1
    ratingTotal += rating
    ratedCount += 1
  })

  return {
    avg: ratedCount ? Math.round((ratingTotal / ratedCount) * 10) / 10 : 0,
    total: reviewList.length,
    counts,
  }
}
