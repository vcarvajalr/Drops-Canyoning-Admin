import { useCallback, useEffect, useMemo, useState } from 'react'

import api from '../api/client'

const initialForm = {
  name: '',
  location: '',
  difficulty: 'beginner',
  duration_minutes: 180,
  capacity: 8,
  price: '120.00',
  scheduled_at: '',
  meeting_point: '',
  status: 'open',
  description: '',
}

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [editingTripId, setEditingTripId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTrips = useCallback(async () => {
    try {
      const response = await api.get('/api/trips/')
      setTrips(response.data)
    } catch {
      setError('Could not load trips.')
    }
  }, [])

  useEffect(() => {
    void loadTrips()
  }, [loadTrips])

  const sortedTrips = useMemo(() => [...trips].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)), [trips])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleEdit = (trip) => {
    setEditingTripId(trip.id)
    setForm({
      ...trip,
      scheduled_at: trip.scheduled_at.slice(0, 16),
    })
    setSuccess('')
    setError('')
  }

  const resetForm = () => {
    setEditingTripId(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingTripId) {
        await api.patch(`/api/trips/${editingTripId}/`, form)
        setSuccess('Trip updated.')
      } else {
        await api.post('/api/trips/', form)
        setSuccess('Trip created.')
      }
      resetForm()
      await loadTrips()
    } catch {
      setError('Could not save the trip.')
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form className="rounded-2xl bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{editingTripId ? 'Edit trip' : 'Create trip'}</h2>
          <p className="text-sm text-slate-500">Maintain the canyoning inventory available for reservations.</p>
        </div>

        <div className="grid gap-3">
          {[
            ['name', 'Trip name'],
            ['location', 'Location'],
            ['meeting_point', 'Meeting point'],
          ].map(([name, label]) => (
            <label key={name} className="text-sm">
              <span className="mb-1 block text-slate-600">{label}</span>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name={name} value={form[name]} onChange={handleChange} required={name !== 'meeting_point'} />
            </label>
          ))}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Difficulty</span>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Status</span>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Duration (min)</span>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="number" min="30" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Capacity</span>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Price (USD)</span>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Schedule</span>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} required />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Description</span>
            <textarea className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" name="description" value={form.description} onChange={handleChange} />
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</p>}

        <div className="mt-5 flex gap-3">
          <button type="submit" className="rounded-xl bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-500">
            {editingTripId ? 'Update trip' : 'Create trip'}
          </button>
          <button type="button" className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Scheduled trips</h2>
          <p className="text-sm text-slate-500">Manage capacity, price, and schedule from a single place.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Trip</th>
                <th className="pb-3">Schedule</th>
                <th className="pb-3">Capacity</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTrips.map((trip) => (
                <tr key={trip.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <p className="font-medium">{trip.name}</p>
                    <p className="text-slate-500">{trip.location}</p>
                  </td>
                  <td className="py-3">{new Date(trip.scheduled_at).toLocaleString()}</td>
                  <td className="py-3">{trip.capacity}</td>
                  <td className="py-3">${trip.price}</td>
                  <td className="py-3 capitalize">{trip.status}</td>
                  <td className="py-3 text-right">
                    <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100" onClick={() => handleEdit(trip)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {sortedTrips.length === 0 && (
                <tr>
                  <td className="py-4 text-slate-400" colSpan="6">No trips available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
