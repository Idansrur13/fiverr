import { storageService } from './storage.service'
import { calcOrderTotal } from './pricing.service'

const STORAGE_KEY = 'orderDB'
const DAY = 24 * 60 * 60 * 1000

export const orderService = {
  query,
  add,
  updateStatus,
}

const NEXT_STATUSES_BY_STATUS = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

export function getNextStatuses(status) {
  return NEXT_STATUSES_BY_STATUS[status] || []
}

async function query({ buyerId, sellerId, status } = {}) {
  const orders = await storageService.query(STORAGE_KEY)
  return orders
    .filter(
      (order) =>
        (!buyerId || order.buyer.id === buyerId) &&
        (!sellerId || order.seller.id === sellerId) &&
        (!status || order.status === status),
    )
    .sort((a, b) => b.createdAt - a.createdAt)
}

async function updateStatus(orderId, status) {
  const order = await storageService.get(STORAGE_KEY, orderId)
  if (!getNextStatuses(order.status).includes(status)) {
    throw new Error(`Cannot change order status from ${order.status} to ${status}`)
  }
  return storageService.put(STORAGE_KEY, { ...order, status })
}

function add({ gig, buyer, pkg = null }) {
  const createdAt = Date.now()
  const { price, daysToMake } = pkg || gig
  const order = {
    buyer: { id: buyer.id, fullname: buyer.fullname, imgUrl: buyer.imgUrl },
    seller: { id: gig.owner.id, fullname: gig.owner.fullname, imgUrl: gig.owner.imgUrl },
    gig: { id: gig.id, title: gig.title, imgUrl: gig.images[0] },
    package: pkg && { id: pkg.id, tier: pkg.tier, title: pkg.title },
    ...calcOrderTotal(price),
    status: 'PENDING',
    createdAt,
    dueAt: createdAt + daysToMake * DAY,
  }
  return storageService.post(STORAGE_KEY, order)
}
