import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import RequestDecisionModal from '../../components/admin/RequestDecisionModal';

const POLL_MS = 20000;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function AdminHome() {
  const { user } = useAuth();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState('');
  const [fresh, setFresh] = useState(() => new Set());
  const [viewing, setViewing] = useState(null);
  const knownRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/requests');
      const list = res.data.requests;

      if (knownRef.current) {
        const arrived = list.filter((r) => !knownRef.current.has(r.id));
        if (arrived.length > 0) {
          arrived.forEach((r) => toast.info(`${r.studentName} sent an attendance request`));
          setFresh((prev) => new Set([...prev, ...arrived.map((r) => r.id)]));
        }
      }

      knownRef.current = new Set(list.map((r) => r.id));
      setRequests(list);
      setError('');
    } catch (err) {
      if (!knownRef.current) {
        setError(err.response?.data?.message || 'Could not connect to the server');
      }
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
            Welcome to your dashboard. Review the attendance requests sent by your students.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">Pending Requests</h3>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {requests ? requests.length : 0} pending
          </span>
        </div>

        {requests === null ? (
          <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
            {error || 'Loading…'}
          </p>
        ) : requests.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No pending requests.</p>
        ) : (
          <ul className="mt-4 max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {requests.map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-50 text-sm font-bold text-amber-700">
                  {r.studentName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{r.studentName}</span> sent an attendance request
                    {fresh.has(r.id) && (
                      <span className="ml-2 rounded-full bg-blue-700 px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {r.className}
                    {r.semester ? ` · ${r.semester}` : ''}
                    {r.rollNo ? ` · Roll ${r.rollNo}` : ''} · {formatTime(r.time)}
                  </p>
                </div>
                <button
                  onClick={() => setViewing(r)}
                  className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewing && (
        <RequestDecisionModal
          request={viewing}
          onClose={() => setViewing(null)}
          onDecided={load}
        />
      )}
    </div>
  );
}