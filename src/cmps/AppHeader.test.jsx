import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
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

function scrollWindowTo(y) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('AppHeader', () => {
  afterEach(() => {
    scrollWindowTo(0)
  })

  it('is transparent at the top of the home page', () => {
    renderHeaderAt('/')
    expect(screen.getByRole('banner')).toHaveClass('home-header', 'transparent')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Categories' })).not.toBeInTheDocument()
  })

  it('becomes solid after scrolling on the home page', () => {
    renderHeaderAt('/')

    scrollWindowTo(200)
    expect(screen.getByRole('banner')).not.toHaveClass('transparent')
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Categories' })).toBeInTheDocument()

    scrollWindowTo(0)
    expect(screen.getByRole('banner')).toHaveClass('transparent')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
  })

  it('is always solid on other pages', () => {
    renderHeaderAt('/explore')
    const header = screen.getByRole('banner')
    expect(header).not.toHaveClass('transparent')
    expect(header).not.toHaveClass('home-header')
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

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
