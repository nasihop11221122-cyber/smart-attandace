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

  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';
  const roleName = roleLabels[user?.role] || '';

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-52 shrink-0 flex-col items-center gap-6 border-r border-slate-200 bg-white p-4">
        <div
          title={user?.name}
          className="mt-2 grid h-14 w-14 place-items-center rounded-full bg-blue-700 text-xl font-semibold text-white"
        >
          {initial}
        </div>

        <nav className="flex w-full flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6">
          <h1 className="text-lg font-semibold text-slate-800">{roleName}</h1>
        </header>

        <main className="flex-1 p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}