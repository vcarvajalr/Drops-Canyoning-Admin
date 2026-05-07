import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AuthContext } from '../auth/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

function renderProtectedRoute(value) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderProtectedRoute({ isAuthenticated: true, isLoading: false })
    expect(screen.getByText('Secret dashboard')).toBeInTheDocument()
  })

  it('shows loading state while session boots', () => {
    renderProtectedRoute({ isAuthenticated: false, isLoading: true })
    expect(screen.getByText('Loading session...')).toBeInTheDocument()
  })
})
