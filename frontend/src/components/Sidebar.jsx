import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

const drawerClass = ({ isActive }) =>
  `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/super-admin', label: 'Overview', end: true },
    { to: '/super-admin/principal', label: 'Principal' },
    { to: '/super-admin/admin', label: 'Admin' },
    { to: '/super-admin/teachers', label: 'Teachers' },
    { to: '/super-admin/students', label: 'Students' },
    { to: '/super-admin/profile', label: 'Profile' },
  ];

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <div
            title={user.name}
            className="grid h-11 w-11 place-items-center rounded-full bg-blue-700 text-lg font-bold text-white"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-5 hidden lg:block">
          <div
            title={user.name}
            className="grid h-11 w-11 place-items-center rounded-full bg-blue-700 text-lg font-bold text-white"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) => navClass({ isActive })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <button
          onClick={() => {
            logout();
            onClose?.();
          }}
          className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}