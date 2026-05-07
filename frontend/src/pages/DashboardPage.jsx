import { useEffect, useState } from 'react'

import api from '../api/client'
import { useAuth } from '../auth/AuthContext'

const emptyCounts = {
  trips: 0,
  reservations: 0,
  payments: 0,
  users: 0,
}

function StatCard({ label, value, helper }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </article>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [counts, setCounts] = useState(emptyCounts)
  const [recentPayments, setRecentPayments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [
          api.get('/api/trips/'),
          api.get('/api/reservations/'),
          api.get('/api/payments/'),
        ]

        if (['admin', 'manager'].includes(user?.role)) {
          requests.push(api.get('/api/users/'))
        }

        const [tripsResponse, reservationsResponse, paymentsResponse, usersResponse] = await Promise.all(requests)
        setCounts({
          trips: tripsResponse.data.length,
          reservations: reservationsResponse.data.length,
          payments: paymentsResponse.data.length,
          users: usersResponse?.data.length ?? 0,
        })
        setRecentPayments(paymentsResponse.data.slice(0, 5))
      } catch {
        setError('Could not load dashboard metrics.')
      }
    }

    load()
  }, [user?.role])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Operations dashboard</h2>
        <p className="text-slate-500">Monitor trips, reservations, staff, and PayPal payment progress.</p>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Trips" value={counts.trips} helper="Active and draft canyoning experiences" />
        <StatCard label="Reservations" value={counts.reservations} helper="Pending and confirmed booking records" />
        <StatCard label="Payments" value={counts.payments} helper="PayPal order tracking and reconciliation" />
        <StatCard label="Staff users" value={counts.users} helper="Admin and reservation management access" />
      </div>

      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Recent payments</h3>
            <p className="text-sm text-slate-500">Latest PayPal orders captured by the admin backend.</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Order</th>
                <th className="pb-3">Reservation</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium">{payment.external_order_id || `Draft #${payment.id}`}</td>
                  <td className="py-3">{payment.reservation?.reservation_code}</td>
                  <td className="py-3 capitalize">{payment.status}</td>
                  <td className="py-3">{payment.amount} {payment.currency}</td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr>
                  <td className="py-4 text-slate-400" colSpan="4">
                    No payments available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
