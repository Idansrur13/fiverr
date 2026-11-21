import { orderService } from '../services/order.service'
import { store } from './store'
import { ADD_ORDER, SET_ORDERS } from './order.reducer'

export async function loadOrders(filterBy) {
  const orders = await orderService.query(filterBy)
  store.dispatch({ type: SET_ORDERS, orders })
  return orders
}

export async function addOrder({ gig, buyer, pkg, packageId, serviceFee, total }) {
  const order = await orderService.add({ gig, buyer, pkg, packageId, serviceFee, total })
  store.dispatch({ type: ADD_ORDER, order })
  return order
}
