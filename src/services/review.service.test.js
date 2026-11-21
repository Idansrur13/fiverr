import { describe, expect, it } from 'vitest'
import { reviewService } from './review.service'

describe('reviewService', () => {
  it('getStats returns the average rating rounded to 1 decimal', () => {
    const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }]

    expect(reviewService.getStats(reviews).avg).toBe(4.3)
  })

  it('getStats counts reviews for each star from 5 to 1', () => {
    const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 2 }, { rating: 1 }]

    expect(reviewService.getStats(reviews).counts).toEqual({ 5: 2, 4: 1, 3: 0, 2: 1, 1: 1 })
  })

  it('getStats returns zeros for no reviews', () => {
    expect(reviewService.getStats([])).toEqual({
      avg: 0,
      total: 0,
      counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    })
  })
})
