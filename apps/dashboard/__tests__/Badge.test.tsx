import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, StatusBadge } from '@repo/ui'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeTruthy()
  })
})

describe('StatusBadge', () => {
  const cases = [
    { status: 'pending',   label: 'Pending'   },
    { status: 'accepted',  label: 'Accepted'  },
    { status: 'preparing', label: 'Preparing' },
    { status: 'ready',     label: 'Ready'     },
    { status: 'completed', label: 'Completed' },
    { status: 'rejected',  label: 'Rejected'  },
    { status: 'cancelled', label: 'Cancelled' },
  ] as const

  for (const { status, label } of cases) {
    it(`renders "${label}" for ${status} status`, () => {
      render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeTruthy()
    })
  }

  it('renders unknown status string as-is', () => {
    render(<StatusBadge status="on_the_way" />)
    expect(screen.getByText('on_the_way')).toBeTruthy()
  })
})
