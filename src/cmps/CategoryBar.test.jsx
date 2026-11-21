import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { CategoryBar } from './CategoryBar'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

const CATEGORY_NAMES = [
  'Graphics & Design',
  'Programming & Tech',
  'Digital Marketing',
  'Video & Animation',
  'Writing & Translation',
  'Music & Audio',
  'Business',
  'AI Services',
]

function ExploreStub() {
  return <h1>Explore page {useLocation().search}</h1>
}

function renderCategoryBar(path = '/') {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <CategoryBar />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/explore" element={<ExploreStub />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('CategoryBar', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('renders all categories', () => {
    renderCategoryBar()
    CATEGORY_NAMES.forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  it('sets filterBy.category and navigates to /explore on click', async () => {
    const user = userEvent.setup()
    setFilterBy({ txt: 'logo' })
    renderCategoryBar()

    await user.click(screen.getByRole('button', { name: 'Programming & Tech' }))

    const { filterBy } = store.getState().gigModule
    expect(filterBy.category).toBe('programming-tech')
    expect(filterBy.txt).toBe('')
    expect(
      screen.getByRole('heading', { name: 'Explore page ?category=programming-tech' }),
    ).toBeInTheDocument()
  })

  it('marks the selected category as active', () => {
    setFilterBy({ category: 'music-audio' })
    renderCategoryBar('/explore')

    expect(screen.getByRole('button', { name: 'Music & Audio' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Business' })).not.toHaveClass('active')
  })
})
