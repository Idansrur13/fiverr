import { createHandler } from '../_lib/http.js'
import { prisma } from '../_lib/prisma.js'
import { buildGigWhere, findGigIdsPage, getGigPaging } from '../_lib/gig-filter.js'
import { GIG_PREVIEW_INCLUDE, toGigPreview } from '../_lib/gig-preview.js'

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
      include: GIG_PREVIEW_INCLUDE,
    })
    // findMany doesn't keep the order of `ids`, so put the gigs back in the sorted order
    const gigsById = new Map(gigs.map((gig) => [gig.id, gig]))
    const sortedGigs = ids.map((id) => gigsById.get(id)).filter(Boolean)

    return res.status(200).json({ gigs: sortedGigs.map(toGigPreview), total, page, pageCount })
  },
})
