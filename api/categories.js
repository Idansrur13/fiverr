import { createHandler } from './_lib/http.js'
import { prisma } from './_lib/prisma.js'

export default createHandler({
  async GET(_req, res) {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: 'asc' },
    })
    return res.status(200).json(categories)
  },
})
