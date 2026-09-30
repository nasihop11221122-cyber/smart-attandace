import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-52 shrink-0 flex-col justify-end border-r border-slate-200 bg-white p-4">
        <button
          onClick={onLogout}
          className="rounded-md bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800"
        >
          Log out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
          <div
            title={user?.name}
            className="grid h-9 w-9 place-items-center rounded-full bg-blue-700 font-semibold text-white"
          >
            {initial}
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}