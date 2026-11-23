import { createHandler, HttpError } from '../_lib/http.js'
import { prisma } from '../_lib/prisma.js'
import { GIG_PREVIEW_INCLUDE, toGigPreview } from '../_lib/gig-preview.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Only what a public profile shows. No username, isSeller, updatedAt or orders.
const PUBLIC_USER_SELECT = {
  id: true,
  fullname: true,
  imgUrl: true,
  level: true,
  about: true,
  country: true,
  languages: true,
  createdAt: true,
}

// GET /api/users/[id] – a seller's public profile and their ACTIVE gigs
export default createHandler({
  async GET(req, res) {
    const userId = String(req.query.id ?? '')
    // Not a UUID can't be a user, and Prisma would throw on it (a 500 instead of a 404)
    if (!UUID_REGEX.test(userId)) throw new HttpError(404, 'User not found')

    const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT })
    if (!user) throw new HttpError(404, 'User not found')

    const [gigs, reviewStats] = await Promise.all([
      prisma.gig.findMany({
        where: { ownerId: userId, status: 'ACTIVE' },
        include: GIG_PREVIEW_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      // The rating covers every review the seller got, on all their gigs
      prisma.review.aggregate({
        where: { gig: { ownerId: userId } },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ])

    return res.status(200).json({
      ...user,
      rating: reviewStats._avg.rating,
      reviewsCount: reviewStats._count._all,
      gigs: gigs.map(toGigPreview),
    })
  },
})
