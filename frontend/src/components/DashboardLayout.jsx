import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  principal: 'Principal',
  teacher: 'Teacher',
  student: 'Student',
};

export default function DashboardLayout({ children, links = [] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';
  const roleName = roleLabels[user?.role] || '';

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-52 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 lg:hidden">
          <div
            title={user?.name}
            className="grid h-10 w-10 place-items-center rounded-full bg-blue-700 text-lg font-semibold text-white"
          >
            {initial}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex h-16 items-center border-b border-slate-200 px-4 hidden lg:flex">
          <div
            title={user?.name}
            className="grid h-10 w-10 place-items-center rounded-full bg-blue-700 text-lg font-semibold text-white"
          >
            {initial}
          </div>
        </div>

        <nav className="flex w-full flex-1 flex-col gap-1 pt-4 px-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 py-2.5 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-52">
        <header className="fixed top-0 right-0 z-40 h-16 w-full lg:w-auto lg:static lg:left-52 border-b border-slate-200 bg-white px-4 lg:px-6 lg:z-auto">
          <div className="flex items-center justify-between h-full">
            <button
              className="lg:hidden mr-4 rounded-md p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{roleName}</h1>
          </div>
        </header>

        <main className="flex-1 pt-16 p-4 lg:p-6 lg:pt-0">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}