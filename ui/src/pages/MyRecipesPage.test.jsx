import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MyRecipesPage from './MyRecipesPage'

vi.mock('../lib/api', () => ({
  getRecipes: vi.fn(),
}))

import { getRecipes } from '../lib/api'

describe('MyRecipesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state CTA when there are no recipes', async () => {
    getRecipes.mockResolvedValue([])

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No saved recipes yet' })).toBeDefined()
    })

    expect(screen.getByRole('link', { name: 'Create a recipe' })).toBeDefined()
  })

  it('renders compact recipe cards from the API response', async () => {
    getRecipes.mockResolvedValue([
      { id: 'r1', title: 'Avocado Toast', time_minutes: 10, meal_type: 'Breakfast' },
    ])

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open Avocado Toast' })).toBeDefined()
    })

    expect(screen.getByText('10 min')).toBeDefined()
    expect(screen.getByText('Breakfast')).toBeDefined()
  })
})
