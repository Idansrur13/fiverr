import { describe, it, expect } from 'vitest'
import { orderReducer, SET_ORDERS, ADD_ORDER, UPDATE_ORDER } from './order.reducer'

const orders = [
  { id: 'o1', status: 'PENDING' },
  { id: 'o2', status: 'IN_PROGRESS' },
]

describe('orderReducer', () => {
  it('SET_ORDERS replaces the orders', () => {
    const state = orderReducer({ orders: [{ id: 'old' }] }, { type: SET_ORDERS, orders })
    expect(state.orders).toEqual(orders)
  })

  it('ADD_ORDER adds the order to the start of the list', () => {
    const order = { id: 'o3', status: 'PENDING' }
    const state = orderReducer({ orders }, { type: ADD_ORDER, order })
    expect(state.orders.map((order) => order.id)).toEqual(['o3', 'o1', 'o2'])
  })

  it('UPDATE_ORDER replaces the matching order', () => {
    const state = orderReducer(
      { orders },
      { type: UPDATE_ORDER, order: { id: 'o1', status: 'DELIVERED' } },
    )
    expect(state.orders).toEqual([
      { id: 'o1', status: 'DELIVERED' },
      { id: 'o2', status: 'IN_PROGRESS' },
    ])
  })
})
