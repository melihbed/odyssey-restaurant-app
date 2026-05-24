import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState, ErrorState } from '@repo/ui'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No orders yet" />)
    expect(screen.getByText('No orders yet')).toBeTruthy()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="No orders" description="Place your first order to get started" />)
    expect(screen.getByText('Place your first order to get started')).toBeTruthy()
  })

  it('does not render description when omitted', () => {
    render(<EmptyState title="No orders" />)
    expect(screen.queryByText('Place your first order to get started')).toBeNull()
  })

  it('renders action button when actionLabel and onAction are both provided', () => {
    render(<EmptyState title="No orders" actionLabel="Create order" onAction={vi.fn()} />)
    expect(screen.getByText('Create order')).toBeTruthy()
  })

  it('does not render action button when onAction is missing', () => {
    render(<EmptyState title="No orders" actionLabel="Create order" />)
    expect(screen.queryByText('Create order')).toBeNull()
  })

  it('calls onAction when action button is pressed', () => {
    const onAction = vi.fn()
    render(<EmptyState title="No orders" actionLabel="Create order" onAction={onAction} />)
    fireEvent.click(screen.getByText('Create order'))
    expect(onAction).toHaveBeenCalledOnce()
  })
})

describe('ErrorState', () => {
  it('renders default title', () => {
    render(<ErrorState />)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('renders custom title', () => {
    render(<ErrorState title="Failed to load menu" />)
    expect(screen.getByText('Failed to load menu')).toBeTruthy()
  })

  it('renders retry button when onRetry is provided', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    expect(screen.getByText('Try again')).toBeTruthy()
  })

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Try again'))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not render retry button when onRetry is omitted', () => {
    render(<ErrorState />)
    expect(screen.queryByText('Try again')).toBeNull()
  })
})
