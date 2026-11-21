import { describe, it, expect, beforeEach } from 'vitest'
import { calcOrderTotal, orderService } from './order.service'

const gig = {
  id: 'g1',
  title: 'I will design a modern minimalist logo',
  price: 50,
  daysToMake: 2,
  images: ['logo-1.jpg', 'logo-2.jpg', 'logo-3.jpg'],
  owner: { id: 'seller1', fullname: 'Maya Cohen', imgUrl: 'maya.jpg' },
}

const buyer = { id: 'buyer1', fullname: 'Liam Brooks', imgUrl: 'liam.jpg' }

const storedOrders = [
  { id: 'o1', buyer: { id: 'buyer1' }, seller: { id: 'seller1' }, status: 'PENDING', createdAt: 1 },
  {
    id: 'o2',
    buyer: { id: 'buyer2' },
    seller: { id: 'seller1' },
    status: 'COMPLETED',
    createdAt: 2,
  },
  {
    id: 'o3',
    buyer: { id: 'buyer1' },
    seller: { id: 'seller2' },
    status: 'COMPLETED',
    createdAt: 3,
  },
  { id: 'o4', buyer: { id: 'buyer3' }, seller: { id: 'seller2' }, status: 'PENDING', createdAt: 4 },
]

function ids(orders) {
  return orders.map((order) => order.id).sort()
}

describe('orderService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('calcOrderTotal adds a 5.5% service fee', () => {
    expect(calcOrderTotal(100)).toEqual({ price: 100, serviceFee: 5.5, total: 105.5 })
  })

  it('calcOrderTotal rounds to 2 decimal places', () => {
    expect(calcOrderTotal(19.99)).toEqual({ price: 19.99, serviceFee: 1.1, total: 21.09 })
  })

  it('add creates an order with status PENDING and the gig price', async () => {
    const order = await orderService.add({ gig, buyer })
    expect(order.id).toBeTruthy()
    expect(order).toMatchObject({
      status: 'PENDING',
      price: 50,
      serviceFee: 2.75,
      total: 52.75,
      buyer: { id: 'buyer1' },
      seller: { id: 'seller1' },
      gig: { id: 'g1', title: gig.title, imgUrl: 'logo-1.jpg' },
    })
    expect(await orderService.query()).toHaveLength(1)
  })

  it('add saves the selected package and uses its price and delivery time', async () => {
    const pkg = { id: 'p2', tier: 'STANDARD', title: 'Standard', price: 90, daysToMake: 4 }
    const order = await orderService.add({ gig, buyer, pkg })

    expect(order).toMatchObject({
      price: 90,
      serviceFee: 4.95,
      total: 94.95,
      package: { id: 'p2', tier: 'STANDARD', title: 'Standard' },
    })
    expect(order.dueAt - order.createdAt).toBe(4 * 24 * 60 * 60 * 1000)
  })

  it('add without a package uses the gig price and delivery time', async () => {
    const order = await orderService.add({ gig, buyer })

    expect(order.package).toBeNull()
    expect(order.dueAt - order.createdAt).toBe(2 * 24 * 60 * 60 * 1000)
  })

  it('query returns only the orders of the given buyer', async () => {
    localStorage.setItem('orderDB', JSON.stringify(storedOrders))
    const orders = await orderService.query({ buyerId: 'buyer1' })
    expect(ids(orders)).toEqual(['o1', 'o3'])
  })

  it('query filters orders by status', async () => {
    localStorage.setItem('orderDB', JSON.stringify(storedOrders))
    const orders = await orderService.query({ status: 'COMPLETED' })
    expect(ids(orders)).toEqual(['o2', 'o3'])
  })
})
