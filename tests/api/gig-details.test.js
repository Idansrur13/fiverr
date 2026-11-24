import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import gigDetailsHandler from '../../api/gigs/[id].js'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { loadDemoGigs, toUuid } from '../../prisma/seed-data.js'
import { clearSeededTables, createMockReq, createMockRes } from './helpers.js'

const demoGigs = loadDemoGigs()
const DEMO_GIG_ID = toUuid('g101')
const PAUSED_GIG_ID = toUuid('test-paused-gig-details')

async function getGig(id, headers = {}) {
  const res = createMockRes()
  await gigDetailsHandler(createMockReq({ query: { id }, headers }), res)
  return res
}

beforeAll(async () => {
  await clearSeededTables(prisma)
  await seed(prisma, demoGigs)

  const activeGig = await prisma.gig.findUnique({ where: { id: DEMO_GIG_ID } })
  await prisma.gig.create({
    data: {
      id: PAUSED_GIG_ID,
      ownerId: activeGig.ownerId,
      categoryId: activeGig.categoryId,
      title: 'Paused test gig',
      description: 'This gig is not public',
      images: [],
      status: 'PAUSED',
    },
  })
})

afterAll(async () => {
  await clearSeededTables(prisma)
  await prisma.$disconnect()
})

describe('GET /api/gigs/[id]', () => {
  it('returns the gig with owner, category, packages and reviews', async () => {
    const res = await getGig(DEMO_GIG_ID)
    const demoGig = demoGigs.find((gig) => gig.id === 'g101')

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      id: DEMO_GIG_ID,
      title: demoGig.title,
      description: demoGig.description,
      category: demoGig.category,
      owner: {
        id: toUuid(demoGig.owner.id),
        fullname: demoGig.owner.fullname,
        imgUrl: demoGig.owner.imgUrl,
        level: demoGig.owner.level,
      },
    })
    expect(res.body.packages).toHaveLength(3)
    expect(res.body.reviews).toHaveLength(demoGig.reviews.length)
    expect(res.body.reviews[0]).toMatchObject({
      rating: expect.any(Number),
      text: expect.any(String),
      reviewer: {
        id: expect.any(String),
        fullname: expect.any(String),
      },
    })
    expect(res.body.owner).not.toHaveProperty('username')
    expect(res.body.owner).not.toHaveProperty('isSeller')
    expect(res.body.reviews[0].reviewer).not.toHaveProperty('username')
    expect(res.body.reviews[0].reviewer).not.toHaveProperty('isSeller')
  })

  it('returns packages sorted from BASIC to PREMIUM', async () => {
    const res = await getGig(DEMO_GIG_ID)

    expect(res.statusCode).toBe(200)
    expect(res.body.packages.map((pkg) => pkg.tier)).toEqual(['BASIC', 'STANDARD', 'PREMIUM'])
  })

  it('returns the average rating and the reviews count', async () => {
    const res = await getGig(DEMO_GIG_ID)
    const demoGig = demoGigs.find((gig) => gig.id === 'g101')
    const average =
      demoGig.reviews.reduce((sum, review) => sum + review.rating, 0) / demoGig.reviews.length

    expect(res.statusCode).toBe(200)
    expect(res.body.rating).toBeCloseTo(average)
    expect(res.body.reviewsCount).toBe(demoGig.reviews.length)
  })

  it('returns 404 for an unknown id', async () => {
    const res = await getGig(toUuid('unknown-gig'))

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Gig not found' })
  })

  it('returns 400 for an invalid id', async () => {
    const res = await getGig('not-a-uuid')

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Invalid gig id' })
  })

  it('hides a paused gig from users who are not the owner', async () => {
    const res = await getGig(PAUSED_GIG_ID)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Gig not found' })
  })
})
