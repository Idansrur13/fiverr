import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { HomeHero } from './HomeHero'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'
import demoGigs from '../data/gigs.json'

function ExploreStub() {
  return <h1>Explore page {useLocation().search}</h1>
}

function renderHero() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeHero />} />
          <Route path="/explore" element={<ExploreStub />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

function getFilterBy() {
  return store.getState().gigModule.filterBy
}

describe('HomeHero', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('renders the hero search input', () => {
    renderHero()
    expect(screen.getByRole('searchbox', { name: 'Search services' })).toBeInTheDocument()
  })

  it('navigates to /explore with the search text on submit', async () => {
    const user = userEvent.setup()
    renderHero()

    await user.type(screen.getByRole('searchbox'), 'logo{Enter}')

    expect(getFilterBy().txt).toBe('logo')
    expect(screen.getByRole('heading', { name: /^Explore page/ })).toBeInTheDocument()
  })

  it('renders the tags in title case', () => {
    renderHero()
    const tags = within(screen.getByRole('list', { name: 'Popular searches' })).getAllByRole(
      'button',
    )

    expect(tags.map((tag) => tag.textContent.trim())).toEqual([
      'Logo Design',
      'Website Development',
      'Video Editing',
      'WordPress',
      'Voice Over',
    ])
  })

  it('searches with the tag text on tag click', async () => {
    const user = userEvent.setup()
    setFilterBy({ category: 'music-audio' })
    renderHero()

    // The label is title case, the search keeps the short text
    await user.click(screen.getByRole('button', { name: 'Logo Design' }))

    expect(getFilterBy().txt).toBe('logo')
    expect(getFilterBy().category).toBe('')
    expect(screen.getByRole('heading', { name: 'Explore page ?txt=logo' })).toBeInTheDocument()
  })

  it('has only tags that find at least one gig in the demo data', async () => {
    const user = userEvent.setup()
    renderHero()
    const labels = within(screen.getByRole('list', { name: 'Popular searches' }))
      .getAllByRole('button')
      .map((tag) => tag.textContent.trim())
    cleanup()

    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      renderHero()
      await user.click(screen.getByRole('button', { name: label }))
      const { txt } = getFilterBy()
      const matches = demoGigs.filter((gig) => gig.title.toLowerCase().includes(txt))
      expect(matches.length, `tag "${label}" searches "${txt}"`).toBeGreaterThan(0)
      cleanup()
    }
  })

  it('uses the hero placeholder in the search', () => {
    renderHero()
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'placeholder',
      'Search for any service...',
    )
  })

  it('renders the trusted by row', () => {
    renderHero()
    const trusted = screen.getByRole('list', { name: 'Trusted by' })
    expect(within(trusted).getAllByRole('listitem')).toHaveLength(6)
    expect(within(trusted).getByText('Payoneer')).toBeInTheDocument()
  })
})
