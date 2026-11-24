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

  it('shows the orders button and links to the seller dashboard', () => {
    renderHeaderAt('/')
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Freelance on Fiverr' })).toHaveAttribute(
      'href',
      '/seller/dashboard',
    )
  })
})
