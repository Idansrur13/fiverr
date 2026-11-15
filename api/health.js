import { createHandler } from './_lib/http.js'
import { prisma } from './_lib/prisma.js'

export default createHandler({
  async GET(_req, res) {
    await prisma.$queryRaw`SELECT 1`
    return res.status(200).json({ status: 'ok' })
  },
})
