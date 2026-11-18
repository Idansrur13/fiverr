import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import { RootCmp } from './RootCmp'
import { store } from './store/store'
import './assets/styles/main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <RootCmp />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
