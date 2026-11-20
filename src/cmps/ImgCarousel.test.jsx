import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('wraps from the last image to the first', async () => {
    const user = userEvent.setup()
    render(<ImgCarousel images={images} alt={title} />)

    await user.click(screen.getByRole('button', { name: 'Previous image' }))
    expect(getShownImage()).toHaveAttribute('src', images[images.length - 1])

    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(getShownImage()).toHaveAttribute('src', images[0])
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
})
