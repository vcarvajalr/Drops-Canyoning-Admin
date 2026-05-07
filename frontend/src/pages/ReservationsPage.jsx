import { useEffect, useState } from 'react'

import api from '../api/client'

const initialForm = {
  customer_id: '',
  trip_id: '',
  participants: 1,
  status: 'pending',
  notes: '',
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [customers, setCustomers] = useState([])
  const [trips, setTrips] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      const [reservationsResponse, customersResponse, tripsResponse] = await Promise.all([
        api.get('/api/reservations/'),
        api.get('/api/customers/'),
        api.get('/api/trips/'),
      ])
      setReservations(reservationsResponse.data)
      setCustomers(customersResponse.data)
      setTrips(tripsResponse.data)
      if (!form.customer_id && customersResponse.data[0]) {
        setForm((current) => ({
          ...current,
          customer_id: String(customersResponse.data[0].id),
          trip_id: String(tripsResponse.data[0]?.id ?? ''),
        }))
      }
    } catch {
      setError('Could not load reservations data.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleEdit = (reservation) => {
    setEditingId(reservation.id)
    setForm({
      customer_id: String(reservation.customer.id),
      trip_id: String(reservation.trip.id),
      participants: reservation.participants,
      status: reservation.status,
      notes: reservation.notes,
    })
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
      const payload = {
        ...form,
        participants: Number(form.participants),
      }
      if (editingId) {
        await api.patch(`/api/reservations/${editingId}/`, payload)
        setSuccess('Reservation updated.')
      } else {
        await api.post('/api/reservations/', payload)
        setSuccess('Reservation created.')
      }
      resetForm()
      await loadData()
    } catch {
      setError('Could not save the reservation.')
    }
  }

  const handleCreatePayment = async (reservationId) => {
    setError('')
    setSuccess('')

    try {
      await api.post('/api/payments/create-paypal-order/', { reservation_id: reservationId, currency: 'USD' })
      setSuccess('PayPal order created.')
      await loadData()
    } catch {
      setError('Could not create the PayPal order.')
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form className="rounded-2xl bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{editingId ? 'Edit reservation' : 'Create reservation'}</h2>
          <p className="text-sm text-slate-500">Assign customers to trips and track booking payment progress.</p>
        </div>

        <div className="grid gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Customer</span>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="customer_id" value={form.customer_id} onChange={handleChange} required>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.first_name} {customer.last_name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Trip</span>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="trip_id" value={form.trip_id} onChange={handleChange} required>
              <option value="">Select trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.name} — {new Date(trip.scheduled_at).toLocaleDateString()}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Participants</span>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="number" min="1" name="participants" value={form.participants} onChange={handleChange} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Status</span>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Notes</span>
            <textarea className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" name="notes" value={form.notes} onChange={handleChange} />
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</p>}

        <div className="mt-5 flex gap-3">
          <button type="submit" className="rounded-xl bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-500">
            {editingId ? 'Update reservation' : 'Create reservation'}
          </button>
          <button type="button" className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-100" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Reservations</h2>
          <p className="text-sm text-slate-500">Payment summary updates automatically as PayPal webhook events arrive.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Reservation</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Trip</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-slate-100 align-top">
                  <td className="py-3">
                    <p className="font-medium">{reservation.reservation_code}</p>
                    <p className="text-slate-500 capitalize">{reservation.status}</p>
                  </td>
                  <td className="py-3">{reservation.customer.first_name} {reservation.customer.last_name}</td>
                  <td className="py-3">{reservation.trip.name}</td>
                  <td className="py-3">${reservation.total_amount}</td>
                  <td className="py-3">
                    <p className="capitalize">{reservation.payment_status}</p>
                    <p className="text-slate-500">Paid: ${reservation.payment_summary.total_paid}</p>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100" onClick={() => handleEdit(reservation)}>
                        Edit
                      </button>
                      <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500" onClick={() => handleCreatePayment(reservation.id)}>
                        PayPal order
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td className="py-4 text-slate-400" colSpan="6">No reservations created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
