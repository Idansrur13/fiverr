import { describe, it, expect, beforeEach } from 'vitest'
import { gigService } from './gig.service'
import demoGigs from '../data/gigs.json'

const testGigs = [
  {
    id: 'g1',
    title: 'I will design a modern minimalist logo',
    price: 50,
    daysToMake: 2,
    category: 'graphics-design',
  },
  {
    id: 'g2',
    title: 'I will build a responsive React website',
    price: 300,
    daysToMake: 7,
    category: 'programming-tech',
  },
  {
    id: 'g3',
    title: 'I will write SEO blog posts',
    price: 30,
    daysToMake: 3,
    category: 'writing-translation',
  },
  {
    id: 'g4',
    title: 'I will create a Logo animation',
    price: 120,
    daysToMake: 5,
    category: 'video-animation',
  },
]

function ids(gigs) {
  return gigs.map((gig) => gig.id).sort()
}

describe('gigService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads demo gigs on first query when storage is empty', async () => {
    const gigs = await gigService.query()
    expect(gigs).toHaveLength(demoGigs.length)
    expect(JSON.parse(localStorage.getItem('gigDB'))).toHaveLength(demoGigs.length)
  })

  describe('with stored gigs', () => {
    beforeEach(() => {
      localStorage.setItem('gigDB', JSON.stringify(testGigs))
    })

    it('filters gigs by txt, case insensitive', async () => {
      const gigs = await gigService.query({ txt: 'LOGO' })
      expect(ids(gigs)).toEqual(['g1', 'g4'])
    })

    it('filters gigs by category', async () => {
      const gigs = await gigService.query({ category: 'programming-tech' })
      expect(ids(gigs)).toEqual(['g2'])
    })

    it('filters gigs by min and max price', async () => {
      const gigs = await gigService.query({ minPrice: 40, maxPrice: '150' })
      expect(ids(gigs)).toEqual(['g1', 'g4'])
    })

    it('filters gigs by max delivery days', async () => {
      const gigs = await gigService.query({ daysToMake: 3 })
      expect(ids(gigs)).toEqual(['g1', 'g3'])
    })

    it('returns all gigs for the default filter', async () => {
      const gigs = await gigService.query(gigService.getDefaultFilter())
      expect(ids(gigs)).toEqual(['g1', 'g2', 'g3', 'g4'])
    })

    it('getById returns the matching gig', async () => {
      const gig = await gigService.getById('g2')
      expect(gig).toEqual(testGigs[1])
    })

    it('getById rejects for an unknown id', async () => {
      await expect(gigService.getById('no-such-id')).rejects.toThrow()
    })

    it('save creates a gig with a new id', async () => {
      const savedGig = await gigService.save({ title: 'I will draw your portrait', price: 40 })
      expect(savedGig.id).toBeTruthy()
      expect(ids(testGigs)).not.toContain(savedGig.id)
      const gigs = await gigService.query()
      expect(gigs).toHaveLength(5)
      expect(await gigService.getById(savedGig.id)).toMatchObject({
        title: 'I will draw your portrait',
        price: 40,
      })
    })

    it('save updates an existing gig', async () => {
      await gigService.save({ ...testGigs[0], price: 80 })
      const gig = await gigService.getById('g1')
      expect(gig.price).toBe(80)
      expect(gig.title).toBe(testGigs[0].title)
      expect(await gigService.query()).toHaveLength(4)
    })

    it('remove deletes the gig', async () => {
      await gigService.remove('g3')
      expect(ids(await gigService.query())).toEqual(['g1', 'g2', 'g4'])
      await expect(gigService.getById('g3')).rejects.toThrow()
    })
  })

  describe('queryPage', () => {
    function getAvgRating(gig) {
      return gig.reviews.reduce((sum, review) => sum + review.rating, 0) / gig.reviews.length
    }

    it('sorts by rating, then reviews count, by default', async () => {
      const { gigs } = await gigService.queryPage({ ...gigService.getDefaultFilter(), page: '1' })
      const [best] = [...demoGigs].sort(
        (a, b) =>
          getAvgRating(b) - getAvgRating(a) ||
          b.reviews.length - a.reviews.length ||
          b.createdAt - a.createdAt,
      )

      expect(gigs[0].id).toBe(best.id)
      gigs.slice(1).forEach((gig, idx) => {
        expect(getAvgRating(gig)).toBeLessThanOrEqual(getAvgRating(gigs[idx]))
      })
    })

    it('sorts by reviews count for best selling and by date for newest', async () => {
      const bestSelling = await gigService.queryPage({ sortBy: 'best-selling' })
      const counts = bestSelling.gigs.map((gig) => gig.reviews.length)
      expect(counts).toEqual([...counts].sort((a, b) => b - a))

      const newest = await gigService.queryPage({ sortBy: 'newest' })
      const newestIds = [...demoGigs].sort((a, b) => b.createdAt - a.createdAt).map((g) => g.id)
      expect(newest.gigs.map((gig) => gig.id)).toEqual(newestIds.slice(0, 12))
    })

    it('returns the requested page, the total and the page count', async () => {
      const newestIds = [...demoGigs].sort((a, b) => b.createdAt - a.createdAt).map((g) => g.id)

      const secondPage = await gigService.queryPage({ sortBy: 'newest', page: '2' })
      expect(secondPage).toMatchObject({ total: demoGigs.length, page: 2, pageCount: 2 })
      expect(secondPage.gigs.map((gig) => gig.id)).toEqual(newestIds.slice(12, 24))

      // A page that doesn't exist returns the closest one
      expect((await gigService.queryPage({ page: '99' })).page).toBe(2)
      expect((await gigService.queryPage({ page: 'abc' })).page).toBe(1)

      const filtered = await gigService.queryPage({ category: 'music-audio' })
      const musicGigs = demoGigs.filter((gig) => gig.category === 'music-audio')
      expect(filtered).toMatchObject({ total: musicGigs.length, page: 1, pageCount: 1 })
    })
  })
})
