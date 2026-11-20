import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GigGallery } from './GigGallery'

describe('GigGallery', () => {
  const images = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg']

  it('shows the first image as the main image', () => {
    render(<GigGallery images={images} />)
    const mainImg = screen.getByAltText('Gig preview 1')
    expect(mainImg.src).toBe(images[0])
  })

  it('changes the main image when a thumbnail is clicked', () => {
    render(<GigGallery images={images} />)
    const secondThumbImg = screen.getByAltText('Thumbnail 2')
    fireEvent.click(secondThumbImg.closest('button'))

    const mainImg = screen.getByAltText('Gig preview 2')
    expect(mainImg.src).toBe(images[1])
  })
})