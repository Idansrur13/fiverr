import { getNextStatuses, isValidStatusTransition } from '../../shared/order-status'
import { calcOrderTotal } from '../../shared/pricing.service'
import { storageService } from './storage.service'
import { userService } from './user.service'

export { getNextStatuses, isValidStatusTransition }

const STORAGE_KEY = 'orderDB'

export const orderService = {
  query,
  add,
  getById,
  updateStatus,
}

async function query({ buyerId, sellerId, role, status } = {}) {
  const orders = await storageService.query(STORAGE_KEY)
  const resolvedRole = role || (sellerId ? 'seller' : 'buyer')
  if (!['buyer', 'seller'].includes(resolvedRole)) throw new Error('Invalid order role')
  const userId =
    (resolvedRole === 'seller' ? sellerId : buyerId) || userService.getLoggedinUser()?.id
  const filteredOrders = orders.filter(
    (order) =>
      (resolvedRole === 'seller'
        ? (order.sellerId || order.seller?.id) === userId
        : (order.buyerId || order.buyer?.id) === userId) &&
      (!status || order.status === status),
  )

  return filteredOrders.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))
}

async function add({ gig, buyer, pkg = null }) {
  const now = Date.now()
  const orderPrice = Number((pkg || gig).price)
  const totals = calcOrderTotal(orderPrice)
  const daysToMake = Number((pkg || gig).daysToMake)
  const order = {
    buyer,
    buyerId: buyer.id,
    seller: gig.owner,
    sellerId: gig.owner?.id,
    gig: {
      id: gig.id,
      title: gig.title,
      imgUrl: gig.images?.[0] || '',
    },
    gigId: gig.id,
    package: pkg,
    packageId: pkg?.id,
    ...totals,
    status: 'PENDING',
    createdAt: now,
    dueAt: now + daysToMake * 24 * 60 * 60 * 1000,
  }

  return storageService.post(STORAGE_KEY, order)
}

function getById(orderId) {
  return storageService.get(STORAGE_KEY, orderId)
}

async function updateStatus(orderId, status) {
  const order = await getById(orderId)
  if (!isValidStatusTransition(order.status, status)) {
    throw new Error(`Cannot change order status from ${order.status} to ${status}`)
  }

  return storageService.put(STORAGE_KEY, {
    ...order,
    status,
    ...(status === 'DELIVERED' ? { deliveredAt: Date.now() } : {}),
  })
}

function getTimestamp(value) {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}
