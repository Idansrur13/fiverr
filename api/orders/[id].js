import { requireAppUser } from '../_lib/auth.js'
import { createHandler, HttpError } from '../_lib/http.js'
import { ORDER_INCLUDE, toOrderResponse } from '../_lib/order-response.js'
import { prisma } from '../_lib/prisma.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default createHandler({
  async GET(req, res) {
    const user = await requireAppUser(req)
    const orderId = getOrderId(req.query.id)
    if (!isUuid(orderId)) throw new HttpError(400, 'Invalid order id')

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE,
    })
    if (!order) throw new HttpError(404, 'Order not found')
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      throw new HttpError(403, 'You are not allowed to view this order')
    }

    return res.status(200).json(toOrderResponse(order))
  },
})

function getOrderId(value) {
  return Array.isArray(value) ? value[0] : value
}

function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}
