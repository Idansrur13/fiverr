import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GigEditPage } from './GigEditPage'
import { gigService } from '../services/gig.service'
import { store } from '../store/store'

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/seller/gigs/new']}>
      <Routes>
        <Route path="/seller/gigs/new" element={<GigEditPage />} />
        <Route path="/explore" element={<h1>Explore</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GigEditPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves the new gig and navigates to /explore', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Gig title'), 'I will design your logo')
    await user.type(screen.getByLabelText('Price ($)'), '25')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('heading', { name: 'Explore' })).toBeInTheDocument()

    const { images, category, daysToMake, owner } = gigService.getEmptyGig()
    const savedGig = (await gigService.query()).find(
      (gig) => gig.title === 'I will design your logo',
    )
    expect(savedGig).toMatchObject({ price: 25, images, category, daysToMake, owner })
    expect(savedGig.id).toBeTruthy()
    expect(store.getState().gigModule.gigs).toContainEqual(savedGig)
  })
})
