// Centralized API client for the AI Sous Chef backend.
// The base URL comes from the VITE_API_URL env var (set in Vercel for
// production, and in .env.local for local development). Falls back to the
// local FastAPI dev server.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  return request('/recipes/')
}

// Generates 3-5 recipe suggestions from a confirmed ingredient list.
export function suggestRecipes(ingredients) {
  return request('/recipes/suggest', {
    method: 'POST',
    body: JSON.stringify({ ingredients }),
  })
}

export { API_BASE_URL, request }
