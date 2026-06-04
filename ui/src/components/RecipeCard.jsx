import { useState } from 'react'
import { saveRecipe } from '../lib/api'
import './RecipeCard.css'

function formatTime(recipe) {
  if (typeof recipe.time_minutes === 'number') return `${recipe.time_minutes} min`
  if (recipe.time) return recipe.time
  return null
}

function formatIngredient(ingredient) {
  if (typeof ingredient === 'string') return ingredient
  return [ingredient.amount, ingredient.unit, ingredient.name]
    .filter(Boolean)
    .join(' ')
}

function RecipeCard({ recipe, onSave, needsGroceries = false }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!recipe) return null

  const { title, ingredients = [], steps = [] } = recipe
  const time = formatTime(recipe)

  async function handleSave() {
    setSaving(true)
    try {
      const savedRecipe = await saveRecipe(recipe)
      setSaved(true)
      onSave?.(savedRecipe)
    } catch (err) {
      console.error('Failed to save recipe', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="recipe-card">
      <header className="recipe-card__header">
        <h2 className="recipe-card__title">{title}</h2>
        <div className="recipe-card__badges">
          {time && <span className="recipe-card__badge">⏱ {time}</span>}
          {needsGroceries && (
            <span className="recipe-card__badge recipe-card__badge--groceries">
              Needs groceries
            </span>
          )}
        </div>
      </header>

      {ingredients.length > 0 && (
        <section className="recipe-card__section">
          <h3 className="recipe-card__subtitle">Ingredients</h3>
          <ul className="recipe-card__ingredients">
            {ingredients.map((ingredient, index) => (
              <li key={index}>{formatIngredient(ingredient)}</li>
            ))}
          </ul>
        </section>
      )}

      {steps.length > 0 && (
        <section className="recipe-card__section">
          <h3 className="recipe-card__subtitle">Steps</h3>
          <ol className="recipe-card__steps">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <button
        type="button"
        className="recipe-card__save"
        onClick={handleSave}
        disabled={saving || saved}
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save recipe'}
      </button>
    </article>
  )
}

export default RecipeCard
