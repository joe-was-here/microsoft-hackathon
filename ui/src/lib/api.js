// Centralized API client for the AI Sous Chef backend.
// The base URL comes from the VITE_API_URL env var (set in Vercel for
// production, and in .env.local for local development). Falls back to the
// local FastAPI dev server.
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '')

async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export function getHealth() {
  return request('/')
}

export function getRecipes() {
  return request('/recipes')
}

export function getRecipeById(recipeId) {
  return request(`/recipes/${recipeId}`)
}

// Saves a manually-entered recipe to the shared My Recipes store
// (POST /recipes). The backend stamps it with source: "manual".
export function createRecipe(recipe) {
  return request('/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  })
}

// Sends a base64-encoded photo to the vision endpoint and returns the detected
// ingredients ({ ingredients: [{ name, confidence }] }).
export function detectIngredients(imageBase64, mediaType = 'image/jpeg') {
  return request('/pantry/detect', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64, media_type: mediaType }),
  })
}

export function saveRecipe(recipe) {
  return request('/recipes/', {
    method: 'POST',
    body: JSON.stringify(recipe),
  })
}

// Generates 3-5 recipe suggestions from a confirmed ingredient list.
export function suggestRecipes(ingredients) {
  return request('/recipes/suggest', {
    method: 'POST',
    body: JSON.stringify({ ingredients }),
  })
}

export { API_BASE_URL, request }
