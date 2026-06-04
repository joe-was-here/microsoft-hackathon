import { useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { detectIngredients, suggestRecipes, chatSuggestRecipes } from './lib/api'
import { ChatInput } from './components/ChatInput'
import ImageUpload from './components/ImageUpload'
import IngredientReview from './components/IngredientReview'
import RecipeCard from './components/RecipeCard'
import Spinner from './components/Spinner'
import MyRecipesPage from './pages/MyRecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import './App.css'

// Splits a data URL ("data:image/png;base64,AAAA") into its media type and the
// raw base64 payload, which is what the /pantry/detect endpoint expects.
function parseDataUrl(dataUrl) {
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl ?? '')
  if (!match) return { mediaType: 'image/jpeg', data: '' }
  return { mediaType: match[1], data: match[2] }
}

function HomePage() {
  const [mode, setMode] = useState('photo') // photo | chat
  const [step, setStep] = useState('upload') // upload | detecting | review | suggesting | results
  const [ingredients, setIngredients] = useState([])
  const [recipes, setRecipes] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [error, setError] = useState(null)

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

  async function handleChatSubmit(message) {
    setError(null)
    setStep('suggesting')
    try {
      const result = await chatSuggestRecipes(message)
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('No recipes came back. Try rephrasing your request.')
      }
      setRecipes(result)
      setStep('results')
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong generating recipes.',
      )
      setStep('upload')
    }
  }

  function handleStartOver() {
    setStep('upload')
    setIngredients([])
    setRecipes([])
    setError(null)
  }

  function handleModeChange(newMode) {
    setMode(newMode)
    setError(null)
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>AI Sous Chef</h1>
        <p className="app__subtitle">Snap your ingredients, get recipes.</p>
        <Link className="app__link" to="/my-recipes">
          View saved recipes
        </Link>
      </header>

      {step === 'upload' && (
        <>
          <div className="app__mode-toggle" role="group" aria-label="Input mode">
            <button
              type="button"
              className={`app__mode-btn${mode === 'chat' ? ' app__mode-btn--active' : ''}`}
              onClick={() => handleModeChange('chat')}
            >
              💬 Describe it
            </button>
          </div>
          {error && (
            <p className="app__error" role="alert">
              {error}
            </p>
          )}
          {mode === 'photo' && <ImageUpload onImageSelected={handleImageSelected} />}
          {mode === 'chat' && <ChatInput onSubmit={handleChatSubmit} />}
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-recipes" element={<MyRecipesPage />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
