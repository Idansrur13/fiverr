import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GigDetailsPage } from './GigDetailsPage'
import { gigService } from '../services/gig.service'
import gigs from '../data/gigs.json'
import { store } from '../store/store'

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
    gigService.getById.mockResolvedValue(null)
    renderWithRoute('unknown-id')
    expect(await screen.findByText(/gig not found/i)).toBeTruthy()
  })

  it('renders gig details using the data shape from gigs.json', async () => {
    const gig = gigs.find((item) => item.id === 'g101')
    gigService.getById.mockResolvedValue(gig)

    renderWithRoute('g101')
    expect(await screen.findByText(gig.title)).toBeTruthy()
    expect(screen.getByText(gig.description)).toBeTruthy()
    expect(screen.getByText('Graphics Design')).toBeTruthy()
    expect(screen.getAllByText('Top Rated Seller')).toHaveLength(2)
    expect(screen.getAllByText(gig.owner.rating.toFixed(1))).toHaveLength(2)
    expect(screen.getAllByText(`(${gig.reviews.length})`)).toHaveLength(2)
  })
})
