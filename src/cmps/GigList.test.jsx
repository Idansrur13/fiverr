import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { GigList } from './GigList'
import { store } from '../store/store'
import demoGigs from '../data/gigs.json'

function renderList(gigs) {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <GigList gigs={gigs} />
      </MemoryRouter>
    </Provider>,
  )
}

describe('GigList', () => {
  it('renders a preview for each gig', () => {
    const gigs = demoGigs.slice(0, 5)
    renderList(gigs)

    expect(screen.getAllByRole('article')).toHaveLength(gigs.length)
    gigs.forEach((gig) => {
      expect(screen.getByRole('heading', { name: gig.title })).toBeInTheDocument()
    })
  })

  it('renders an empty state when there are no gigs', () => {
    renderList([])

    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No services found' })).toBeInTheDocument()
  })
})
