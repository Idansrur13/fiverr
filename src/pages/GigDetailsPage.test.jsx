import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GigDetailsPage } from './GigDetailsPage'
import { gigService } from '../services/gig.service'
import gigs from '../data/gigs.json'
import { store } from '../store/store'
import { SET_GIG } from '../store/gig.reducer'

vi.mock('../services/gig.service', () => ({
  gigService: {
    getById: vi.fn(),
    getDefaultFilter: vi.fn(() => ({
      txt: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      daysToMake: '',
    })),
  },
}))

function renderWithRoute(gigId = 'g101') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/gig/${gigId}`]}>
        <Routes>
          <Route path="/gig/:gigId" element={<GigDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('GigDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loader while the gig is loading', () => {
    gigService.getById.mockReturnValue(new Promise(() => {}))
    renderWithRoute('g101')
    expect(screen.getByText(/loading/i)).toBeTruthy()
  })

  it('loads the gig by the id in the url', async () => {
    const gig = gigs.find((item) => item.id === 'g101')
    gigService.getById.mockResolvedValue(gig)

    renderWithRoute('g101')
    expect(gigService.getById).toHaveBeenCalledWith('g101')
    expect(await screen.findByText(gig.title)).toBeTruthy()
  })

  it('shows a not found message for an unknown gig id', async () => {
    gigService.getById.mockRejectedValue(
      Object.assign(new Error('Cannot find unknown-id in gigDB'), { code: 'NOT_FOUND' }),
    )
    renderWithRoute('unknown-id')
    expect(await screen.findByText(/gig not found/i)).toBeTruthy()
  })

  it('shows a load error when the service fails for another reason', async () => {
    gigService.getById.mockRejectedValue(new Error('Storage unavailable'))
    renderWithRoute('g101')
    expect(await screen.findByText(/failed to load gig/i)).toBeTruthy()
  })

  it('does not store a gig when unmounted while it is loading', async () => {
    let resolveGig
    gigService.getById.mockReturnValue(
      new Promise((resolve) => {
        resolveGig = resolve
      }),
    )
    store.dispatch({ type: SET_GIG, gig: null })

    const { unmount } = renderWithRoute('g101')
    unmount()

    await act(async () => {
      resolveGig(gigs.find((item) => item.id === 'g101'))
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(store.getState().gigModule.gig).toBeNull()
  })

  it('renders gig details using the data shape from gigs.json', async () => {
    const gig = gigs.find((item) => item.id === 'g101')
    const gigWithoutOwnerRating = { ...gig, owner: { ...gig.owner, rating: undefined } }
    gigService.getById.mockResolvedValue(gigWithoutOwnerRating)

    renderWithRoute('g101')
    expect(await screen.findByText(gig.title)).toBeTruthy()
    expect(screen.getByText(gig.description)).toBeTruthy()
    expect(screen.getByText('Graphics Design')).toBeTruthy()
    expect(screen.getAllByText('Top Rated Seller')).toHaveLength(2)
    expect(screen.getAllByText('5.0')).toHaveLength(2)
    expect(screen.getAllByText(`(${gig.reviews.length})`)).toHaveLength(2)
  })

  it('uses category slugs from the API data in breadcrumb links', async () => {
    gigService.getById.mockResolvedValue({
      ...gigs.find((item) => item.id === 'g101'),
      category: {
        name: 'Design & Branding',
        slug: 'design-branding-services',
        parent: { name: 'Graphics & Design', slug: 'graphics-design' },
      },
    })

    renderWithRoute('g101')

    expect(await screen.findByText('Design & Branding')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Graphics & Design' }).getAttribute('href')).toBe(
      '/explore?category=graphics-design',
    )
    expect(screen.getByRole('link', { name: 'Design & Branding' }).getAttribute('href')).toBe(
      '/explore?category=design-branding-services',
    )
  })
})
