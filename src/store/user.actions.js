import { userService } from '../services/user.service'
import { store } from './store'
import { LOGOUT, SET_USER } from './user.reducer'
import { SET_BUYER_ORDERS } from './order.reducer'

export async function login(credentials) {
  const user = await userService.login(credentials)
  setUser(user)
  return user
}

export async function signup(credentials) {
  const user = await userService.signup(credentials)
  setUser(user)
  return user
}

export async function logout() {
  await userService.logout()
  store.dispatch({ type: LOGOUT })
  clearBuyerOrders()
}

export async function loadLoggedinUser() {
  try {
    setUser(await userService.getSessionUser())
  } catch {
    store.dispatch({ type: LOGOUT })
    clearBuyerOrders()
  }
}

export function listenToAuthChanges() {
  return userService.onAuthChange(setUser)
}

function setUser(user) {
  const prevUserId = store.getState().userModule.user?.id
  store.dispatch({ type: SET_USER, user })
  if (prevUserId !== user?.id) clearBuyerOrders()
}

function clearBuyerOrders() {
  store.dispatch({ type: SET_BUYER_ORDERS, buyerOrders: [] })
}
