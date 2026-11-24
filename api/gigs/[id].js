import { createHandler, HttpError } from '../_lib/http.js'
import { getBearerToken, requireUser } from '../_lib/auth.js'
import { prisma } from '../_lib/prisma.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
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
const GIG_DETAILS_INCLUDE = {
  owner: { select: PUBLIC_USER_SELECT },
  category: { select: { id: true, name: true, slug: true } },
  packages: {
    select: {
      id: true,
      tier: true,
      title: true,
      description: true,
      price: true,
      daysToMake: true,
      revisions: true,
      features: true,
    },
  },
  reviews: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      text: true,
      createdAt: true,
      reviewer: {
        select: {
          id: true,
          fullname: true,
          imgUrl: true,
          country: true,
        },
      },
    },
  },
}
const PACKAGE_TIER_ORDER = { BASIC: 0, STANDARD: 1, PREMIUM: 2 }

export default createHandler({
  async GET(req, res) {
    const gigId = String(req.query.id ?? '')
    if (!UUID_REGEX.test(gigId)) throw new HttpError(400, 'Invalid gig id')

    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: GIG_DETAILS_INCLUDE,
    })
    if (!gig) throw new HttpError(404, 'Gig not found')

    if (gig.status !== 'ACTIVE') {
      if (!getBearerToken(req)) throw new HttpError(404, 'Gig not found')

      let user
      try {
        user = await requireUser(req)
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          throw new HttpError(404, 'Gig not found')
        }
        throw error
      }

      if (user.id !== gig.ownerId) throw new HttpError(404, 'Gig not found')
    }

    const packages = [...gig.packages]
      .sort((first, second) => PACKAGE_TIER_ORDER[first.tier] - PACKAGE_TIER_ORDER[second.tier])
      .map((pkg) => ({ ...pkg, price: Number(pkg.price) }))
    const reviewsCount = gig.reviews.length
    const rating = reviewsCount
      ? gig.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
      : null
    const basicPackage = packages.find((pkg) => pkg.tier === 'BASIC')

    return res.status(200).json({
      id: gig.id,
      title: gig.title,
      description: gig.description,
      images: gig.images,
      tags: gig.tags,
      status: gig.status,
      createdAt: gig.createdAt,
      updatedAt: gig.updatedAt,
      category: gig.category.slug,
      owner: gig.owner,
      packages,
      reviews: gig.reviews,
      price: basicPackage ? Number(basicPackage.price) : null,
      daysToMake: basicPackage?.daysToMake ?? null,
      rating,
      reviewsCount,
    })
  },
})
