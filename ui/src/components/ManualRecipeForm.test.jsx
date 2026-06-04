import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ManualRecipeForm from './ManualRecipeForm'

vi.mock('../lib/api', () => ({
  createRecipe: vi.fn(),
}))

import { createRecipe } from '../lib/api'

describe('ManualRecipeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors when required fields are empty', async () => {
    render(<ManualRecipeForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }))

    await waitFor(() => {
      expect(screen.getByText('Add a title.')).toBeDefined()
    })
    expect(screen.getByText('Add at least one ingredient.')).toBeDefined()
    expect(screen.getByText('Add at least one step.')).toBeDefined()
    expect(createRecipe).not.toHaveBeenCalled()
  })

  it('submits a manual recipe and reports success', async () => {
    createRecipe.mockResolvedValue({ id: 'r1', title: 'Lasagna', source: 'manual' })
    const onCreated = vi.fn()

    render(<ManualRecipeForm onCreated={onCreated} />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Lasagna' },
    })
    fireEvent.change(screen.getByLabelText('Ingredient 1 name'), {
      target: { value: 'pasta' },
    })
    fireEvent.change(screen.getByLabelText('Step 1'), {
      target: { value: 'Layer and bake' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }))

    await waitFor(() => {
      expect(createRecipe).toHaveBeenCalledTimes(1)
    })

    const payload = createRecipe.mock.calls[0][0]
    expect(payload.title).toBe('Lasagna')
    expect(payload.source).toBe('manual')
    expect(payload.ingredients).toEqual([{ name: 'pasta', amount: '', unit: '' }])
    expect(payload.steps).toEqual(['Layer and bake'])

    await waitFor(() => {
      expect(screen.getByText('Recipe saved to My Recipes.')).toBeDefined()
    })
    expect(onCreated).toHaveBeenCalledWith({ id: 'r1', title: 'Lasagna', source: 'manual' })
  })
})
