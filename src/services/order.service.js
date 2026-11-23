import { storageService } from './storage.service'
import { calcOrderTotal } from './pricing.service'

const STORAGE_KEY = 'orderDB'
const DAY = 24 * 60 * 60 * 1000

export const orderService = {
  query,
  add,
}

async function query({ buyerId, sellerId, status } = {}) {
  const orders = await storageService.query(STORAGE_KEY)
  return orders
    .filter(
      (order) =>
        (!buyerId || (order.buyer?.id || order.buyerId) === buyerId) &&
        (!sellerId || (order.sellerId || order.seller?.id) === sellerId) &&
        (!status || order.status === status),
    )
    .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))
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

function getTimestamp(value) {
  const timestamp = typeof value === 'number' ? value : Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}
