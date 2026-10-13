import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AttendanceOverview from '../components/principle/AttendanceOverview';

const POLL_MS = 20000;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

function Svg({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function AnimatedNumber({ value }) {
  const [shown, setShown] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const from = previous.current;
    const start = performance.now();
    const duration = 700;
    let frame;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{shown}</>;
}

function StatCard({ to, title, value, hint, linkLabel, gradient, icon }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-4xl font-bold text-slate-800">
            <AnimatedNumber value={value} />
          </p>
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        </div>
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${gradient}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-1 border-t border-slate-100 pt-4 text-sm font-semibold text-blue-700">
        {linkLabel}
        <Svg className="h-4 w-4 transition group-hover:translate-x-1">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </Svg>
      </div>
    </Link>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/super-admin/overview');
      setData(res.data);
      setError('');
    } catch (err) {
      setError((prev) => prev || err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!data) return <p className="text-red-600">{error || 'Could not load the dashboard'}</p>;

  const { totals, today: todayStats } = data;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-14 right-28 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm text-blue-100">{today}</p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {greeting()}, {user?.name}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-blue-100">
            Welcome to your dashboard. Here is what is happening across both the offline and the
            online system.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Today's overview</h3>
            <p className="text-sm text-slate-500">Students of the offline and the online system</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            Live
          </span>
        </div>

        <AttendanceOverview
          showCards={false}
          stats={{
            totalTeachers: 0,
            totalStudents: totals.students,
            present: todayStats.present,
            absent: todayStats.absent,
            leave: todayStats.leave,
          }}
          notifications={todayStats.events}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          to="/super-admin/students"
          title="Offline Students"
          value={totals.offline}
          hint="Students of the school system"
          linkLabel="View students"
          gradient="from-emerald-500 to-teal-600"
          icon={
            <Svg className="h-6 w-6">
              <path d="M22 10L12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </Svg>
          }
        />
        <StatCard
          to="/super-admin/students"
          title="Online Students"
          value={totals.online}
          hint="Students of the college system"
          linkLabel="View students"
          gradient="from-blue-600 to-indigo-600"
          icon={
            <Svg className="h-6 w-6">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </Svg>
          }
        />
      </div>
    </div>
  );
}