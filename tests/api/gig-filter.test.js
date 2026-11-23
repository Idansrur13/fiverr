import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildGigWhere, findGigIdsPage, getGigPaging } from '../../api/_lib/gig-filter.js'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { loadDemoGigs, toUuid } from '../../prisma/seed-data.js'
import { clearSeededTables } from './helpers.js'

const DEFAULT_FILTER = { txt: '', category: '', minPrice: '', maxPrice: '', daysToMake: '' }

describe('buildGigWhere', () => {
  it('builds an empty where for the default filter', () => {
    expect(buildGigWhere(DEFAULT_FILTER)).toEqual({})
    expect(buildGigWhere()).toEqual({})
  })

  it('searches the title case insensitive', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, txt: '  Logo ' })).toEqual({
      title: { contains: 'Logo', mode: 'insensitive' },
    })
  })

  it('filters by category slug', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, category: 'music-audio' })).toEqual({
      category: { slug: 'music-audio' },
    })
  })

  it('filters by min and max starting price', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, minPrice: '50', maxPrice: '100' })).toEqual({
      packages: { some: { tier: 'BASIC', price: { gte: 50, lte: 100 } } },
    })
    expect(buildGigWhere({ ...DEFAULT_FILTER, minPrice: '50' })).toEqual({
      packages: { some: { tier: 'BASIC', price: { gte: 50 } } },
    })
  })

  it('filters by max delivery days', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, daysToMake: '3' })).toEqual({
      packages: { some: { tier: 'BASIC', daysToMake: { lte: 3 } } },
    })
  })

  it('ignores values that are not numbers and takes the first of repeated params', () => {
    expect(buildGigWhere({ minPrice: 'abc', daysToMake: '' })).toEqual({})
    expect(buildGigWhere({ category: ['music-audio', 'graphics-design'] })).toEqual({
      category: { slug: 'music-audio' },
    })
  })
})

describe('getGigPaging', () => {
  it('falls back to recommended, page 1 and 12 per page', () => {
    expect(getGigPaging()).toEqual({ sortBy: 'recommended', page: 1, pageSize: 12 })
    expect(getGigPaging({ sortBy: 'cheapest', page: '-2', pageSize: 'abc' })).toEqual({
      sortBy: 'recommended',
      page: 1,
      pageSize: 12,
    })
    expect(getGigPaging({ sortBy: ['newest'], page: '3', pageSize: '500' })).toEqual({
      sortBy: 'newest',
      page: 3,
      pageSize: 100,
    })
  })
})

describe('findGigIdsPage', () => {
  const demoGigs = loadDemoGigs()
  const ALL = { page: 1, pageSize: 100 }

  async function getSortedIds(sortBy) {
    const { ids } = await findGigIdsPage(prisma, {}, { ...ALL, sortBy })
    return ids
  }

  function getAvgRating(gig) {
    return gig.reviews.reduce((sum, review) => sum + review.rating, 0) / gig.reviews.length
  }

  beforeAll(async () => {
    await clearSeededTables(prisma)
    await seed(prisma, demoGigs)
  })

  afterAll(async () => {
    await clearSeededTables(prisma)
    await prisma.$disconnect()
  })

  it('sorts by rating for recommended', async () => {
    const ids = await getSortedIds('recommended')
    const gigs = ids.map((id) => demoGigs.find((gig) => toUuid(gig.id) === id))

    expect(ids).toHaveLength(demoGigs.length)
    gigs.slice(1).forEach((gig, idx) => {
      const prevGig = gigs[idx]
      // A lower average never comes first, and on the same average more reviews come first
      expect(getAvgRating(gig)).toBeLessThanOrEqual(getAvgRating(prevGig))
      if (getAvgRating(gig) === getAvgRating(prevGig)) {
        expect(gig.reviews.length).toBeLessThanOrEqual(prevGig.reviews.length)
      }
    })
  })

  it('sorts by orders count for best selling', async () => {
    // The seed gives every gig one order per review, so give the gig with the fewest
    // reviews extra orders: it must jump to the top, which a sort by reviews wouldn't do
    const [leastReviewed] = [...demoGigs].sort((a, b) => a.reviews.length - b.reviews.length)
    const gigId = toUuid(leastReviewed.id)
    const [order] = await prisma.order.findMany({ where: { gigId }, take: 1 })
    const { buyerId, sellerId, packageId, price, serviceFee, total, dueAt } = order
    const orderData = { buyerId, sellerId, gigId, packageId, price, serviceFee, total, dueAt }
    const maxOrders = Math.max(...demoGigs.map((gig) => gig.reviews.length))
    for (let i = 0; i <= maxOrders; i++) {
      await prisma.order.create({ data: { ...orderData, status: 'PENDING' } })
    }

    const ids = await getSortedIds('best-selling')
    const ordersCount = await prisma.order.groupBy({ by: ['gigId'], _count: { _all: true } })
    const countByGigId = new Map(ordersCount.map((row) => [row.gigId, row._count._all]))
    const counts = ids.map((gigId) => countByGigId.get(gigId) ?? 0)

    expect(ids[0]).toBe(gigId)
    expect(counts).toEqual([...counts].sort((a, b) => b - a))
  })

  it('sorts by creation date for newest', async () => {
    const ids = await getSortedIds('newest')
    const newestIds = [...demoGigs]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((gig) => toUuid(gig.id))

    expect(ids).toEqual(newestIds)
  })

  it('returns the requested page and the page count', async () => {
    const allIds = await getSortedIds('newest')
    const pageSize = 10

    const secondPage = await findGigIdsPage(prisma, {}, { sortBy: 'newest', page: 2, pageSize })
    expect(secondPage).toEqual({
      ids: allIds.slice(10, 20),
      total: demoGigs.length,
      page: 2,
      pageCount: 3,
    })

    const lastPage = await findGigIdsPage(prisma, {}, { sortBy: 'newest', page: 3, pageSize })
    expect(lastPage.ids).toEqual(allIds.slice(20))

    // A page after the last one returns the last page
    const tooFar = await findGigIdsPage(prisma, {}, { sortBy: 'newest', page: 99, pageSize })
    expect(tooFar.page).toBe(3)

    const where = buildGigWhere({ category: 'music-audio' })
    const musicGigs = demoGigs.filter((gig) => gig.category === 'music-audio')
    const filtered = await findGigIdsPage(prisma, where, { sortBy: 'newest', page: 1, pageSize })
    expect(filtered.total).toBe(musicGigs.length)
    expect(filtered.ids.sort()).toEqual(musicGigs.map((gig) => toUuid(gig.id)).sort())
  })
})
