import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../components/KpiCard'

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total Orders" value="142" />)
    expect(screen.getByText('Total Orders')).toBeTruthy()
    expect(screen.getByText('142')).toBeTruthy()
  })

  it('renders subvalue when provided', () => {
    render(<KpiCard label="Revenue" value="$1,200" subvalue="This month" />)
    expect(screen.getByText('This month')).toBeTruthy()
  })

  it('does not render subvalue when omitted', () => {
    render(<KpiCard label="Revenue" value="$1,200" />)
    expect(screen.queryByText('This month')).toBeNull()
  })

  it('renders upward trend indicator for positive trend', () => {
    render(<KpiCard label="Orders" value="42" trend={{ value: '12%', positive: true }} />)
    expect(screen.getByText(/↑.*12%/)).toBeTruthy()
  })

  it('renders downward trend indicator for negative trend', () => {
    render(<KpiCard label="Orders" value="10" trend={{ value: '5%', positive: false }} />)
    expect(screen.getByText(/↓.*5%/)).toBeTruthy()
  })

  it('does not render trend when omitted', () => {
    render(<KpiCard label="Orders" value="42" />)
    expect(screen.queryByText(/[↑↓]/)).toBeNull()
  })
})
