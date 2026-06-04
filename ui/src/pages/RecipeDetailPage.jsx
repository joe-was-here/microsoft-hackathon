import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { getRecipeById } from '../lib/api'
import './RecipeDetailPage.css'

function RecipeDetailPage() {
  const { recipeId } = useParams()
  const location = useLocation()
  const [recipe, setRecipe] = useState(location.state?.recipe ?? null)
  const [status, setStatus] = useState(location.state?.recipe ? 'ready' : 'loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!recipeId || location.state?.recipe) return

    let isMounted = true

    async function loadRecipe() {
      setStatus('loading')
      setError(null)

      try {
        const decodedRecipeId = decodeURIComponent(recipeId)
        const data = await getRecipeById(decodedRecipeId)
        if (!isMounted) return
        setRecipe(data)
        setStatus('ready')
      } catch (caught) {
        if (!isMounted) return
        setError(
          caught instanceof Error
            ? caught.message
            : 'Failed to load recipe details.',
        )
        setStatus('error')
      }
    }

    loadRecipe()

    return () => {
      isMounted = false
    }
  }, [location.state?.recipe, recipeId])

  return (
    <main className="recipe-detail">
      <header className="recipe-detail__header">
        <h1>Recipe Detail</h1>
        <Link to="/my-recipes" className="recipe-detail__back-link">
          Back to my recipes
        </Link>
      </header>

      {status === 'loading' && <p className="recipe-detail__status">Loading recipe…</p>}

      {status === 'error' && (
        <p className="recipe-detail__error" role="alert">
          {error}
        </p>
      )}

      {status === 'ready' && recipe && (
        <section className="recipe-detail__content">
          <RecipeCard recipe={recipe} />
        </section>
      )}
    </main>
  )
}

export default RecipeDetailPage
