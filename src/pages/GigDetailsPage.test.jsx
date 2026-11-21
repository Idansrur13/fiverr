import { render, screen, within } from '@testing-library/react'
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

const gig = gigs.find((item) => item.id === 'g101')

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
    store.dispatch({ type: SET_GIG, gig: null })
  })

  it('shows a loader while the gig is loading', () => {
    gigService.getById.mockReturnValue(new Promise(() => {}))
    renderWithRoute('g101')
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('loads the gig by the id in the url', async () => {
    gigService.getById.mockResolvedValue(gig)

    renderWithRoute('g101')
    expect(gigService.getById).toHaveBeenCalledWith('g101')
    expect(await screen.findByRole('heading', { name: gig.title })).toBeInTheDocument()
  })

  it('shows a not found message for an unknown gig id', async () => {
    gigService.getById.mockRejectedValue(new Error('Cannot find unknown-id in gigDB'))
    renderWithRoute('unknown-id')
    expect(await screen.findByText('Gig not found')).toBeInTheDocument()
  })

  it('does not show a gig left in the store for a different id', async () => {
    store.dispatch({ type: SET_GIG, gig })
    gigService.getById.mockRejectedValue(new Error('Cannot find unknown-id in gigDB'))

    renderWithRoute('unknown-id')
    expect(await screen.findByText('Gig not found')).toBeInTheDocument()
    expect(screen.queryByText(gig.title)).not.toBeInTheDocument()
  })

  it('renders the title, description and category breadcrumb', async () => {
    gigService.getById.mockResolvedValue(gig)

    renderWithRoute('g101')
    expect(await screen.findByRole('heading', { name: gig.title })).toBeInTheDocument()
    expect(screen.getByText(gig.description)).toBeInTheDocument()

    const breadcrumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    const categoryLink = within(breadcrumbs).getByRole('link', { name: 'Graphics Design' })
    expect(categoryLink).toHaveAttribute('href', '/explore?category=graphics-design')

    expect(screen.getAllByText('Top Rated Seller')).toHaveLength(2)
    expect(screen.getAllByText('5.0')).toHaveLength(3)
    expect(screen.getAllByText(`(${gig.reviews.length})`)).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument()
    expect(screen.getByText(gig.reviews[0].txt)).toBeInTheDocument()
  })

  it('renders the order card inside the sidebar without a nested aside', async () => {
    gigService.getById.mockResolvedValue(gig)
    const { container } = renderWithRoute('g101')

    expect(await screen.findByText('$45')).toBeInTheDocument()
    const sidebar = container.querySelector('.gig-details-sidebar')
    const orderCard = sidebar.querySelector('.order-card')

    expect(orderCard).toBeInTheDocument()
    expect(orderCard.tagName).toBe('DIV')
    expect(sidebar.querySelector('aside')).toBeNull()
  })
})
