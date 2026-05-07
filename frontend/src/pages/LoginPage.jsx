import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

const initialState = {
  username: '',
  password: '',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
      navigate('/')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Drops Canyoning</p>
        <h1 className="mt-3 text-3xl font-semibold">Admin login</h1>
        <p className="mt-2 text-sm text-slate-400">Use your staff credentials to manage trips, reservations, and payments.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Username</span>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none ring-0 transition focus:border-cyan-400"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Password</span>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none ring-0 transition focus:border-cyan-400"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          {error && <p className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-300">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
