import { describe, it, expect, beforeEach } from 'vitest'
import { userService } from './user.service'
import demoGigs from '../data/gigs.json'

describe('userService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getLevelLabel returns one label per level, and nothing for an unknown level', () => {
    expect(userService.getLevelLabel('NEW')).toBe('New Seller')
    expect(userService.getLevelLabel('LEVEL_1')).toBe('Level 1')
    expect(userService.getLevelLabel('LEVEL_2')).toBe('Level 2')
    expect(userService.getLevelLabel('TOP_RATED')).toBe('Top Rated')
    expect(userService.getLevelLabel('SOMETHING_ELSE')).toBe('')
  })

  it('getById returns the seller, the rating over all their reviews and their gigs', async () => {
    const sellerGigs = demoGigs.filter((gig) => gig.owner.id === 'u101')
    const reviews = sellerGigs.flatMap((gig) => gig.reviews)

    const seller = await userService.getById('u101')

    expect(seller).toMatchObject({
      id: 'u101',
      fullname: sellerGigs[0].owner.fullname,
      level: sellerGigs[0].owner.level,
      reviewsCount: reviews.length,
      languages: [],
    })
    expect(seller.gigs.map((gig) => gig.id).sort()).toEqual(sellerGigs.map((gig) => gig.id).sort())
  })

  it('getById leaves out gigs that are not active', async () => {
    const sellerGigs = demoGigs.filter((gig) => gig.owner.id === 'u101')
    const pausedGig = { ...sellerGigs[0], id: 'paused-gig', status: 'PAUSED' }
    localStorage.setItem('gigDB', JSON.stringify([...demoGigs, pausedGig]))

    const seller = await userService.getById('u101')

    expect(seller.gigs.map((gig) => gig.id)).not.toContain('paused-gig')
    expect(seller.gigs).toHaveLength(sellerGigs.length)
  })

  it('getById rejects with status 404 for an unknown user', async () => {
    await expect(userService.getById('no-such-user')).rejects.toMatchObject({ status: 404 })
  })
})
