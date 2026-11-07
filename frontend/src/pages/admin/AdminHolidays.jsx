import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import CreateHolidayModal from '../../components/admin/CreateHolidayModal';
import DeleteHolidayModal from '../../components/admin/DeleteHolidayModal';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/holidays');
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Holidays & Days Off
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Dates where no attendance is taken and students are excused.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <span>Add Holiday</span>
        </button>
      </div>

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
                className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden bg-white border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-lg hover:-translate-y-1 dark:bg-[#0b1f2a] dark:border-teal-900/40 dark:shadow-none p-5 flex flex-col justify-between min-h-[170px] ${
                  past ? 'opacity-65' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </span>
                        <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                          {h.title || 'Holiday'}
                        </h3>
                      </div>
                      <p className="mt-2.5 text-xs font-semibold text-teal-700 dark:text-teal-300">{formatDate(h.date)}</p>
                    </div>

                    <button
                      onClick={() => setDeleting(h)}
                      title="Delete"
                      aria-label="Delete holiday"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-red-200/60 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-700 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{h.date}</span>
                  {h.date === today ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                      Today
                    </span>
                  ) : past ? (
                    <span className="text-slate-400">Past</span>
                  ) : (
                    <span className="text-teal-600 dark:text-teal-400 font-medium">Upcoming</span>
                  )}
                </div>
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