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
  const [checkedIngredients, setCheckedIngredients] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!recipe) return null

  const { title, ingredients = [], steps = [] } = recipe
  const time = formatTime(recipe)

  const toggleIngredient = (index) => {
    setCheckedIngredients((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleSave = async () => {
    if (saving || saved) return
    setSaving(true)
    try {
      const result = await saveRecipe(recipe)
      setSaved(true)
      if (onSave) onSave(result)
    } catch (error) {
      console.error('Failed to save recipe', error)
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
              <li key={index} className="recipe-card__ingredient">
                <label className="recipe-card__ingredient-label">
                  <input
                    type="checkbox"
                    className="recipe-card__checkbox"
                    checked={Boolean(checkedIngredients[index])}
                    onChange={() => toggleIngredient(index)}
                  />
                  <span
                    className={
                      checkedIngredients[index]
                        ? 'recipe-card__ingredient-text recipe-card__ingredient-text--checked'
                        : 'recipe-card__ingredient-text'
                    }
                  >
                    {formatIngredient(ingredient)}
                  </span>
                </label>
              </li>
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
