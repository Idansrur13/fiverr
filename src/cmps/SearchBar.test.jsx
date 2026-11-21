import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SearchBar } from './SearchBar'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

function renderSearchBar() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/gig/g101']}>
        <Routes>
          <Route path="/gig/:gigId" element={<SearchBar />} />
          <Route path="/explore" element={<h1>Explore page</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

function getFilterBy() {
  return store.getState().gigModule.filterBy
}

describe('SearchBar', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('renders a search input and a search button', () => {
    renderSearchBar()
    expect(screen.getByRole('searchbox', { name: 'Search services' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('updates filterBy.txt and navigates to /explore on submit', async () => {
    const user = userEvent.setup()
    renderSearchBar()

    await user.type(screen.getByRole('searchbox'), 'logo')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(getFilterBy().txt).toBe('logo')
    expect(screen.getByRole('heading', { name: 'Explore page' })).toBeInTheDocument()
  })

  it('submits on Enter key', async () => {
    const user = userEvent.setup()
    renderSearchBar()

    await user.type(screen.getByRole('searchbox'), 'video editing{Enter}')

    expect(getFilterBy().txt).toBe('video editing')
    expect(screen.getByRole('heading', { name: 'Explore page' })).toBeInTheDocument()
  })

  it('navigates without a txt filter when the input is empty', async () => {
    const user = userEvent.setup()
    setFilterBy({ txt: 'old search' })
    renderSearchBar()

    await user.clear(screen.getByRole('searchbox'))
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(getFilterBy().txt).toBe('')
    expect(screen.getByRole('heading', { name: 'Explore page' })).toBeInTheDocument()
  })
})
