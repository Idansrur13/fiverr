import { StrictMode } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ExplorePage } from './ExplorePage'
import { AppHeader } from '../cmps/AppHeader'
import { useFilterSearchParams } from '../customHooks/useFilterSearchParams'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'
import demoGigs from '../data/gigs.json'

// Changes that the "Change filter" button sends through the hook, set per test
let filterChanges = {}

function FilterControls() {
  const [, setFilterParams] = useFilterSearchParams()
  const navigate = useNavigate()
  return (
    <>
      <output aria-label="url search">{useLocation().search}</output>
      <button type="button" onClick={() => setFilterParams(filterChanges)}>
        Change filter
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  )
}

// StrictMode runs effects twice, like `npm run dev`, so these tests catch the same bugs
function renderPage(url = '/explore', { withHeader = false } = {}) {
  render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter initialEntries={[url]}>
          {withHeader && <AppHeader />}
          <Routes>
            <Route
              path="/explore"
              element={
                <>
                  <ExplorePage />
                  <FilterControls />
                </>
              }
            />
            <Route path="/gig/:gigId" element={<h1>Gig page</h1>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </StrictMode>,
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
    filterChanges = {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    renderPage('/explore?txt=logo')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Results for "logo"' }),
    ).toBeInTheDocument()
    const logoGigs = demoGigs.filter((gig) => gig.title.toLowerCase().includes('logo'))
    expect(await screen.findAllByRole('article')).toHaveLength(logoGigs.length)
  })

  it('shows only gigs of the selected category', async () => {
    renderPage('/explore?category=music-audio')

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

  it('writes the filter to the url when it changes', async () => {
    const user = userEvent.setup()
    renderPage()

    filterChanges = { category: 'music-audio', maxPrice: '100' }
    await user.click(screen.getByRole('button', { name: 'Change filter' }))

    expect(getUrlSearch()).toBe('?category=music-audio&maxPrice=100')
    expect(screen.getByRole('heading', { level: 1, name: 'Music & Audio' })).toBeInTheDocument()
  })

  it('does not add empty values to the url', async () => {
    const user = userEvent.setup()
    renderPage('/explore?category=music-audio')

    filterChanges = { txt: '  logo  ', category: '', minPrice: '', daysToMake: '' }
    await user.click(screen.getByRole('button', { name: 'Change filter' }))

    expect(getUrlSearch()).toBe('?txt=logo')
  })

  it('restores the previous filter on Back', async () => {
    const user = userEvent.setup()
    renderPage('/explore?category=music-audio')

    filterChanges = { category: 'graphics-design' }
    await user.click(screen.getByRole('button', { name: 'Change filter' }))
    expect(getUrlSearch()).toBe('?category=graphics-design')

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(getUrlSearch()).toBe('?category=music-audio')
    expect(getFilterBy().category).toBe('music-audio')
    expect(screen.getByRole('heading', { level: 1, name: 'Music & Audio' })).toBeInTheDocument()
  })

  it('queries only with the filter from the url, never with an empty filter first', async () => {
    const querySpy = vi.spyOn(gigService, 'query')
    renderPage('/explore?category=music-audio')

    await screen.findAllByRole('article')

    expect(querySpy).toHaveBeenCalled()
    querySpy.mock.calls.forEach(([filterBy]) => {
      expect(filterBy.category).toBe('music-audio')
    })
  })

  it('keeps the filter of a header search from another page (in StrictMode)', async () => {
    const user = userEvent.setup()
    // Start on a gig page, so Explore mounts fresh after the search, like in Idan's report
    renderPage('/gig/g101', { withHeader: true })

    await user.type(screen.getByRole('searchbox'), 'logo{Enter}')

    expect(getUrlSearch()).toBe('?txt=logo')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Results for "logo"' }),
    ).toBeInTheDocument()
    const logoGigs = demoGigs.filter((gig) => gig.title.toLowerCase().includes('logo'))
    expect(await screen.findAllByRole('article')).toHaveLength(logoGigs.length)
  })
})
