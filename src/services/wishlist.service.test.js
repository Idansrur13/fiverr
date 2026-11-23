import { describe, it, expect, beforeEach } from 'vitest'
import { wishlistService } from './wishlist.service'

describe('wishlistService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a gig to the wishlist', async () => {
    await wishlistService.add('u100', 'g101')
    // Adding the same gig again doesn't duplicate it
    const gigIds = await wishlistService.add('u100', 'g101')

    expect(gigIds).toEqual(['g101'])
    expect(await wishlistService.query('u100')).toEqual(['g101'])
    expect(JSON.parse(localStorage.getItem('wishlist_u100'))).toEqual(['g101'])
  })

  it('removes a gig from the wishlist', async () => {
    await wishlistService.add('u100', 'g101')
    await wishlistService.add('u100', 'g103')
    const gigIds = await wishlistService.remove('u100', 'g101')

    expect(gigIds).toEqual(['g103'])
    expect(await wishlistService.query('u100')).toEqual(['g103'])
  })

  it('keeps a separate wishlist for each user', async () => {
    await wishlistService.add('u100', 'g101')
    await wishlistService.add('u101', 'g103')

    expect(await wishlistService.query('u100')).toEqual(['g101'])
    expect(await wishlistService.query('u101')).toEqual(['g103'])
    expect(await wishlistService.query('u102')).toEqual([])
  })
})
