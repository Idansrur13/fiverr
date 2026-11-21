import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { AppHeader } from './AppHeader'
import { store } from '../store/store'

function renderHeaderAt(path) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <AppHeader />
      </MemoryRouter>
    </Provider>,
  )
}

describe('AppHeader', () => {
  it('hides the search bar on the home page', () => {
    renderHeaderAt('/')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
  })

  it('shows the search bar on /explore', () => {
    renderHeaderAt('/explore')
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('links to the orders page and the seller dashboard', () => {
    renderHeaderAt('/')
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/orders')
    expect(screen.getByRole('link', { name: 'Freelance on Fiverr' })).toHaveAttribute(
      'href',
      '/seller/dashboard',
    )
  })
})
