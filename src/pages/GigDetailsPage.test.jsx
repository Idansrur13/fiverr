import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GigDetailsPage } from './GigDetailsPage'
import { gigService } from '../services/gig.service'

vi.mock('../services/gig.service', () => ({
  gigService: {
    getById: vi.fn(),
  },
}))

function renderWithRoute(gigId = 'g101') {
  return render(
    <MemoryRouter initialEntries={[`/gig/${gigId}`]}>
      <Routes>
        <Route path="/gig/:gigId" element={<GigDetailsPage />} />
      </Routes>
    </MemoryRouter>
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
    gigService.getById.mockResolvedValue({
      id: 'g101',
      title: 'React Website',
      description: 'Great site',
      category: 'Web Programming',
      images: ['https://example.com/1.jpg'],
      owner: { fullname: 'Soli' },
    })

    renderWithRoute('g101')
    expect(gigService.getById).toHaveBeenCalledWith('g101')
    expect(await screen.findByText('React Website')).toBeTruthy()
  })

  it('shows a not found message for an unknown gig id', async () => {
    gigService.getById.mockResolvedValue(null)
    renderWithRoute('unknown-id')
    expect(await screen.findByText(/gig not found/i)).toBeTruthy()
  })

  it('renders the title, description and category breadcrumb', async () => {
    gigService.getById.mockResolvedValue({
      id: 'g101',
      title: 'React Website',
      description: 'Clean and fast code',
      category: { name: 'Web Programming', parent: { name: 'Programming & Tech' } },
      images: ['https://example.com/1.jpg'],
      owner: { fullname: 'Soli' },
    })

    renderWithRoute('g101')
    expect(await screen.findByText('React Website')).toBeTruthy()
    expect(screen.getByText('Clean and fast code')).toBeTruthy()
    expect(screen.getByText('Web Programming')).toBeTruthy()
    expect(screen.getByText('Programming & Tech')).toBeTruthy()
  })
})