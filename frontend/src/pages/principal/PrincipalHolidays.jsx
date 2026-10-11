import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import CreateHolidayModal from '../../components/principle/CreateHolidayModal';
import DeleteHolidayModal from '../../components/principle/DeleteHolidayModal';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function PrincipalHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/principal/holidays');
      setHolidays(res.data.holidays);
      setToday(res.data.today);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">Holidays</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        A holiday is for all classes. Teachers cannot mark attendance on that day.
      </p>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : holidays.length === 0 ? (
        <p className="mt-6 text-slate-500">No holidays yet. Press Create to add the first one.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {holidays.map((h) => {
            const past = today && h.date < today;
            return (
              <div
                key={h.id}
                className={`rounded-xl border border-slate-200 bg-white p-5 ${past ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-800">
                      {h.title || 'Holiday'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(h.date)}</p>
                  </div>

                  <button
                    onClick={() => setDeleting(h)}
                    title="Delete"
                    aria-label="Delete holiday"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>

                {h.date === today && (
                  <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Today
                  </span>
                )}
                {past && (
                  <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Past
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && <CreateHolidayModal onClose={() => setCreating(false)} onCreated={load} />}
      {deleting && (
        <DeleteHolidayModal holiday={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
}