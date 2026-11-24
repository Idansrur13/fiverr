import { combineReducers, legacy_createStore as createStore } from 'redux'
import { gigReducer } from './gig.reducer'
import { orderReducer } from './order.reducer'
import { userReducer } from './user.reducer'

const rootReducer = combineReducers({
  gigModule: gigReducer,
  orderModule: orderReducer,
  userModule: userReducer,
})

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.()

export const store = createStore(rootReducer, devTools)
