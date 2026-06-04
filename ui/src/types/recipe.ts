// Shared Recipe data model for the frontend.
//
// This is the single source of truth for the Recipe shape across every entry
// point (suggested, manual, OCR, randomizer). It mirrors the backend Pydantic
// `Recipe` schema so both sides read/write the same structure.

export interface RecipeIngredient {
  name: string
  amount: string
  unit: string
}

export type RecipeSource = 'suggested' | 'manual' | 'ocr' | 'randomizer'

export interface Recipe {
  id?: string
  title: string
  ingredients: RecipeIngredient[]
  steps: string[]
  mealType?: string
  flavorTags: string[]
  timeMinutes?: number
  source: RecipeSource
}
