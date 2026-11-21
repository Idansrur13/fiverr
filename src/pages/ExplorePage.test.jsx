import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { store } from '../store/store'
import { ExplorePage } from './ExplorePage'

describe('ExplorePage', () => {
  beforeEach(() => {
    localStorage.setItem(
      'gigDB',
      JSON.stringify([
        {
          id: 'matching-gig',
          title: 'Matching design gig',
          category: 'design-branding-services',
        },
        {
          id: 'other-gig',
          title: 'Other category gig',
          category: 'programming-tech',
        },
      ]),
    )
  })

  it('filters gigs by the category query parameter', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/explore?category=design-branding-services']}>
          <Routes>
            <Route path="/explore" element={<ExplorePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    expect(await screen.findByRole('link', { name: 'Matching design gig' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Other category gig' })).toBeNull()
  })
})
