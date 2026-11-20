import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PopularServices } from './PopularServices'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

function renderServices() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<PopularServices />} />
          <Route path="/explore" element={<h1>Explore page</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('PopularServices', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('renders the popular services', () => {
    renderServices()

    expect(screen.getByRole('heading', { name: 'Popular services' })).toBeInTheDocument()
    ;['Website Development', 'Logo Design', 'Video Editing', 'Voice Over'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  it('navigates to /explore filtered by category on click', async () => {
    const user = userEvent.setup()
    setFilterBy({ txt: 'old search' })
    renderServices()

    await user.click(screen.getByRole('button', { name: 'Logo Design' }))

    const { filterBy } = store.getState().gigModule
    expect(filterBy.category).toBe('graphics-design')
    expect(filterBy.txt).toBe('')
    expect(screen.getByRole('heading', { name: 'Explore page' })).toBeInTheDocument()
  })
})
