import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { loadDemoGigs, toUuid } from '../../prisma/seed-data.js'

const demoGigs = loadDemoGigs()
const demoReviews = demoGigs.flatMap((gig) => gig.reviews)
const sellerIds = [...new Set(demoGigs.map((gig) => gig.owner.id))]

async function clearSeededTables() {
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.package.deleteMany()
  await prisma.gig.deleteMany()
  await prisma.user.deleteMany()
}

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

describe('prisma seed', () => {
  beforeAll(async () => {
    await clearSeededTables()
    await seed(prisma, demoGigs)
  })

  afterAll(async () => {
    await clearSeededTables()
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

  it('creates three packages for every gig', async () => {
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

  it('does not create duplicates when run twice', async () => {
    const countsAfterFirstRun = await countRows()

    await seed(prisma, demoGigs)

    expect(await countRows()).toEqual(countsAfterFirstRun)
  })
})
