import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { buildSeedData, loadDemoGigs, toUuid } from '../../prisma/seed-data.js'
import { clearSeededTables } from './helpers.js'

const demoGigs = loadDemoGigs()
const demoReviews = demoGigs.flatMap((gig) => gig.reviews)
const sellerIds = [...new Set(demoGigs.map((gig) => gig.owner.id))]

async function countRows() {
  const [users, gigs, packages, orders, reviews, categories] = await Promise.all([
    prisma.user.count(),
    prisma.gig.count(),
    prisma.package.count(),
    prisma.order.count(),
    prisma.review.count(),
    prisma.category.count(),
  ])
  return { users, gigs, packages, orders, reviews, categories }
}

describe('buildSeedData', () => {
  it('keeps a seller as a seller when they also review another gig', () => {
    const sellerGig = demoGigs[0]
    const otherGig = demoGigs.find((gig) => gig.owner.id !== sellerGig.owner.id)
    const review = { ...otherGig.reviews[0], by: { ...sellerGig.owner, country: 'Israel' } }

    const { users } = buildSeedData([{ ...otherGig, reviews: [review] }, sellerGig])
    const seller = users.find((user) => user.username === sellerGig.owner.id)

    expect(seller).toMatchObject({
      isSeller: true,
      level: sellerGig.owner.level,
      country: 'Israel',
    })
  })
})

describe('prisma seed', () => {
  beforeAll(async () => {
    await clearSeededTables(prisma)
    await seed(prisma, demoGigs)
  })

  afterAll(async () => {
    await clearSeededTables(prisma)
    await prisma.$disconnect()
  })

  it('creates a user for every seller in the demo data', async () => {
    const sellers = await prisma.user.findMany({ where: { username: { in: sellerIds } } })

    expect(sellers).toHaveLength(sellerIds.length)
    sellers.forEach((seller) => {
      const demoOwner = demoGigs.find((gig) => gig.owner.id === seller.username).owner
      expect(seller).toMatchObject({
        isSeller: true,
        fullname: demoOwner.fullname,
        level: demoOwner.level,
      })
    })
  })

  it('creates every demo gig linked to its category', async () => {
    const gigs = await prisma.gig.findMany({ include: { category: true, owner: true } })

    expect(gigs).toHaveLength(demoGigs.length)
    demoGigs.forEach((demoGig) => {
      const gig = gigs.find(({ id }) => id === toUuid(demoGig.id))
      expect(gig).toMatchObject({ title: demoGig.title, status: demoGig.status })
      expect(gig.category.slug).toBe(demoGig.category)
      expect(gig.owner.username).toBe(demoGig.owner.id)
    })
  })

  it('creates three packages with features for every gig', async () => {
    const gigs = await prisma.gig.findMany({ include: { packages: true } })

    gigs.forEach((gig) => {
      const demoGig = demoGigs.find(({ id }) => toUuid(id) === gig.id)
      const priceByTier = Object.fromEntries(gig.packages.map((pkg) => [pkg.tier, +pkg.price]))

      expect(gig.packages).toHaveLength(3)
      expect(priceByTier).toEqual({
        BASIC: demoGig.price,
        STANDARD: demoGig.price * 2,
        PREMIUM: demoGig.price * 3,
      })
      gig.packages.forEach((pkg) => expect(pkg.features.length).toBeGreaterThan(0))
    })
  })

  it('creates reviews with a completed order', async () => {
    const reviews = await prisma.review.findMany({ include: { order: true } })

    expect(reviews).toHaveLength(demoReviews.length)
    reviews.forEach((review) => {
      expect(review.order.status).toBe('COMPLETED')
      expect(review.order.gigId).toBe(review.gigId)
      expect(review.order.buyerId).toBe(review.reviewerId)
      expect(review.order.createdAt.getTime()).toBeLessThan(review.createdAt.getTime())
    })
  })

  it('dates every order after its gig was created and before its delivery', async () => {
    const orders = await prisma.order.findMany({ include: { gig: true } })

    expect(orders).toHaveLength(demoReviews.length)
    orders.forEach((order) => {
      expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(order.gig.createdAt.getTime())
      expect(order.createdAt.getTime()).toBeLessThan(order.deliveredAt.getTime())
      expect(order.deliveredAt.getTime()).toBeLessThanOrEqual(order.dueAt.getTime())
    })
  })

  it('updates the existing rows instead of creating duplicates when run again', async () => {
    const countsAfterFirstRun = await countRows()
    const [firstGig, ...otherGigs] = demoGigs

    await seed(prisma, [{ ...firstGig, title: 'An updated demo title' }, ...otherGigs])

    expect(await countRows()).toEqual(countsAfterFirstRun)
    const gig = await prisma.gig.findUnique({ where: { id: toUuid(firstGig.id) } })
    expect(gig.title).toBe('An updated demo title')
  })
})
