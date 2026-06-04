import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecipeCard from './RecipeCard'

const sampleRecipe = {
  title: 'Tomato Basil Pasta',
  time: '25 min',
  ingredients: ['200g pasta', '3 tomatoes', 'Fresh basil'],
  steps: ['Boil the pasta', 'Make the sauce', 'Combine and serve'],
}

describe('RecipeCard', () => {
  it('renders title, time, ingredients, and numbered steps', () => {
    render(<RecipeCard recipe={sampleRecipe} />)

    expect(
      screen.getByRole('heading', { name: 'Tomato Basil Pasta' }),
    ).toBeDefined()
    expect(screen.getByText('⏱ 25 min')).toBeDefined()
    expect(screen.getByText('200g pasta')).toBeDefined()
    expect(screen.getByText('Boil the pasta')).toBeDefined()
  })

  it('calls the save handler with the recipe', () => {
    const onSave = vi.fn()
    render(<RecipeCard recipe={sampleRecipe} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(sampleRecipe)
  })

  it('shows the needs groceries badge only in mode B', () => {
    const { rerender } = render(<RecipeCard recipe={sampleRecipe} />)
    expect(screen.queryByText('Needs groceries')).toBeNull()

    rerender(<RecipeCard recipe={sampleRecipe} needsGroceries />)
    expect(screen.getByText('Needs groceries')).toBeDefined()
  })

  it('renders nothing without a recipe', () => {
    const { container } = render(<RecipeCard />)
    expect(container).toBeEmptyDOMElement()
  })
})
