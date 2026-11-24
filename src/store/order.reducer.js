export const SET_ORDERS = 'SET_ORDERS'
export const SET_BUYER_ORDERS = 'SET_BUYER_ORDERS'
export const ADD_ORDER = 'ADD_ORDER'
export const UPDATE_ORDER = 'UPDATE_ORDER'

const initialState = {
  orders: [],
  buyerOrders: [],
}

export function orderReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_ORDERS:
      return { ...state, orders: action.orders }
    case SET_BUYER_ORDERS:
      return { ...state, buyerOrders: action.buyerOrders }
    case ADD_ORDER:
      return {
        ...state,
        orders: [action.order, ...state.orders],
        buyerOrders: [action.order, ...state.buyerOrders],
      }
    case UPDATE_ORDER: {
      const orderExists = state.orders.some((order) => order.id === action.order.id)
      return {
        ...state,
        orders: orderExists
          ? state.orders.map((order) => (order.id === action.order.id ? action.order : order))
          : [action.order, ...state.orders],
        buyerOrders: state.buyerOrders.map((order) =>
          order.id === action.order.id ? action.order : order,
        ),
      }
    }
    default:
      return state
  }
}
