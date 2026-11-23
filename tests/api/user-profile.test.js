import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import userHandler from '../../api/users/[id].js'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { loadDemoGigs, toUuid } from '../../prisma/seed-data.js'
import { clearSeededTables, createMockReq, createMockRes } from './helpers.js'

const demoGigs = loadDemoGigs()
const SELLER_ID = 'u101'
const sellerGigs = demoGigs.filter((gig) => gig.owner.id === SELLER_ID)
const PAUSED_GIG_ID = toUuid('test-paused-profile-gig')

async function getProfile(id) {
  const res = createMockRes()
  await userHandler(createMockReq({ query: { id } }), res)
  return res
}

beforeAll(async () => {
  await clearSeededTables(prisma)
  await seed(prisma, demoGigs)

  // A gig of the same seller that isn't ACTIVE, so it must not show on the profile
  const activeGig = await prisma.gig.findUnique({ where: { id: toUuid(sellerGigs[0].id) } })
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

afterAll(async () => {
  await clearSeededTables(prisma)
  await prisma.$disconnect()
})

describe('GET /api/users/[id]', () => {
  it('returns only public fields of the user', async () => {
    const res = await getProfile(toUuid(SELLER_ID))
    const demoOwner = sellerGigs[0].owner
    const sellerReviews = sellerGigs.flatMap((gig) => gig.reviews)
    const avgRating =
      sellerReviews.reduce((sum, review) => sum + review.rating, 0) / sellerReviews.length

    expect(res.statusCode).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(
      [
        'about',
        'country',
        'createdAt',
        'fullname',
        'gigs',
        'id',
        'imgUrl',
        'languages',
        'level',
        'rating',
        'reviewsCount',
      ].sort(),
    )
    expect(res.body).toMatchObject({
      id: toUuid(SELLER_ID),
      fullname: demoOwner.fullname,
      imgUrl: demoOwner.imgUrl,
      level: demoOwner.level,
      reviewsCount: sellerReviews.length,
    })
    expect(res.body.rating).toBeCloseTo(avgRating)
  })

  it('returns only the active gigs of the seller', async () => {
    const res = await getProfile(toUuid(SELLER_ID))
    const gigIds = res.body.gigs.map((gig) => gig.id)

    expect(gigIds.sort()).toEqual(sellerGigs.map((gig) => toUuid(gig.id)).sort())
    expect(gigIds).not.toContain(PAUSED_GIG_ID)
    res.body.gigs.forEach((gig) => {
      expect(gig.owner.id).toBe(toUuid(SELLER_ID))
      expect(gig).toHaveProperty('price')
      expect(gig).toHaveProperty('reviews')
    })
  })

  it('returns 404 for an unknown user', async () => {
    const unknownRes = await getProfile(randomUUID())
    expect(unknownRes.statusCode).toBe(404)
    expect(unknownRes.body).toEqual({ error: 'User not found' })

    // Not a UUID at all (e.g. a demo id) is a 404 too, not a server error
    const notUuidRes = await getProfile('u101')
    expect(notUuidRes.statusCode).toBe(404)
  })
})
