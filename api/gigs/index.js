import { createHandler } from '../_lib/http.js'
import { prisma } from '../_lib/prisma.js'
import { buildGigWhere, findGigIdsPage, getGigPaging } from '../_lib/gig-filter.js'

export default createHandler({
  async GET(req, res) {
    const where = { ...buildGigWhere(req.query), status: 'ACTIVE' }
    const { ids, total, page, pageCount } = await findGigIdsPage(
      prisma,
      where,
      getGigPaging(req.query),
    )

    const gigs = await prisma.gig.findMany({
      where: { id: { in: ids } },
      include: {
        owner: { select: { id: true, fullname: true, imgUrl: true, level: true } },
        category: { select: { slug: true } },
        packages: { where: { tier: 'BASIC' }, select: { price: true, daysToMake: true } },
        reviews: { select: { rating: true } },
      },
    })
    // findMany doesn't keep the order of `ids`, so put the gigs back in the sorted order
    const gigsById = new Map(gigs.map((gig) => [gig.id, gig]))
    const sortedGigs = ids.map((id) => gigsById.get(id)).filter(Boolean)

    return res.status(200).json({ gigs: sortedGigs.map(toGigPreview), total, page, pageCount })
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
