import { combineReducers, legacy_createStore as createStore } from 'redux'
import { gigReducer } from './gig.reducer'
import { orderReducer } from './order.reducer'
import { userReducer } from './user.reducer'
import { wishlistReducer } from './wishlist.reducer'

const rootReducer = combineReducers({
  gigModule: gigReducer,
  orderModule: orderReducer,
  userModule: userReducer,
  wishlistModule: wishlistReducer,
})

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.()

export const store = createStore(rootReducer, devTools)
