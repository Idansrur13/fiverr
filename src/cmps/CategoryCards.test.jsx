import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { CategoryCards } from './CategoryCards'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'
import { categoryService } from '../services/category.service'

function ExploreStub() {
  return <h1>Explore page {useLocation().search}</h1>
}

function renderCards() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CategoryCards />} />
          <Route path="/explore" element={<ExploreStub />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('CategoryCards', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('renders a card for every category', () => {
    renderCards()
    const categories = categoryService.getCategories()
    const cards = within(
      screen.getByRole('navigation', { name: 'Browse categories' }),
    ).getAllByRole('button')

    expect(cards).toHaveLength(categories.length)
    categories.forEach(({ name }, idx) => {
      expect(cards[idx]).toHaveTextContent(name)
      // Every card has its icon
      expect(cards[idx].querySelector('svg')).toBeInTheDocument()
    })
  })

  it('navigates to explore filtered by category on click', async () => {
    const user = userEvent.setup()
    setFilterBy({ txt: 'logo' })
    renderCards()

    await user.click(screen.getByRole('button', { name: 'Music & Audio' }))

    expect(store.getState().gigModule.filterBy).toMatchObject({ category: 'music-audio', txt: '' })
    expect(
      screen.getByRole('heading', { name: 'Explore page ?category=music-audio' }),
    ).toBeInTheDocument()
  })
})
