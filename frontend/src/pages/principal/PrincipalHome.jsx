import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AttendanceOverview from '../../components/principle/AttendanceOverview';

const POLL_MS = 20000;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

export default function PrincipalHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [fresh, setFresh] = useState(() => new Set());
  const knownRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/principal/dashboard');
      const payload = res.data;

      if (knownRef.current) {
        const arrived = payload.notifications.filter((n) => !knownRef.current.has(n.id));
        if (arrived.length > 0) {
          arrived.forEach((n) =>
            toast.info(`${n.className} attendance submitted by ${n.teacherName}`)
          );
          setFresh((prev) => new Set([...prev, ...arrived.map((n) => n.id)]));
        }
      }

      knownRef.current = new Set(payload.notifications.map((n) => n.id));
      setData(payload);
      setError('');
    } catch (err) {
      if (!knownRef.current) {
        setError(err.response?.data?.message || 'Could not connect to the server');
      }
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

  const { totals, notifications } = data;
  const classTotal = Math.max(totals.classes, totals.submittedToday);

  const sumOf = (key) => notifications.reduce((total, n) => total + (n[key] || 0), 0);
  const stats = {
    totalTeachers: totals.teachers,
    totalStudents: totals.students,
    present: sumOf('present'),
    absent: sumOf('absent'),
    leave: sumOf('leave'),
  };

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
            Welcome to your dashboard. Here is what is happening across your school today.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Today's overview</h3>
            <p className="text-sm text-slate-500">Teachers, students and attendance</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            Live
          </span>
        </div>

        <AttendanceOverview stats={stats} notifications={notifications} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {totals.submittedToday} of {classTotal} classes submitted today
          </span>
        </div>

        {notifications.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No class has submitted attendance yet today.
          </p>
        ) : (
          <ul className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-green-600">
                  <Svg className="h-4 w-4">
                    <polyline points="20 6 9 17 4 12" />
                  </Svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{n.className}</span> attendance submitted by{' '}
                    {n.teacherName}
                    {fresh.has(n.id) && (
                      <span className="ml-2 rounded-full bg-blue-700 px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatTime(n.time)} · Present {n.present} · Absent {n.absent} · Leave {n.leave}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          to="/principal/teacher"
          title="All Teachers"
          value={totals.teachers}
          hint="Form masters of your classes"
          linkLabel="View all teachers"
          gradient="from-blue-600 to-indigo-600"
          icon={
            <Svg className="h-6 w-6">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </Svg>
          }
        />
        <StatCard
          to="/principal/history"
          title="All Students"
          value={totals.students}
          hint={`Across ${totals.classes} ${totals.classes === 1 ? 'class' : 'classes'}`}
          linkLabel="View classes and attendance"
          gradient="from-emerald-500 to-teal-600"
          icon={
            <Svg className="h-6 w-6">
              <path d="M22 10L12 5 2 10l10 5 10-5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </Svg>
          }
        />
      </div>
    </div>
  );
}