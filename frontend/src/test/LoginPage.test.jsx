import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AuthContext } from '../auth/AuthContext'
import LoginPage from '../pages/LoginPage'

describe('LoginPage', () => {
  it('renders the login form copy', () => {
    render(
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.getByRole('heading', { name: 'Admin login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
})
