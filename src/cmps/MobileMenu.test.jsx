import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { AppHeader } from './AppHeader'
import { store } from '../store/store'

function LocationStub() {
  const { pathname, search } = useLocation()
  return <h1>Page {pathname + search}</h1>
}

function renderHeader() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <AppHeader />
        <Routes>
          <Route path="*" element={<LocationStub />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

async function openMenu(user) {
  await user.click(screen.getByRole('button', { name: 'Open menu' }))
  return screen.getByRole('dialog', { name: 'Menu' })
}

describe('MobileMenu', () => {
  it('opens from the hamburger button', async () => {
    const user = userEvent.setup()
    renderHeader()
    const hamburger = screen.getByRole('button', { name: 'Open menu' })

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    const menu = await openMenu(user)

    expect(hamburger).toHaveAttribute('aria-expanded', 'true')
    expect(menu).toHaveTextContent('Sign in')
    expect(menu).toHaveTextContent('Join Fiverr')
    expect(menu).toHaveTextContent('Explore')
    expect(menu).toHaveTextContent('Programming & Tech')
    // The page behind the menu doesn't scroll, and scrolls again once it closes
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    expect(hamburger).toHaveFocus()
  })

  it('closes when a link is clicked', async () => {
    const user = userEvent.setup()
    renderHeader()
    const menu = await openMenu(user)

    await user.click(within(menu).getByRole('link', { name: 'Music & Audio' }))

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Page /explore?category=music-audio' }),
    ).toBeInTheDocument()
  })

  it('closes on outside click', async () => {
    const user = userEvent.setup()
    renderHeader()
    const menu = await openMenu(user)

    // A click inside the panel keeps it open
    await user.click(screen.getByRole('heading', { name: 'Categories' }))
    expect(menu).toBeInTheDocument()

    await user.click(screen.getByRole('heading', { name: 'Page /' }))
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
  })
})
