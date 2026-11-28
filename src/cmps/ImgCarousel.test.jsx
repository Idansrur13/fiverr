import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ImgCarousel } from './ImgCarousel'
import demoGigs from '../data/gigs.json'

const { images, title } = demoGigs.find((gig) => gig.id === 'g101')

function getShownImage() {
  return screen.getByRole('img', { name: title })
}

describe('ImgCarousel', () => {
  it('shows the first image by default', () => {
    render(<ImgCarousel images={images} alt={title} />)
    expect(getShownImage()).toHaveAttribute('src', images[0])
  })

  it('shows the next image on next click', async () => {
    const user = userEvent.setup()
    render(<ImgCarousel images={images} alt={title} />)

    await user.click(screen.getByRole('button', { name: 'Next image' }))

    expect(getShownImage()).toHaveAttribute('src', images[1])
  })

  it('shows the previous image on prev click', async () => {
    const user = userEvent.setup()
    render(<ImgCarousel images={images} alt={title} />)

    await user.click(screen.getByRole('button', { name: 'Next image' }))
    await user.click(screen.getByRole('button', { name: 'Previous image' }))

    expect(getShownImage()).toHaveAttribute('src', images[0])
  })

  it('does not wrap from the last image to the first', async () => {
    const user = userEvent.setup()
    render(<ImgCarousel images={images} alt={title} />)
    const lastDot = screen.getByRole('button', { name: `Show image ${images.length}` })

    await user.click(lastDot)
    expect(getShownImage()).toHaveAttribute('src', images[images.length - 1])
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()

    // No next arrow to loop with: the only way is back
    await user.click(screen.getByRole('button', { name: 'Previous image' }))
    expect(getShownImage()).toHaveAttribute('src', images[images.length - 2])
  })

  it('hides the previous arrow on the first image', () => {
    render(<ImgCarousel images={images} alt={title} />)

    expect(getShownImage()).toHaveAttribute('src', images[0])
    expect(screen.queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next image' })).toBeInTheDocument()
  })

  it('hides the next arrow on the last image', async () => {
    const user = userEvent.setup()
    render(<ImgCarousel images={images} alt={title} />)

    // In the middle both arrows show
    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next image' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(getShownImage()).toHaveAttribute('src', images[images.length - 1])
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeInTheDocument()
  })

  it('renders a dot for each image and marks the current one', async () => {
    const user = userEvent.setup()
    render(<ImgCarousel images={images} alt={title} />)

    const dots = screen.getAllByRole('button', { name: /Show image/ })
    expect(dots).toHaveLength(images.length)
    expect(dots[0]).toHaveAttribute('aria-current', 'true')

    await user.click(dots[2])
    expect(dots[2]).toHaveAttribute('aria-current', 'true')
    expect(dots[0]).not.toHaveAttribute('aria-current')
    expect(getShownImage()).toHaveAttribute('src', images[2])
  })

  it('hides arrows and dots for a single image', () => {
    render(<ImgCarousel images={[images[0]]} alt={title} />)

    expect(getShownImage()).toHaveAttribute('src', images[0])
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not trigger the parent click when an arrow is clicked', async () => {
    const user = userEvent.setup()
    const onParentClick = vi.fn()
    render(
      <div onClick={onParentClick}>
        <ImgCarousel images={images} alt={title} />
      </div>,
    )

    await user.click(screen.getByRole('button', { name: 'Next image' }))
    await user.click(screen.getByRole('button', { name: 'Show image 3' }))

    expect(onParentClick).not.toHaveBeenCalled()
  })

  it('shows the next image on swipe left', () => {
    render(<ImgCarousel images={images} alt={title} />)
    const carousel = getShownImage().parentElement

    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100 }] })

    expect(getShownImage()).toHaveAttribute('src', images[1])
  })

  it('does not swipe past the last image', () => {
    render(<ImgCarousel images={images} alt={title} />)
    const carousel = getShownImage().parentElement

    // One swipe more than there are images to move through
    for (let i = 0; i < images.length; i++) {
      fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] })
      fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100 }] })
    }
    expect(getShownImage()).toHaveAttribute('src', images[images.length - 1])

    // And not past the first one either
    for (let i = 0; i < images.length; i++) {
      fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] })
      fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200 }] })
    }
    expect(getShownImage()).toHaveAttribute('src', images[0])
  })

  it('does not open the gig on a swipe past the edge', () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <Routes>
          <Route
            path="/explore"
            element={<ImgCarousel images={images} alt={title} linkTo="/gig/g101" />}
          />
          <Route path="/gig/:gigId" element={<h1>Gig page</h1>} />
        </Routes>
      </MemoryRouter>,
    )
    const carousel = screen.getByRole('link').parentElement

    // A swipe right on the first image: nothing to move to, but it's still a swipe
    fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200 }] })
    fireEvent.click(getShownImage())

    expect(getShownImage()).toHaveAttribute('src', images[0])
    expect(screen.queryByRole('heading', { name: 'Gig page' })).not.toBeInTheDocument()
  })

  it('opens the link on the first tap after a swipe', () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <Routes>
          <Route
            path="/explore"
            element={<ImgCarousel images={images} alt={title} linkTo="/gig/g101" />}
          />
          <Route path="/gig/:gigId" element={<h1>Gig page</h1>} />
        </Routes>
      </MemoryRouter>,
    )
    const carousel = screen.getByRole('link').parentElement

    // A real swipe: the finger moves, and the browser sends no click
    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100 }] })

    // Then a tap on the image
    fireEvent.touchStart(carousel, { touches: [{ clientX: 150 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 150 }] })
    fireEvent.click(getShownImage())

    expect(screen.getByRole('heading', { name: 'Gig page' })).toBeInTheDocument()
  })
})
