import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SellerGigsPage } from './SellerGigsPage'
import { gigService } from '../services/gig.service'
import { userService } from '../services/user.service'
import { store } from '../store/store'

const seller = userService.getLoggedinUser()
const otherSeller = {
  id: 'u999',
  fullname: 'Other Seller',
  imgUrl: 'https://i.pravatar.cc/150?img=12',
  level: 'LEVEL_1',
  rating: 4.5,
}

function makeGig({ id, title, price, status, owner = seller }) {
  return {
    id,
    title,
    price,
    daysToMake: 3,
    category: 'graphics-design',
    images: [`https://picsum.photos/seed/${id}/800/500`],
    description: '',
    owner,
    reviews: [],
    status,
    createdAt: 1768003200000,
  }
}

function makeOrder(id, gigId) {
  return {
    id,
    buyer: { id: 'u201', fullname: 'Liam Brooks', imgUrl: '' },
    seller: { id: seller.id, fullname: seller.fullname, imgUrl: seller.imgUrl },
    gig: { id: gigId, title: '', imgUrl: '' },
    price: 45,
    status: 'PENDING',
    createdAt: 1768003200000,
    dueAt: 1768262400000,
  }
}

const testGigs = [
  makeGig({ id: 'g1', title: 'I will design your logo', price: 45, status: 'ACTIVE' }),
  makeGig({ id: 'g2', title: 'I will build your website', price: 300, status: 'ACTIVE' }),
  makeGig({ id: 'g3', title: 'I will write your blog posts', price: 30, status: 'DRAFT' }),
  makeGig({
    id: 'g4',
    title: 'I will edit your videos',
    price: 80,
    status: 'ACTIVE',
    owner: otherSeller,
  }),
]

const testOrders = [makeOrder('o1', 'g1'), makeOrder('o2', 'g1')]

function EditPageStub() {
  const { gigId } = useParams()
  return <h1>Editing {gigId}</h1>
}

function renderPage() {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/seller/gigs']}>
        <Routes>
          <Route path="/seller/gigs" element={<SellerGigsPage />} />
          <Route path="/seller/gigs/:gigId/edit" element={<EditPageStub />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

async function findGigRow(title) {
  const titleLink = await screen.findByRole('link', { name: title })
  return titleLink.closest('tr')
}

async function getStoredGigIds() {
  const gigs = await gigService.query()
  return gigs.map((gig) => gig.id)
}

describe('SellerGigsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('gigDB', JSON.stringify(testGigs))
    localStorage.setItem('orderDB', JSON.stringify(testOrders))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows only the gigs of the logged in seller', async () => {
    renderPage()

    const logoRow = await findGigRow('I will design your logo')
    expect(screen.getByRole('link', { name: 'I will build your website' })).toBeInTheDocument()
    expect(screen.queryByText('I will edit your videos')).not.toBeInTheDocument()

    expect(logoRow.querySelector('img')).toHaveAttribute('src', testGigs[0].images[0])
    expect(within(logoRow).getByText('$45')).toBeInTheDocument()
    expect(within(logoRow).getByText('2')).toBeInTheDocument()
  })

  it('filters gigs by the selected status tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await findGigRow('I will design your logo')

    await user.click(screen.getByRole('tab', { name: /Draft/ }))
    expect(screen.getByRole('tab', { name: /Draft/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('link', { name: 'I will write your blog posts' })).toBeInTheDocument()
    expect(screen.queryByText('I will design your logo')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Paused/ }))
    expect(screen.getByText('No paused gigs to show')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the count of gigs in each tab', async () => {
    renderPage()

    expect(await screen.findByRole('tab', { name: 'Active 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Draft 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Paused 0' })).toBeInTheDocument()
  })

  it('links Create a new gig to the new gig page', async () => {
    renderPage()

    expect(await screen.findByRole('link', { name: 'Create a new gig' })).toHaveAttribute(
      'href',
      '/seller/gigs/new',
    )
  })

  it('navigates to edit when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const logoRow = await findGigRow('I will design your logo')
    await user.click(within(logoRow).getByRole('link', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Editing g1' })).toBeInTheDocument()
  })

  it('removes a gig after confirming delete', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderPage()

    const logoRow = await findGigRow('I will design your logo')
    await user.click(within(logoRow).getByRole('button', { name: 'Delete' }))

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByText('I will design your logo')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('tab', { name: 'Active 1' })).toBeInTheDocument()
    expect(await getStoredGigIds()).not.toContain('g1')
  })

  it('keeps the gig when delete is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    renderPage()

    const logoRow = await findGigRow('I will design your logo')
    await user.click(within(logoRow).getByRole('button', { name: 'Delete' }))

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('link', { name: 'I will design your logo' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Active 2' })).toBeInTheDocument()
    expect(await getStoredGigIds()).toContain('g1')
  })
})
