import { describe, it, expect, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { WishlistButton } from './WishlistButton'
import { GigPreview } from './GigPreview'
import { store } from '../store/store'
import { SET_WISHLIST } from '../store/wishlist.reducer'
import { LOGOUT, SET_USER } from '../store/user.reducer'
import demoGigs from '../data/gigs.json'

const gig = demoGigs.find((demoGig) => demoGig.id === 'g101')
const loggedinUser = { id: 'auth-1', email: 'maya@test.com', fullname: 'Maya Cohen', imgUrl: '' }

function renderWithStore(ui) {
  return render(<Provider store={store}>{ui}</Provider>)
}

describe('WishlistButton', () => {
  beforeEach(() => {
    localStorage.clear()
    act(() => {
      store.dispatch({ type: SET_USER, user: loggedinUser })
      store.dispatch({ type: SET_WISHLIST, gigIds: [] })
    })
  })

  it('toggles the saved state on click', async () => {
    renderWithStore(<WishlistButton gigId={gig.id} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save to wishlist' }))
    const savedButton = await screen.findByRole('button', { name: 'Remove from wishlist' })
    expect(savedButton).toHaveAttribute('aria-pressed', 'true')
    expect(JSON.parse(localStorage.getItem(`wishlist_${loggedinUser.id}`))).toEqual([gig.id])

    await userEvent.click(savedButton)
    const unsavedButton = await screen.findByRole('button', { name: 'Save to wishlist' })
    expect(unsavedButton).toHaveAttribute('aria-pressed', 'false')
    expect(JSON.parse(localStorage.getItem(`wishlist_${loggedinUser.id}`))).toEqual([])
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
    act(() => {
      store.dispatch({ type: LOGOUT })
    })
    renderWithStore(<WishlistButton gigId={gig.id} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save to wishlist' }))

    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save to wishlist' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(store.getState().wishlistModule.gigIds).toEqual([])
    expect(localStorage.length).toBe(0)
  })
})
