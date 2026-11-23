import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { WishlistButton } from './WishlistButton'
import { GigPreview } from './GigPreview'
import { store } from '../store/store'
import { SET_WISHLIST } from '../store/wishlist.reducer'
import { userService } from '../services/user.service'
import demoGigs from '../data/gigs.json'

const gig = demoGigs.find((demoGig) => demoGig.id === 'g101')
const userId = userService.getLoggedinUser().id

function renderWithStore(ui) {
  return render(<Provider store={store}>{ui}</Provider>)
}

describe('WishlistButton', () => {
  beforeEach(() => {
    localStorage.clear()
    store.dispatch({ type: SET_WISHLIST, gigIds: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('toggles the saved state on click', async () => {
    renderWithStore(<WishlistButton gigId={gig.id} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save to wishlist' }))
    const savedButton = await screen.findByRole('button', { name: 'Remove from wishlist' })
    expect(savedButton).toHaveAttribute('aria-pressed', 'true')
    expect(JSON.parse(localStorage.getItem(`wishlist_${userId}`))).toEqual([gig.id])

    await userEvent.click(savedButton)
    const unsavedButton = await screen.findByRole('button', { name: 'Save to wishlist' })
    expect(unsavedButton).toHaveAttribute('aria-pressed', 'false')
    expect(JSON.parse(localStorage.getItem(`wishlist_${userId}`))).toEqual([])
  })

  it('does not navigate when clicked inside a preview', async () => {
    renderWithStore(
      <MemoryRouter initialEntries={['/explore']}>
        <Routes>
          <Route path="/explore" element={<GigPreview gig={gig} />} />
          <Route path="/gig/:gigId" element={<h1>Gig page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    const heart = screen.getByRole('button', { name: 'Save to wishlist' })
    expect(heart.closest('a')).toBeNull()
    await userEvent.click(heart)

    expect(await screen.findByRole('button', { name: 'Remove from wishlist' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Gig page' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: gig.title })).toBeInTheDocument()
  })

  it('opens the login modal for a logged out user', async () => {
    vi.spyOn(userService, 'getLoggedinUser').mockReturnValue(null)
    const { container } = renderWithStore(<WishlistButton gigId={gig.id} />)
    expect(container.querySelector('.login-modal')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Save to wishlist' }))

    expect(container.querySelector('.login-modal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save to wishlist' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(store.getState().wishlistModule.gigIds).toEqual([])
    expect(localStorage.length).toBe(0)
  })
})
