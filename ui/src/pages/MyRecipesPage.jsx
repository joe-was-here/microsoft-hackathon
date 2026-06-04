import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ManualRecipeForm from '../components/ManualRecipeForm'
import { getRecipes } from '../lib/api'
import './MyRecipesPage.css'

function getRecipeId(recipe) {
  return recipe.id ?? recipe.title
}

function formatTime(recipe) {
  if (typeof recipe.time_minutes === 'number') return `${recipe.time_minutes} min`
  if (typeof recipe.timeMinutes === 'number') return `${recipe.timeMinutes} min`
  if (recipe.time) return recipe.time
  return 'N/A'
}

function formatMealType(recipe) {
  return recipe.meal_type ?? recipe.mealType ?? 'Any meal'
}

function SavedRecipeCard({ recipe, onSelect, onEdit }) {
  return (
    <div className="my-recipes__card">
      <button
        type="button"
        className="my-recipes__card-open"
        onClick={() => onSelect(recipe)}
        aria-label={`Open ${recipe.title}`}
      >
        <span className="my-recipes__title">{recipe.title}</span>
        <span className="my-recipes__meta">{formatTime(recipe)}</span>
        <span className="my-recipes__meta">{formatMealType(recipe)}</span>
      </button>
      {recipe.id != null && (
        <button
          type="button"
          className="my-recipes__edit"
          onClick={() => onEdit(recipe)}
          aria-label={`Edit ${recipe.title}`}
        >
          Edit
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <section className="my-recipes__empty" aria-live="polite">
      <h2>No saved recipes yet</h2>
      <p>Generate your first recipe to start building your cookbook.</p>
      <Link to="/" className="my-recipes__cta">
        Create a recipe
      </Link>
    </section>
  )
}

function MyRecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()

  const loadRecipes = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const data = await getRecipes()
      setRecipes(Array.isArray(data) ? data : [])
      setStatus('ready')
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Failed to load saved recipes.',
      )
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  const hasRecipes = useMemo(() => recipes.length > 0, [recipes])

  function handleSelectRecipe(recipe) {
    navigate(`/recipes/${encodeURIComponent(getRecipeId(recipe))}`, {
      state: { recipe },
    })
  }

  function handleRecipeCreated(recipe) {
    setRecipes((current) => [recipe, ...current])
    setStatus('ready')
    setIsAdding(false)
  }

  function handleEditRecipe(recipe) {
    setIsAdding(false)
    setEditingId(getRecipeId(recipe))
  }

  function handleRecipeUpdated(updated) {
    setRecipes((current) =>
      current.map((recipe) =>
        getRecipeId(recipe) === editingId ? { ...recipe, ...updated } : recipe,
      ),
    )
    setEditingId(null)
  }

  return (
    <main className="my-recipes">
      <header className="my-recipes__header">
        <h1>My Recipes</h1>
      </header>

      <div className="my-recipes__actions">
        <button
          type="button"
          className="my-recipes__add-toggle"
          onClick={() => setIsAdding((current) => !current)}
          aria-expanded={isAdding}
        >
          {isAdding ? 'Cancel' : 'Add recipe manually'}
        </button>
        <Link to="/" className="my-recipes__back-link">
          Back to generator
        </Link>
      </div>

      {isAdding && <ManualRecipeForm onCreated={handleRecipeCreated} />}

      {status === 'loading' && <p className="my-recipes__status">Loading recipes…</p>}

      {status === 'error' && (
        <p className="my-recipes__error" role="alert">
          {error}
        </p>
      )}

      {status === 'ready' && !hasRecipes && <EmptyState />}

      {status === 'ready' && hasRecipes && (
        <ul className="my-recipes__list" aria-label="Saved recipes">
          {recipes.map((recipe, index) => (
            <li key={getRecipeId(recipe) ?? index}>
              {editingId === getRecipeId(recipe) ? (
                <ManualRecipeForm
                  key={getRecipeId(recipe)}
                  initialRecipe={recipe}
                  onUpdated={handleRecipeUpdated}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <SavedRecipeCard
                  recipe={recipe}
                  onSelect={handleSelectRecipe}
                  onEdit={handleEditRecipe}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default MyRecipesPage
