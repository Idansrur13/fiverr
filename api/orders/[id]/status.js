import { requireAppUser } from '../../_lib/auth.js'
import { createHandler, HttpError } from '../../_lib/http.js'
import { ORDER_INCLUDE, toOrderResponse } from '../../_lib/order-response.js'
import { prisma } from '../../_lib/prisma.js'
import { isValidStatusTransition } from '../../../shared/order-status.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default createHandler({
  async PATCH(req, res) {
    const user = await requireAppUser(req)
    const orderId = getOrderId(req.query.id)
    if (!isUuid(orderId)) throw new HttpError(400, 'Invalid order id')

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new HttpError(404, 'Order not found')
    if (order.sellerId !== user.id) {
      throw new HttpError(403, 'Only the seller can update this order')
    }

    const nextStatus = req.body?.status
    if (!isValidStatusTransition(order.status, nextStatus)) {
      throw new HttpError(400, `Cannot change order status from ${order.status} to ${nextStatus}`)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        ...(nextStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
      include: ORDER_INCLUDE,
    })

    return res.status(200).json(toOrderResponse(updatedOrder))
  },
})

function getOrderId(value) {
  return Array.isArray(value) ? value[0] : value
}

function isUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value)
}
