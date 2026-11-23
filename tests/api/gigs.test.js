import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import gigsHandler from '../../api/gigs/index.js'
import categoriesHandler from '../../api/categories.js'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { loadDemoGigs, toUuid } from '../../prisma/seed-data.js'
import { clearSeededTables, createMockReq, createMockRes } from './helpers.js'

const demoGigs = loadDemoGigs()
const PAUSED_GIG_ID = toUuid('test-paused-gig')

async function getGigs(query = {}) {
  const res = createMockRes()
  await gigsHandler(createMockReq({ query }), res)
  expect(res.statusCode).toBe(200)
  return res.body
}

beforeAll(async () => {
  await clearSeededTables(prisma)
  await seed(prisma, demoGigs)

  // One gig that isn't ACTIVE, to check it never comes back
  const [demoGig] = demoGigs
  const activeGig = await prisma.gig.findUnique({ where: { id: toUuid(demoGig.id) } })
  await prisma.gig.create({
    data: {
      id: PAUSED_GIG_ID,
      ownerId: activeGig.ownerId,
      categoryId: activeGig.categoryId,
      title: 'I will design a paused logo',
      description: 'Not available right now',
      images: [],
      status: 'PAUSED',
    },
  })
})

// At the top level (not inside a describe), so the categories tests still have a connection
afterAll(async () => {
  await clearSeededTables(prisma)
  await prisma.$disconnect()
})

describe('GET /api/gigs', () => {
  it('returns only active gigs', async () => {
    const gigs = await getGigs()

    expect(gigs).toHaveLength(demoGigs.length)
    expect(gigs.map((gig) => gig.id)).not.toContain(PAUSED_GIG_ID)
  })

  it('returns gigs in the preview shape', async () => {
    const gigs = await getGigs()
    const demoGig = demoGigs.find((gig) => gig.id === 'g101')
    const gig = gigs.find(({ id }) => id === toUuid('g101'))

    expect(gig).toEqual({
      id: toUuid('g101'),
      title: demoGig.title,
      images: demoGig.images,
      category: demoGig.category,
      price: demoGig.price,
      daysToMake: demoGig.daysToMake,
      owner: {
        id: toUuid(demoGig.owner.id),
        fullname: demoGig.owner.fullname,
        imgUrl: demoGig.owner.imgUrl,
        level: demoGig.owner.level,
      },
      reviews: expect.any(Array),
    })
    expect(gig.reviews.map((review) => review.rating).sort()).toEqual(
      demoGig.reviews.map((review) => review.rating).sort(),
    )
  })

  it('filters gigs by txt and category together', async () => {
    const gigs = await getGigs({ txt: 'LOGO', category: 'graphics-design' })
    const expectedIds = demoGigs
      .filter(
        (gig) => gig.title.toLowerCase().includes('logo') && gig.category === 'graphics-design',
      )
      .map((gig) => toUuid(gig.id))

    expect(expectedIds.length).toBeGreaterThan(0)
    expect(gigs.map((gig) => gig.id).sort()).toEqual(expectedIds.sort())
  })

  it('filters by starting price and delivery days in the db', async () => {
    const gigs = await getGigs({ minPrice: '50', maxPrice: '100', daysToMake: '3' })
    const expectedIds = demoGigs
      .filter((gig) => gig.price >= 50 && gig.price <= 100 && gig.daysToMake <= 3)
      .map((gig) => toUuid(gig.id))

    expect(expectedIds.length).toBeGreaterThan(0)
    expect(gigs.map((gig) => gig.id).sort()).toEqual(expectedIds.sort())
  })
})

describe('GET /api/categories', () => {
  it('returns all categories', async () => {
    const res = createMockRes()
    await categoriesHandler(createMockReq(), res)

    const dbCategories = await prisma.category.findMany()
    const demoCategorySlugs = new Set(demoGigs.map((gig) => gig.category))

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveLength(dbCategories.length)
    expect(res.body.map((category) => category.slug).sort()).toEqual(
      dbCategories.map((category) => category.slug).sort(),
    )
    demoCategorySlugs.forEach((slug) => {
      expect(res.body.map((category) => category.slug)).toContain(slug)
    })
    res.body.forEach((category) => {
      expect(Object.keys(category).sort()).toEqual(['id', 'name', 'parentId', 'slug'])
    })
  })
})
