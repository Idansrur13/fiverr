import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

function renderPagination(page, pageCount) {
  const onChangePage = vi.fn()
  render(<Pagination page={page} pageCount={pageCount} onChangePage={onChangePage} />)
  return onChangePage
}

describe('Pagination', () => {
  it('renders a button for each page', async () => {
    const user = userEvent.setup()
    const onChangePage = renderPagination(2, 3)

    ;['1', '2', '3'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current')

    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChangePage).toHaveBeenCalledWith(3)
  })

  it('moves to the next and previous page', async () => {
    const user = userEvent.setup()
    const onChangePage = renderPagination(2, 3)

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onChangePage).toHaveBeenLastCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onChangePage).toHaveBeenLastCalledWith(1)
  })

  it('disables Previous on the first page and Next on the last page', () => {
    renderPagination(1, 2)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  it('is hidden when there is one page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onChangePage={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })
})
