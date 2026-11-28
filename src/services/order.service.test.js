import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpService } from './http.service'
import { getNextStatuses, isValidStatusTransition, orderService } from './order.service'

describe('orderService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the shared legal order status transitions', () => {
    expect(getNextStatuses('PENDING')).toEqual(['IN_PROGRESS', 'CANCELLED'])
    expect(getNextStatuses('IN_PROGRESS')).toEqual(['DELIVERED'])
    expect(getNextStatuses('DELIVERED')).toEqual(['COMPLETED'])
    expect(getNextStatuses('COMPLETED')).toEqual([])
    expect(getNextStatuses('CANCELLED')).toEqual([])
    expect(isValidStatusTransition('PENDING', 'IN_PROGRESS')).toBe(true)
    expect(isValidStatusTransition('PENDING', 'COMPLETED')).toBe(false)
  })

  it('queries the API using the buyer role by default', async () => {
    const orders = [{ id: 'order-1' }]
    const getSpy = vi.spyOn(httpService, 'get').mockResolvedValue(orders)

    await expect(orderService.query({ buyerId: 'buyer-1', status: 'PENDING' })).resolves.toEqual(
      orders,
    )
    expect(getSpy).toHaveBeenCalledWith('orders', { role: 'buyer', status: 'PENDING' })
  })

  it('queries the API using the seller role', async () => {
    const getSpy = vi.spyOn(httpService, 'get').mockResolvedValue([])

    await orderService.query({ sellerId: 'seller-1' })

    expect(getSpy).toHaveBeenCalledWith('orders', { role: 'seller' })
  })

  it('creates an API order with only the gig and selected package ids', async () => {
    const order = { id: 'order-1' }
    const postSpy = vi.spyOn(httpService, 'post').mockResolvedValue(order)
    const gig = { id: 'gig-1', price: 999 }
    const pkg = { id: 'package-1', price: 500 }

    await expect(orderService.add({ gig, buyer: { id: 'buyer-1' }, pkg })).resolves.toEqual(order)

    expect(postSpy).toHaveBeenCalledWith('orders', { gigId: 'gig-1', packageId: 'package-1' })
  })

  it('gets an order by id from the API', async () => {
    const order = { id: 'order-1' }
    const getSpy = vi.spyOn(httpService, 'get').mockResolvedValue(order)

    await expect(orderService.getById('order-1')).resolves.toEqual(order)
    expect(getSpy).toHaveBeenCalledWith('orders/order-1')
  })

  it('patches an order status through the API', async () => {
    const order = { id: 'order-1', status: 'DELIVERED' }
    const patchSpy = vi.spyOn(httpService, 'patch').mockResolvedValue(order)

    await expect(orderService.updateStatus('order-1', 'DELIVERED')).resolves.toEqual(order)
    expect(patchSpy).toHaveBeenCalledWith('orders/order-1/status', { status: 'DELIVERED' })
  })

  it('normalizes authentication and network failures', async () => {
    vi.spyOn(httpService, 'get').mockRejectedValueOnce({
      response: { status: 401, data: { error: 'Missing access token' } },
    })
    await expect(orderService.query()).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing access token',
    })

    vi.spyOn(httpService, 'get').mockRejectedValueOnce(new Error('Network unavailable'))
    await expect(orderService.getById('order-1')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the orders service',
    })
  })
})
