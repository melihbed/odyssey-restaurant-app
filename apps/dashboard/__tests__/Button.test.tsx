import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@repo/ui'

describe('Button', () => {
  it('renders label', () => {
    render(<Button>Save</Button>)
    expect(screen.getByText('Save')).toBeTruthy()
  })

  it('shows spinner and hides label when loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.queryByText('Save')).toBeNull()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Save</Button>)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Save</Button>)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('fires onPress when pressed', () => {
    const onPress = vi.fn()
    render(<Button onPress={onPress}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onPress).toHaveBeenCalledOnce()
  })
})
