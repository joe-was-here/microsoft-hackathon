import { useRef, useState } from 'react'
import './ImageUpload.css'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}

function ImageUpload({ onImageSelected }) {
  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | reading | error
  const [errorMessage, setErrorMessage] = useState('')

  async function handleFile(file) {
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setStatus('error')
      setErrorMessage('Please choose a JPEG or PNG image.')
      return
    }

    setStatus('reading')
    setErrorMessage('')

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPreview(dataUrl)
      onImageSelected?.(dataUrl)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong.',
      )
    }
  }

  function handleInputChange(event) {
    const [file] = event.target.files ?? []
    handleFile(file)
    // Reset so selecting the same file again still fires onChange.
    event.target.value = ''
  }

  const isBusy = status === 'reading'

  return (
    <div className="image-upload">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="image-upload__input"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="image-upload__input"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {preview ? (
        <div className="image-upload__preview">
          <img src={preview} alt="Selected ingredients" />
        </div>
      ) : (
        <div className="image-upload__placeholder">
          <span role="img" aria-label="camera">
            📷
          </span>
          <p>Snap or upload a photo of your ingredients</p>
        </div>
      )}

      <div className="image-upload__actions">
        <button
          type="button"
          className="image-upload__button image-upload__button--primary"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isBusy}
        >
          Take photo
        </button>
        <button
          type="button"
          className="image-upload__button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
        >
          Choose file
        </button>
      </div>

      {status === 'reading' && (
        <p className="image-upload__status">Loading image…</p>
      )}
      {status === 'error' && (
        <p className="image-upload__status image-upload__status--error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default ImageUpload
