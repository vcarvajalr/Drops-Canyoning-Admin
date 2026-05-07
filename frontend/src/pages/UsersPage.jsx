import { useCallback, useEffect, useState } from 'react'

import api from '../api/client'

const initialForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'staff',
  password: '',
  is_active: true,
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/users/')
      setUsers(response.data)
    } catch {
      setError('Could not load users.')
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEdit = (user) => {
    setEditingId(user.id)
    setForm({ ...user, password: '' })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const payload = { ...form }
      if (!payload.password) {
        delete payload.password
      }
      if (editingId) {
        await api.patch(`/api/users/${editingId}/`, payload)
        setSuccess('User updated.')
      } else {
        await api.post('/api/users/', payload)
        setSuccess('User created.')
      }
      resetForm()
      await loadUsers()
    } catch {
      setError('Could not save the user.')
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form className="rounded-2xl bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{editingId ? 'Edit user' : 'Create user'}</h2>
          <p className="text-sm text-slate-500">Manage who can access the Drops back office.</p>
        </div>

        <div className="grid gap-3">
          {[
            ['username', 'Username'],
            ['email', 'Email'],
            ['first_name', 'First name'],
            ['last_name', 'Last name'],
          ].map(([name, label]) => (
            <label key={name} className="text-sm">
              <span className="mb-1 block text-slate-600">{label}</span>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type={name === 'email' ? 'email' : 'text'} name={name} value={form[name]} onChange={handleChange} required={name === 'username' || name === 'email'} />
            </label>
          ))}
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Role</span>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Password {editingId && '(leave empty to keep current password)'}</span>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="password" name="password" value={form.password} onChange={handleChange} required={!editingId} minLength="8" />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Active user
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</p>}

        <div className="mt-5 flex gap-3">
          <button type="submit" className="rounded-xl bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-500">
            {editingId ? 'Update user' : 'Create user'}
          </button>
          <button type="button" className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Staff directory</h2>
          <p className="text-sm text-slate-500">Only admins and managers can access this section.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <p className="font-medium">{user.first_name || user.username}</p>
                    <p className="text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">{user.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="py-3 text-right">
                    <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="py-4 text-slate-400" colSpan="4">No staff users available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
