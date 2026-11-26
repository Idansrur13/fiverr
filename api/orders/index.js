import { requireAppUser } from '../_lib/auth.js'
import { createHandler, HttpError } from '../_lib/http.js'
import { ORDER_INCLUDE, toOrderResponse } from '../_lib/order-response.js'
import { prisma } from '../_lib/prisma.js'
import { ORDER_STATUSES } from '../../shared/order-status.js'
import { calcOrderTotal } from '../../shared/pricing.service.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default createHandler({
  async POST(req, res) {
    const user = await requireAppUser(req)
    const { gigId, packageId } = req.body ?? {}
    if (!isUuid(gigId) || !isUuid(packageId)) {
      throw new HttpError(400, 'gigId and packageId must be valid UUIDs')
    }

    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { id: true, ownerId: true, status: true },
    })
    if (!gig || gig.status !== 'ACTIVE') throw new HttpError(404, 'Gig not found')
    if (gig.ownerId === user.id) throw new HttpError(400, 'You cannot order your own gig')

    const pkg = await prisma.package.findFirst({
      where: { id: packageId, gigId },
      select: { id: true, price: true, daysToMake: true },
    })
    if (!pkg) throw new HttpError(404, 'Package not found')

    const price = Number(pkg.price)
    const totals = calcOrderTotal(price)
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        sellerId: gig.ownerId,
        gigId,
        packageId: pkg.id,
        ...totals,
        status: 'PENDING',
        dueAt: new Date(Date.now() + pkg.daysToMake * 24 * 60 * 60 * 1000),
      },
      include: ORDER_INCLUDE,
    })

    return res.status(201).json(toOrderResponse(order))
  },

  async GET(req, res) {
    const user = await requireAppUser(req)
    const role = getSingleQueryValue(req.query.role) || 'buyer'
    const status = getSingleQueryValue(req.query.status)
    if (!['buyer', 'seller'].includes(role)) throw new HttpError(400, 'Invalid order role')
    if (status && !ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Invalid order status')

    const where = {
      [role === 'buyer' ? 'buyerId' : 'sellerId']: user.id,
      ...(status ? { status } : {}),
    }
    const orders = await prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(orders.map(toOrderResponse))
  },
})

function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

function getSingleQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}
