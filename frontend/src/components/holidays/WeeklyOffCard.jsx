import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CalendarDays, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const DAYS = [
  { index: 0, name: 'Sunday', urdu: 'Itwaar', short: 'Sun' },
  { index: 1, name: 'Monday', urdu: 'Peer', short: 'Mon' },
  { index: 2, name: 'Tuesday', urdu: 'Mangal', short: 'Tue' },
  { index: 3, name: 'Wednesday', urdu: 'Budh', short: 'Wed' },
  { index: 4, name: 'Thursday', urdu: 'Jumeraat', short: 'Thu' },
  { index: 5, name: 'Friday', urdu: 'Juma', short: 'Fri' },
  { index: 6, name: 'Saturday', urdu: 'Hafta', short: 'Sat' },
];

export default function WeeklyOffCard({ endpoint = '/admin/holidays', initialDays = [0], onUpdated }) {
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSelectedDays(initialDays || [0]);
  }, [initialDays]);

  const toggleDay = (dayIndex) => {
    const updated = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex].sort((a, b) => a - b);

    setSelectedDays(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`${endpoint}/weekly-offs`, { days: selectedDays });
      toast.success(res.data?.message || 'Weekly off days saved successfully!');
      setHasChanges(false);
      if (onUpdated) onUpdated(res.data?.weeklyOffs || selectedDays);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update weekly offs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-white to-slate-50 dark:from-teal-950/30 dark:via-[#0b1f2a] dark:to-[#091822] p-5 sm:p-6 shadow-md transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/30">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Permanent Weekly Offs (Haftawar Chuttiyan)
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                <ShieldCheck className="h-3 w-3" /> Auto-Excused
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select recurring off days. All 52 weeks of the year will automatically be holidays without adding dates!
            </p>
          </div>
        </div>

        {/* Save button if changes made */}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Save Weekly Offs</span>
          </button>
        )}
      </div>

      {/* 7 Days Toggle Grid */}
      <div className="mt-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.index);
          return (
            <button
              key={day.index}
              type="button"
              onClick={() => toggleDay(day.index)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-teal-500 bg-teal-600/10 dark:bg-teal-500/20 text-teal-900 dark:text-teal-200 shadow-xs ring-1 ring-teal-500/40'
                  : 'border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-xs uppercase font-extrabold tracking-wider">{day.short}</span>
              <span className="text-[11px] font-medium opacity-80">{day.urdu}</span>
              <div className="mt-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full transition-transform ${
                    isSelected ? 'bg-teal-600 dark:bg-teal-400 scale-125' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
        <div>
          Active Off Days:{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {selectedDays.length === 0
              ? 'None (Regular 7-day schedule)'
              : selectedDays.map((idx) => DAYS[idx].name).join(', ')}
          </span>
        </div>
        <div className="text-[11px] italic">
          💡 Tip: By default, Sunday (Itwaar) is active so students never get marked absent on Sundays.
        </div>
      </div>
    </div>
  );
}
