import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ImageUpload from './ImageUpload'

function createImage(name, type) {
  return new File(['fake-bytes'], name, { type })
}

describe('ImageUpload', () => {
  it('renders camera and file picker actions', () => {
    render(<ImageUpload />)
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Choose file' })).toBeDefined()
  })

  it('rejects non JPEG/PNG files', async () => {
    const onImageSelected = vi.fn()
    const { container } = render(<ImageUpload onImageSelected={onImageSelected} />)
    const fileInput = container.querySelectorAll('input[type="file"]')[1]

    fireEvent.change(fileInput, {
      target: { files: [createImage('notes.gif', 'image/gif')] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please choose a JPEG or PNG image.',
    )
    expect(onImageSelected).not.toHaveBeenCalled()
  })

  it('reads a valid image and reports the base64 data and preview', async () => {
    const onImageSelected = vi.fn()
    const { container } = render(<ImageUpload onImageSelected={onImageSelected} />)
    const fileInput = container.querySelectorAll('input[type="file"]')[1]

    fireEvent.change(fileInput, {
      target: { files: [createImage('fridge.png', 'image/png')] },
    })

    await waitFor(() => expect(onImageSelected).toHaveBeenCalledTimes(1))
    expect(onImageSelected).toHaveBeenCalledWith(
      expect.stringContaining('data:image/png;base64,'),
    )
    expect(screen.getByAltText('Selected ingredients')).toBeDefined()
  })
})
