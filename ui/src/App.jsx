import { useEffect, useState } from 'react'
import { getHealth } from './lib/api'
import ImageUpload from './components/ImageUpload'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <main className="app">
      <header className="app__header">
        <h1>AI Sous Chef</h1>
        <p className="app__subtitle">Snap your ingredients, get recipes.</p>
        <p className="app__status">Backend: {apiStatus}</p>
      </header>

      <ImageUpload onImageSelected={setSelectedImage} />

      {selectedImage && (
        <p className="app__hint">Photo ready — ingredient detection coming next.</p>
      )}
    </main>
  )
}

export default App
