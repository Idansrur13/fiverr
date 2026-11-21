import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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

  it('searches by the tag text when a tag is clicked', async () => {
    const user = userEvent.setup()
    setFilterBy({ category: 'music-audio' })
    renderHero()

    await user.click(screen.getByRole('button', { name: 'logo' }))

    expect(getFilterBy().txt).toBe('logo')
    expect(getFilterBy().category).toBe('')
    expect(screen.getByRole('heading', { name: 'Explore page ?txt=logo' })).toBeInTheDocument()
  })

  it('has only tags that find at least one gig in the demo data', () => {
    renderHero()
    const tags = within(screen.getByRole('list')).getAllByRole('button')

    expect(tags.length).toBeGreaterThan(0)
    tags.forEach((tag) => {
      const tagTxt = tag.textContent.trim().toLowerCase()
      const matches = demoGigs.filter((gig) => gig.title.toLowerCase().includes(tagTxt))
      expect(matches.length, `tag "${tagTxt}"`).toBeGreaterThan(0)
    })
  })
})
