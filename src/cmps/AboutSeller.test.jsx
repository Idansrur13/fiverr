import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AboutSeller } from './AboutSeller'

describe('AboutSeller', () => {
  const owner = {
    fullname: 'Soli Dev',
    imgUrl: 'https://example.com/avatar.jpg',
    level: 'Top Rated',
    country: 'Israel',
    languages: ['English', 'Hebrew'],
    responseTime: '1 hour',
    about: 'Experienced developer',
  }

  it('renders the seller name, level and rating', () => {
    render(<AboutSeller owner={owner} rating={4.9} reviewsCount={15} />)
    expect(screen.getByText('Soli Dev')).toBeTruthy()
    expect(screen.getByText('Top Rated')).toBeTruthy()
    expect(screen.getByText('4.9')).toBeTruthy()
  })

  it('renders the seller details when they exist', () => {
    render(<AboutSeller owner={owner} rating={4.9} reviewsCount={15} />)
    expect(screen.getByText('Israel')).toBeTruthy()
    expect(screen.getByText('1 hour')).toBeTruthy()
    expect(screen.getByText('English, Hebrew')).toBeTruthy()
  })
})