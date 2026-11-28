import { describe, it, expect } from 'vitest'
import {
  orderReducer,
  SET_ORDERS,
  SET_BUYER_ORDERS,
  ADD_ORDER,
  UPDATE_ORDER,
} from './order.reducer'

const orders = [
  { id: 'o1', status: 'PENDING' },
  { id: 'o2', status: 'IN_PROGRESS' },
]

const initialState = orderReducer(undefined, {})

describe('orderReducer', () => {
  it('starts with empty orders and buyer orders', () => {
    expect(initialState).toEqual({ orders: [], buyerOrders: [] })
  })

  it('SET_ORDERS replaces the orders', () => {
    const state = orderReducer(
      { ...initialState, orders: [{ id: 'old' }] },
      { type: SET_ORDERS, orders },
    )
    expect(state.orders).toEqual(orders)
  })

  it('SET_BUYER_ORDERS replaces the buyer orders and keeps the orders', () => {
    const state = orderReducer(
      { orders, buyerOrders: [{ id: 'old' }] },
      { type: SET_BUYER_ORDERS, buyerOrders: [orders[1]] },
    )
    expect(state.buyerOrders).toEqual([orders[1]])
    expect(state.orders).toEqual(orders)
  })

  it('ADD_ORDER adds the order to the start of the list', () => {
    const order = { id: 'o3', status: 'PENDING' }
    const state = orderReducer({ ...initialState, orders }, { type: ADD_ORDER, order })
    expect(state.orders.map((order) => order.id)).toEqual(['o3', 'o1', 'o2'])
  })

  it('UPDATE_ORDER replaces the matching order', () => {
    const state = orderReducer(
      { ...initialState, orders },
      { type: UPDATE_ORDER, order: { id: 'o1', status: 'DELIVERED' } },
    )
    expect(state.orders).toEqual([
      { id: 'o1', status: 'DELIVERED' },
      { id: 'o2', status: 'IN_PROGRESS' },
    ])
  })

  it('ADD_ORDER and UPDATE_ORDER also change the buyer orders', () => {
    let state = orderReducer(
      { orders: [], buyerOrders: orders },
      { type: ADD_ORDER, order: { id: 'o3', status: 'PENDING' } },
    )
    expect(state.buyerOrders.map((order) => order.id)).toEqual(['o3', 'o1', 'o2'])

    state = orderReducer(state, { type: UPDATE_ORDER, order: { id: 'o2', status: 'DELIVERED' } })
    expect(state.buyerOrders[2]).toEqual({ id: 'o2', status: 'DELIVERED' })

    state = orderReducer(state, { type: UPDATE_ORDER, order: { id: 'o9', status: 'PENDING' } })
    expect(state.buyerOrders).toHaveLength(3)
  })
})
