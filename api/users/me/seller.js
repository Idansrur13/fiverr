import { createHandler } from '../../_lib/http.js'
import { prisma } from '../../_lib/prisma.js'
import { ME_SELECT, requireAppUser } from '../../_lib/auth.js'

export default createHandler({
  async POST(req, res) {
    const appUser = await requireAppUser(req)
    const user = await prisma.user.update({
      where: { id: appUser.id },
      data: { isSeller: true },
      select: ME_SELECT,
    })
    return res.status(200).json(user)
  },
})
