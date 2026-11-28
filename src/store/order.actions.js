import { orderService } from '../services/order.service'
import { store } from './store'
import { ADD_ORDER, SET_BUYER_ORDERS, SET_ORDERS, UPDATE_ORDER } from './order.reducer'

export async function loadOrders(filterBy, shouldDispatch = () => true) {
  const orders = await orderService.query(filterBy)
  if (shouldDispatch()) store.dispatch({ type: SET_ORDERS, orders })
  return orders
}

export async function addOrder({ gig, buyer, pkg }) {
  const order = await orderService.add({ gig, buyer, pkg })
  store.dispatch({ type: ADD_ORDER, order })
  return order
}

export async function updateOrderStatus(orderId, status) {
  const order = await orderService.updateStatus(orderId, status)
  store.dispatch({ type: UPDATE_ORDER, order })
  return order
}

export async function loadBuyerOrders(buyerId) {
  const buyerOrders = await orderService.query({ buyerId })
  store.dispatch({ type: SET_BUYER_ORDERS, buyerOrders })
  return buyerOrders
}
