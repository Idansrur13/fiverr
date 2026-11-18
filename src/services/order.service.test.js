import { describe, it, expect, beforeEach } from 'vitest'
import { orderService } from './order.service'

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

  it('add creates an order with status PENDING and the gig price', async () => {
    const order = await orderService.add({ gig, buyer })
    expect(order.id).toBeTruthy()
    expect(order).toMatchObject({
      status: 'PENDING',
      price: 50,
      buyer: { id: 'buyer1' },
      seller: { id: 'seller1' },
      gig: { id: 'g1', title: gig.title, imgUrl: 'logo-1.jpg' },
    })
    expect(await orderService.query()).toHaveLength(1)
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
