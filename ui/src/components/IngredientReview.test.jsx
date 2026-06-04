import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IngredientReview from './IngredientReview'

describe('IngredientReview', () => {
  it('renders detected ingredients as chips', () => {
    render(<IngredientReview ingredients={['eggs', 'cheddar cheese']} />)
    expect(screen.getByText('eggs')).toBeDefined()
    expect(screen.getByText('cheddar cheese')).toBeDefined()
  })

  it('removes a false positive when its X is clicked', () => {
    render(<IngredientReview ingredients={['eggs', 'spinach']} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remove spinach' }))

    expect(screen.queryByText('spinach')).toBeNull()
    expect(screen.getByText('eggs')).toBeDefined()
  })

  it('adds a missing ingredient via the input and add button', () => {
    render(<IngredientReview ingredients={['eggs']} />)

    const input = screen.getByLabelText('Add an ingredient')
    fireEvent.change(input, { target: { value: 'tomatoes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('tomatoes')).toBeDefined()
    expect(input).toHaveValue('')
  })

  it('does not add duplicate ingredients', () => {
    render(<IngredientReview ingredients={['eggs']} />)

    const input = screen.getByLabelText('Add an ingredient')
    fireEvent.change(input, { target: { value: 'Eggs' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getAllByText(/eggs/i)).toHaveLength(1)
  })

  it('confirms the current list', () => {
    const onConfirm = vi.fn()
    render(
      <IngredientReview ingredients={['eggs', 'spinach']} onConfirm={onConfirm} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove spinach' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm ingredients' }))

    expect(onConfirm).toHaveBeenCalledWith(['eggs'])
  })
})
