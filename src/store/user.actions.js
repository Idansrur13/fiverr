import { userService } from '../services/user.service'
import { store } from './store'
import { LOGOUT, SET_USER } from './user.reducer'

export async function login(credentials) {
  const user = await userService.login(credentials)
  store.dispatch({ type: SET_USER, user })
  return user
}

export async function signup(credentials) {
  const user = await userService.signup(credentials)
  store.dispatch({ type: SET_USER, user })
  return user
}

export async function logout() {
  await userService.logout()
  store.dispatch({ type: LOGOUT })
}

export async function loadLoggedinUser() {
  try {
    const user = await userService.getSessionUser()
    store.dispatch({ type: SET_USER, user })
  } catch {
    store.dispatch({ type: LOGOUT })
  }
}

export function listenToAuthChanges() {
  return userService.onAuthChange((user) => store.dispatch({ type: SET_USER, user }))
}
