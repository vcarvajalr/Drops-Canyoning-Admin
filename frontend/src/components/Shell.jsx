import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

const navItemClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`

export default function Shell() {
  const { logout, user } = useAuth()
  const canManageUsers = ['admin', 'manager'].includes(user?.role)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Drops Canyoning</p>
            <h1 className="text-xl font-semibold">Admin Console</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium">{user?.first_name || user?.username}</p>
              <p className="text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl bg-white p-4 shadow-sm">
          <nav className="flex flex-col gap-2">
            <NavLink to="/" end className={navItemClass}>
              Dashboard
            </NavLink>
            <NavLink to="/trips" className={navItemClass}>
              Trips
            </NavLink>
            <NavLink to="/reservations" className={navItemClass}>
              Reservations
            </NavLink>
            {canManageUsers && (
              <NavLink to="/users" className={navItemClass}>
                Users
              </NavLink>
            )}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
