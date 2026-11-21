export const SET_ORDERS = 'SET_ORDERS'
export const ADD_ORDER = 'ADD_ORDER'
export const UPDATE_ORDER = 'UPDATE_ORDER'

const initialState = {
  orders: [],
}

export function orderReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_ORDERS:
      return { ...state, orders: action.orders }
    case ADD_ORDER:
      return { ...state, orders: [action.order, ...state.orders] }
    case UPDATE_ORDER: {
      const orderExists = state.orders.some((order) => order.id === action.order.id)
      return {
        ...state,
        orders: orderExists
          ? state.orders.map((order) => (order.id === action.order.id ? action.order : order))
          : [action.order, ...state.orders],
      }
    }
    default:
      return state
  }
}
