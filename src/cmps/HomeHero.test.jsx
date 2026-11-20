import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { HomeHero } from './HomeHero'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

function renderHero() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeHero />} />
          <Route path="/explore" element={<h1>Explore page</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

function getFilterBy() {
  return store.getState().gigModule.filterBy
}

describe('HomeHero', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('renders the hero search input', () => {
    renderHero()
    expect(screen.getByRole('searchbox', { name: 'Search services' })).toBeInTheDocument()
  })

  it('navigates to /explore with the search text on submit', async () => {
    const user = userEvent.setup()
    renderHero()

    await user.type(screen.getByRole('searchbox'), 'logo{Enter}')

    expect(getFilterBy().txt).toBe('logo')
    expect(screen.getByRole('heading', { name: 'Explore page' })).toBeInTheDocument()
  })

  it('searches by the tag text when a tag is clicked', async () => {
    const user = userEvent.setup()
    setFilterBy({ category: 'music-audio' })
    renderHero()

    await user.click(screen.getByRole('button', { name: 'logo design' }))

    expect(getFilterBy().txt).toBe('logo design')
    expect(getFilterBy().category).toBe('')
    expect(screen.getByRole('heading', { name: 'Explore page' })).toBeInTheDocument()
  })
})
