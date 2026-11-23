import { createHandler } from '../_lib/http.js'
import { prisma } from '../_lib/prisma.js'
import { buildGigWhere } from '../_lib/gig-filter.js'

export default createHandler({
  async GET(req, res) {
    const gigs = await prisma.gig.findMany({
      where: { ...buildGigWhere(req.query), status: 'ACTIVE' },
      include: {
        owner: { select: { id: true, fullname: true, imgUrl: true, level: true } },
        category: { select: { slug: true } },
        packages: { where: { tier: 'BASIC' }, select: { price: true, daysToMake: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(gigs.map(toGigPreview))
  },
})

// The same shape GigPreview already uses with the demo data, so the frontend doesn't change
function toGigPreview(gig) {
  const [basicPackage] = gig.packages
  return {
    id: gig.id,
    title: gig.title,
    images: gig.images,
    category: gig.category.slug,
    price: basicPackage ? Number(basicPackage.price) : null,
    daysToMake: basicPackage ? basicPackage.daysToMake : null,
    owner: gig.owner,
    reviews: gig.reviews,
  }
}
