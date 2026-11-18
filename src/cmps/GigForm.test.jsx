import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GigForm } from './GigForm'

function renderForm() {
  const onSave = vi.fn()
  const user = userEvent.setup()
  render(<GigForm onSave={onSave} />)
  return { onSave, user }
}

describe('GigForm', () => {
  it('renders title and price fields', () => {
    renderForm()
    expect(screen.getByLabelText('Gig title')).toBeInTheDocument()
    expect(screen.getByLabelText('Price ($)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('shows an error when the title is empty', async () => {
    const { onSave, user } = renderForm()
    await user.type(screen.getByLabelText('Gig title'), '   ')
    await user.type(screen.getByLabelText('Price ($)'), '20')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Gig title')).toHaveAttribute('aria-invalid', 'true')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows an error when the title is longer than 80 characters', async () => {
    const { onSave, user } = renderForm()
    await user.type(screen.getByLabelText('Gig title'), 'a'.repeat(81))
    await user.type(screen.getByLabelText('Price ($)'), '20')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Title must be 80 characters or less')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows an error when the price is not a positive number', async () => {
    const { onSave, user } = renderForm()
    await user.type(screen.getByLabelText('Gig title'), 'I will design your logo')
    const priceInput = screen.getByLabelText('Price ($)')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Price must be a positive number')).toBeInTheDocument()

    await user.type(priceInput, '0')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Price must be a positive number')).toBeInTheDocument()

    await user.clear(priceInput)
    await user.type(priceInput, '-5')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Price must be a positive number')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onSave with the title and price when valid', async () => {
    const { onSave, user } = renderForm()
    await user.type(screen.getByLabelText('Gig title'), '  I will design your logo  ')
    await user.type(screen.getByLabelText('Price ($)'), '25')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith({ title: 'I will design your logo', price: 25 })
    expect(screen.queryByText(/must be|is required/)).not.toBeInTheDocument()
  })
})
