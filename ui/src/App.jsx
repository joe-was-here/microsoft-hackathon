import { useEffect, useState } from 'react'
import { getHealth, detectIngredients, suggestRecipes } from './lib/api'
import ImageUpload from './components/ImageUpload'
import IngredientReview from './components/IngredientReview'
import RecipeCard from './components/RecipeCard'
import Spinner from './components/Spinner'
import './App.css'

// Splits a data URL ("data:image/png;base64,AAAA") into its media type and the
// raw base64 payload, which is what the /pantry/detect endpoint expects.
function parseDataUrl(dataUrl) {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl ?? '')
  if (!match) return { mediaType: 'image/jpeg', data: '' }
  return { mediaType: match[1], data: match[2] }
}

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

  async function handleImageSelected(dataUrl) {
    setError(null)
    setStep('detecting')
    try {
      const { mediaType, data } = parseDataUrl(dataUrl)
      const result = await detectIngredients(data, mediaType)
      const names = (result?.ingredients ?? []).map((item) => item.name)
      if (names.length === 0) {
        setError('No ingredients detected — add them manually to continue.')
      }
      setIngredients(names)
      setStep('review')
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `Couldn't detect ingredients: ${caught.message}`
          : 'Something went wrong detecting ingredients.',
      )
      setStep('upload')
    }
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

      {step === 'upload' && (
        <>
          {error && (
            <p className="app__error" role="alert">
              {error}
            </p>
          )}
          <ImageUpload onImageSelected={handleImageSelected} />
        </>
      )}

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
