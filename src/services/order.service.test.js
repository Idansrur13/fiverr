import { describe, it, expect, beforeEach } from 'vitest'
import { getNextStatuses, orderService } from './order.service'

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

  it('getNextStatuses allows approve and reject for PENDING', () => {
    expect(getNextStatuses('PENDING')).toEqual(['IN_PROGRESS', 'CANCELLED'])
  })

  it('getNextStatuses allows deliver for IN_PROGRESS', () => {
    expect(getNextStatuses('IN_PROGRESS')).toEqual(['DELIVERED'])
  })

  it('getNextStatuses allows complete for DELIVERED', () => {
    expect(getNextStatuses('DELIVERED')).toEqual(['COMPLETED'])
  })

  it('getNextStatuses returns nothing for COMPLETED and CANCELLED', () => {
    expect(getNextStatuses('COMPLETED')).toEqual([])
    expect(getNextStatuses('CANCELLED')).toEqual([])
  })

  it('updateStatus saves a valid transition', async () => {
    localStorage.setItem('orderDB', JSON.stringify(storedOrders))

    const updatedOrder = await orderService.updateStatus('o1', 'IN_PROGRESS')

    expect(updatedOrder.status).toBe('IN_PROGRESS')
    expect((await orderService.query()).find((order) => order.id === 'o1').status).toBe(
      'IN_PROGRESS',
    )
  })

  it('updateStatus rejects an invalid transition', async () => {
    localStorage.setItem('orderDB', JSON.stringify(storedOrders))

    await expect(orderService.updateStatus('o1', 'COMPLETED')).rejects.toThrow(
      'Cannot change order status from PENDING to COMPLETED',
    )
    expect((await orderService.query()).find((order) => order.id === 'o1').status).toBe('PENDING')
  })
})
