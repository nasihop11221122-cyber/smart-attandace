import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { X, ArrowRight, CheckSquare, Square, ShieldAlert, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function PromoteClassModal({
  sourceClassName, // e.g. "Class 9-A"
  students = [], // list of active students in class
  onClose,
  onPromoted,
}) {
  const [targetName, setTargetName] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set(students.map((s) => s.id)));
  const [busy, setBusy] = useState(false);

  const passedCount = selectedIds.size;
  const failedCount = students.length - passedCount;

  const toggleStudent = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(students.map((s) => s.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handlePromote = async () => {
    const trimmedTarget = targetName.trim();
    if (!trimmedTarget) {
      toast.error('Please enter the target class name (e.g. Class 10-A)');
      return;
    }
    if (trimmedTarget.toLowerCase() === sourceClassName.toLowerCase()) {
      toast.error('Target class cannot be the same as current class');
      return;
    }
    if (selectedIds.size === 0) {
      toast.error('Please select at least one passing student to promote');
      return;
    }

    setBusy(true);
    try {
      const res = await api.post('/teacher/students/promote', {
        targetClassName: trimmedTarget,
        studentIds: Array.from(selectedIds),
      });
      toast.success(res.data.message || 'Students successfully promoted!');
      onPromoted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Promotion failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Selective Class Promotion (Pass / Fail)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sourceClassName} · Uncheck students who failed to retain them in current class
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Visual From -> To Card */}
          <div className="grid grid-cols-5 items-center gap-2 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
            <div className="col-span-2 text-center">
              <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">From Current</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">{sourceClassName}</p>
              <span className="inline-block mt-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
                {students.length} Total Students
              </span>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200/50 dark:border-teal-800/50">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Promote To</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {targetName.trim() || 'Enter Target Class'}
              </p>
              <span className="inline-block mt-1 text-[11px] text-teal-600 font-semibold">
                {passedCount} Passed
              </span>
            </div>
          </div>

          {/* Target Class Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Target Next Class Name (e.g. Class 10-A, 11th Grade, 12th Pre-Medical)
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Enter next class name..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
            />
          </div>

          {/* Selective Checklist Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Student Pass/Fail Status:
                </span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/50">
                  {passedCount} Passed (Checked)
                </span>
                {failedCount > 0 && (
                  <span className="rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2.5 py-0.5 text-xs font-bold border border-red-200/50 dark:border-red-800/50">
                    {failedCount} Retained (Failed)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Pass All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60">
              {students.map((s) => {
                const isSelected = selectedIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900/60'
                        : 'bg-red-50/40 dark:bg-red-950/20 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-teal-600 dark:text-teal-400">
                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-400" />}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'line-through text-slate-400'}`}>
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Roll #{s.rollNo} {s.fatherName ? `· S/D/O ${s.fatherName}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {isSelected ? 'Pass (Promote)' : 'Fail (Repeat)'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handlePromote}
            disabled={busy || selectedIds.size === 0 || !targetName.trim()}
            className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold px-5 py-2.5 text-xs shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>
              {busy ? 'Promoting Students…' : `Promote ${passedCount} Passed Students`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
