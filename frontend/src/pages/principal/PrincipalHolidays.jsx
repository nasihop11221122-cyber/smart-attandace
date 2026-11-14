import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Plus, Trash2, Repeat, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import WeeklyOffCard from '../../components/holidays/WeeklyOffCard';
import CreateHolidayModal from '../../components/holidays/CreateHolidayModal';
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
  const [weeklyOffs, setWeeklyOffs] = useState([0]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/principal/holidays');
      setHolidays(res.data.holidays || []);
      setWeeklyOffs(res.data.weeklyOffs || [0]);
      setToday(res.data.today || '');
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            School Holidays & Days Off
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Configure weekly recurring off days, vacations, and annual school holidays.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      {/* 1. Permanent Weekly Offs Configuration Card */}
      <WeeklyOffCard
        endpoint="/principal/holidays"
        initialDays={weeklyOffs}
        onUpdated={(newDays) => setWeeklyOffs(newDays)}
      />

      {/* 2. Specific & Annual Holidays List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Special & Annual School Holidays</span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-xs font-bold">
              {holidays.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading…</p>
        ) : holidays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-500">
            <Calendar className="h-10 w-10 mx-auto text-slate-400 mb-2 opacity-50" />
            <p className="text-sm font-semibold">No specific holidays added yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Press "Add Holiday" above to add single dates, multi-day vacation ranges, or annual recurring holidays.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {holidays.map((h) => {
              const past = today && h.date < today && !h.isAnnual;
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
                            {h.isAnnual ? (
                              <Repeat className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                          </span>
                          <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                            {h.title || 'School Holiday'}
                          </h3>
                        </div>
                        <p className="mt-2.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                          {formatDate(h.date)}
                        </p>
                      </div>

                      <button
                        onClick={() => setDeleting(h)}
                        title="Delete"
                        aria-label="Delete holiday"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-red-200/60 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{h.date}</span>
                    <div className="flex items-center gap-1.5">
                      {h.isAnnual && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-[10px]">
                          <Repeat className="h-3 w-3" /> Annual
                        </span>
                      )}
                      {h.date === today ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[10px]">
                          Today
                        </span>
                      ) : past ? (
                        <span className="text-slate-400 text-[11px]">Past</span>
                      ) : (
                        <span className="text-teal-600 dark:text-teal-400 font-medium text-[11px]">Upcoming</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {creating && (
        <CreateHolidayModal
          endpoint="/principal/holidays"
          weeklyOffs={weeklyOffs}
          onClose={() => setCreating(false)}
          onCreated={load}
        />
      )}
      {deleting && (
        <DeleteHolidayModal holiday={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
}
