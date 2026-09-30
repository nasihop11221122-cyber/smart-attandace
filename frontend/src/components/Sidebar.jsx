import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
      <div
        title={user.name}
        className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-blue-700 text-lg font-bold text-white"
      >
        {user.name.charAt(0).toUpperCase()}
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink to="/super-admin" end className={navClass}>
          Overview
        </NavLink>
        <NavLink to="/super-admin/principal" className={navClass}>
          Principal
        </NavLink>
        <NavLink to="/super-admin/admin" className={navClass}>
          Admin
        </NavLink>
        <NavLink to="/super-admin/teachers" className={navClass}>
          Teachers
        </NavLink>
        <NavLink to="/super-admin/students" className={navClass}>
          Students
        </NavLink>
        <NavLink to="/super-admin/profile" className={navClass}>
          Profile
        </NavLink>
      </nav>

      <div className="flex-1" />

      <button
        onClick={logout}
        className="rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-slate-50"
      >
        Log out
      </button>
    </aside>
  );
}