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
})
