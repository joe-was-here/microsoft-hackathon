import { useState } from 'react'
import './ChatInput.css'

export const ChatInput = ({ onSubmit, disabled }) => {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSubmit(event)
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <label className="chat-input__label" htmlFor="chat-message">
        Describe what you want to cook
      </label>
      <textarea
        id="chat-message"
        className="chat-input__textarea"
        placeholder="e.g. I have cucumber and cilantro, I want something spicy"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        disabled={disabled}
      />
      <p className="chat-input__hint">Tip: ⌘ + Enter to submit</p>
      <button
        type="submit"
        className="chat-input__button"
        disabled={disabled || !message.trim()}
      >
        Get recipes
      </button>
    </form>
  )
}
