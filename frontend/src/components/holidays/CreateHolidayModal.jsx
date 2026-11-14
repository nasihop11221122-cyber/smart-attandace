import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Calendar, CalendarRange, Repeat, X, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CreateHolidayModal({
  endpoint = '/admin/holidays',
  weeklyOffs = [0],
  onClose,
  onCreated,
}) {
  const [mode, setMode] = useState('single'); // 'single' | 'range'
  const [form, setForm] = useState({
    date: '',
    startDate: '',
    endDate: '',
    title: '',
    isAnnual: false,
  });
  const [busy, setBusy] = useState(false);

  // Check if chosen single date falls on a weekly off
  const singleDateDayOff = useMemo(() => {
    if (!form.date) return null;
    const [y, m, d] = form.date.split('-').map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (weeklyOffs.includes(day)) {
      return DAYS_OF_WEEK[day];
    }
    return null;
  }, [form.date, weeklyOffs]);

  // Calculate range days
  const rangeDaysCount = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    if (form.startDate > form.endDate) return -1;
    const s = new Date(`${form.startDate}T00:00:00Z`);
    const e = new Date(`${form.endDate}T00:00:00Z`);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [form.startDate, form.endDate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === 'single') {
        if (!form.date) {
          toast.error('Please select a date');
          setBusy(false);
          return;
        }
        await api.post(endpoint, {
          date: form.date,
          title: form.title.trim(),
          isAnnual: form.isAnnual,
        });
        toast.success(
          form.isAnnual
            ? 'Annual recurring holiday added successfully!'
            : 'Holiday added successfully!'
        );
      } else {
        if (!form.startDate || !form.endDate) {
          toast.error('Please select both start and end date');
          setBusy(false);
          return;
        }
        if (form.startDate > form.endDate) {
          toast.error('Start date cannot be after end date');
          setBusy(false);
          return;
        }
        const res = await api.post(endpoint, {
          startDate: form.startDate,
          endDate: form.endDate,
          title: form.title.trim() || 'Holiday Break',
        });
        toast.success(res.data?.message || 'Date range holidays added successfully!');
      }

      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save holiday');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Holiday</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify official days off where no attendance will be marked.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 p-1 border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'single'
                  ? 'bg-white dark:bg-[#0b1f2a] text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Single / Annual Day</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'range'
                  ? 'bg-white dark:bg-[#0b1f2a] text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarRange className="h-4 w-4" />
              <span>Date Range (Vacations)</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          {mode === 'single' ? (
            <>
              {/* Single Date */}
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Select Holiday Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </label>

              {/* Weekly off notice if matches */}
              {singleDateDayOff && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Notice:</span> This date falls on{' '}
                    <span className="font-bold underline">{singleDateDayOff}</span>, which is already
                    active in your Weekly Off settings! You can still submit if you want an official
                    name attached to it.
                  </div>
                </div>
              )}

              {/* Annual Recurring Checkbox */}
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition">
                <input
                  type="checkbox"
                  checked={form.isAnnual}
                  onChange={(e) => setForm({ ...form, isAnnual: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Repeat className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Repeat Every Year (Permanent Annual Holiday)</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically recurs every year on this exact date (e.g. 14 August, 25 December, 1 May).
                  </p>
                </div>
              </label>
            </>
          ) : (
            <>
              {/* Date Range Start & End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Start Date (From)</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>End Date (To)</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
              </div>

              {/* Range calculation badge */}
              {rangeDaysCount > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 p-3 text-xs text-teal-800 dark:text-teal-300">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>
                    Range detected: <span className="font-bold">{rangeDaysCount} consecutive days</span> will be added as holidays in one click!
                  </span>
                </div>
              )}
              {rangeDaysCount === -1 && (
                <p className="text-xs text-red-600 font-semibold">Start date must be before end date.</p>
              )}
            </>
          )}

          {/* Title / Name */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Holiday Name / Reason (optional)</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={60}
              placeholder={mode === 'range' ? 'e.g. Winter Vacations / Eid Holidays' : 'e.g. Independence Day'}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-5 py-2 text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{busy ? 'Saving…' : 'Add Holiday'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
