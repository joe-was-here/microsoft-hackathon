import { useEffect, useState } from 'react'
import { getHealth, suggestRecipes } from './lib/api'
import ImageUpload from './components/ImageUpload'
import IngredientReview from './components/IngredientReview'
import RecipeCard from './components/RecipeCard'
import Spinner from './components/Spinner'
import './App.css'

// Hardcoded stand-in for the POST /pantry/detect response. Swap this out for
// the real detect call once that endpoint is wired in.
const MOCK_DETECTED_INGREDIENTS = [
  'eggs',
  'cheddar cheese',
  'spinach',
  'tomatoes',
  'onion',
]

function App() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [step, setStep] = useState('upload') // upload | detecting | review | suggesting | results
  const [ingredients, setIngredients] = useState([])
  const [recipes, setRecipes] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'))
  }, [])

  function handleImageSelected() {
    // Simulate the detect API call with a brief loading state, then use the
    // hardcoded ingredient list.
    setError(null)
    setStep('detecting')
    setTimeout(() => {
      setIngredients(MOCK_DETECTED_INGREDIENTS)
      setStep('review')
    }, 800)
  }

  async function handleConfirm(confirmedIngredients) {
    setError(null)
    setStep('suggesting')
    try {
      const result = await suggestRecipes(confirmedIngredients)
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('No recipes came back. Try adjusting your ingredients.')
      }
      setRecipes(result)
      setStep('results')
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong generating recipes.',
      )
      setStep('review')
    }
  }

  function handleSave(recipe) {
    setSavedRecipes((current) =>
      current.some((saved) => saved.title === recipe.title)
        ? current
        : [...current, recipe],
    )
  }

  function handleStartOver() {
    setStep('upload')
    setIngredients([])
    setRecipes([])
    setError(null)
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>AI Sous Chef</h1>
        <p className="app__subtitle">Snap your ingredients, get recipes.</p>
        <p className="app__status">Backend: {apiStatus}</p>
      </header>

      {step === 'upload' && <ImageUpload onImageSelected={handleImageSelected} />}

      {step === 'detecting' && <Spinner label="Detecting ingredients…" />}

      {step === 'review' && (
        <>
          {error && (
            <p className="app__error" role="alert">
              {error}
            </p>
          )}
          <IngredientReview ingredients={ingredients} onConfirm={handleConfirm} />
        </>
      )}

      {step === 'suggesting' && <Spinner label="Cooking up recipes…" />}

      {step === 'results' && (
        <section className="app__results">
          <div className="app__results-bar">
            <h2>Recipe suggestions</h2>
            <button
              type="button"
              className="app__start-over"
              onClick={handleStartOver}
            >
              Start over
            </button>
          </div>
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id ?? index}
              recipe={recipe}
              onSave={handleSave}
            />
          ))}
        </section>
      )}
    </main>
  )
}

export default App
