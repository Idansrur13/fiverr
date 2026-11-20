import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ExplorePage } from './ExplorePage'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'
import demoGigs from '../data/gigs.json'

function UrlSearch() {
  return <output aria-label="url search">{useLocation().search}</output>
}

function BackButton() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Back
    </button>
  )
}

function renderPage(url = '/explore') {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/explore" element={<ExplorePage />} />
        </Routes>
        <UrlSearch />
        <BackButton />
      </MemoryRouter>
    </Provider>,
  )
}

function getUrlSearch() {
  return screen.getByRole('status', { name: 'url search' }).textContent
}

function getFilterBy() {
  return store.getState().gigModule.filterBy
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

  it('reads the filter from the url on load', async () => {
    renderPage('/explore?txt=logo&category=graphics-design&minPrice=10')

    expect(getFilterBy()).toMatchObject({
      txt: 'logo',
      category: 'graphics-design',
      minPrice: '10',
    })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Results for "logo"' }),
    ).toBeInTheDocument()
    const expectedGigs = demoGigs.filter(
      (gig) =>
        gig.title.toLowerCase().includes('logo') &&
        gig.category === 'graphics-design' &&
        gig.price >= 10,
    )
    expect(await screen.findAllByRole('article')).toHaveLength(expectedGigs.length)
  })

  it('writes the filter to the url when it changes', () => {
    renderPage()

    act(() => setFilterBy({ category: 'music-audio', maxPrice: '100' }))

    expect(getUrlSearch()).toBe('?category=music-audio&maxPrice=100')
  })

  it('does not add empty values to the url', () => {
    renderPage()

    act(() => setFilterBy({ txt: '  logo  ', category: '', minPrice: '', daysToMake: '' }))

    expect(getUrlSearch()).toBe('?txt=logo')
  })

  it('keeps a filter set before arriving without params', () => {
    setFilterBy({ txt: 'logo' })
    renderPage()

    expect(getUrlSearch()).toBe('?txt=logo')
    expect(getFilterBy().txt).toBe('logo')
  })

  it('restores the previous filter on Back', async () => {
    const user = userEvent.setup()
    renderPage('/explore?category=music-audio')

    act(() => setFilterBy({ category: 'graphics-design' }))
    expect(getUrlSearch()).toBe('?category=graphics-design')

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(getUrlSearch()).toBe('?category=music-audio')
    expect(getFilterBy().category).toBe('music-audio')
  })
})
