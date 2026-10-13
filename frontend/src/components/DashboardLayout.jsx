import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  History as HistoryIcon,
  ClipboardCheck,
  Sliders,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSystem } from '../context/SystemContext';

const iconMap = {
  overview: LayoutDashboard,
  principal: Building2,
  admin: ShieldCheck,
  teachers: GraduationCap,
  teacher: GraduationCap,
  students: Users,
  classes: BookOpen,
  holidays: Calendar,
  history: HistoryIcon,
  attendance: ClipboardCheck,
  settings: Sliders,
  profile: UserCircle,
};

export default function DashboardLayout({ children, links = [] }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { themeMode, toggleThemeMode, emergencyMode } = useSystem();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';
  const roleKey = `${user?.role}_role`;
  const roleName = t(roleKey) || user?.role?.replace('_', ' ') || '';

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
    setSidebarOpen(false);
  };

  const getLinkLabel = (link) => {
    const key = (link.key || link.label || '').toLowerCase();
    const translated = t(key);
    return translated !== key ? translated : link.label;
  };

  const getLinkIcon = (link) => {
    const key = (link.key || link.label || '').toLowerCase();
    const IconComponent = iconMap[key] || LayoutDashboard;
    return <IconComponent className="h-4 w-4 shrink-0" />;
  };

  return (
    <div className="min-h-screen theme-app flex transition-colors duration-200">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        } z-50 h-full w-60 shrink-0 flex flex-col border-[var(--border)] bg-[var(--bg-surface)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              title={user?.name}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-sm font-black text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)]"
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
                Smart Attendance
              </p>
              <p className="truncate text-[11px] font-semibold text-[var(--primary)]">
                {roleName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Emergency Alert Mini Banner inside sidebar if active */}
        {emergencyMode && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 text-xs font-bold text-red-400 animate-pulse">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="truncate">LOCKDOWN ACTIVE</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex w-full flex-1 flex-col gap-1.5 p-3 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)] font-bold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
                }`
              }
            >
              {getLinkIcon(link)}
              <span className="truncate">{getLinkLabel(link)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          isRTL ? 'lg:pr-60' : 'lg:pl-60'
        }`}
      >
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-main)]">
              {roleName}
            </h1>
          </div>

          {/* Quick Header Controls (Dark/Light Mode & Language Pill) */}
          <div className="flex items-center gap-2">
            {/* Theme mode toggle */}
            <button
              onClick={toggleThemeMode}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-focus)] transition"
              title="Toggle Light / Dark Mode"
            >
              {themeMode === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button>

            {/* Language Quick Switcher */}
            <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1 text-xs font-bold">
              {['en', 'ar', 'ur'].map((code) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] uppercase transition ${
                    language === code
                      ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children ?? <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}