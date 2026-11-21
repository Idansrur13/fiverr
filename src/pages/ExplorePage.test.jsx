import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ExplorePage } from './ExplorePage'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'
import demoGigs from '../data/gigs.json'

function renderPage() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/explore']}>
        <ExplorePage />
      </MemoryRouter>
    </Provider>,
  )
}

describe('ExplorePage', () => {
  beforeEach(() => {
    localStorage.clear()
    setFilterBy(gigService.getDefaultFilter())
  })

  it('loads and shows gigs from the store', async () => {
    renderPage()

    expect(await screen.findAllByRole('article')).toHaveLength(demoGigs.length)
    expect(store.getState().gigModule.gigs).toHaveLength(demoGigs.length)
  })

  it('shows the number of results', async () => {
    renderPage()

    expect(await screen.findByText(`${demoGigs.length} services available`)).toBeInTheDocument()
  })

  it('shows the search text in the title when filtering by txt', async () => {
    setFilterBy({ txt: 'logo' })
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Results for "logo"' }),
    ).toBeInTheDocument()
    const logoGigs = demoGigs.filter((gig) => gig.title.toLowerCase().includes('logo'))
    expect(await screen.findAllByRole('article')).toHaveLength(logoGigs.length)
  })

  it('shows only gigs of the selected category', async () => {
    setFilterBy({ category: 'music-audio' })
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Music & Audio' })).toBeInTheDocument()
    const musicGigs = demoGigs.filter((gig) => gig.category === 'music-audio')
    const previews = await screen.findAllByRole('article')
    expect(previews).toHaveLength(musicGigs.length)
    musicGigs.forEach((gig) => {
      expect(screen.getByRole('heading', { name: gig.title })).toBeInTheDocument()
    })
  })
})
