import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { X, ArrowRight, ShieldAlert, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function PromoteSemesterModal({
  sourceClass, // { id, program, semester, studentCount }
  allClasses = [], // list of all classes in program
  onClose,
  onPromoted,
}) {
  const candidateSemesters = useMemo(() => {
    return allClasses.filter(
      (c) => c.program === sourceClass.program && c.id !== sourceClass.id
    );
  }, [allClasses, sourceClass]);

  const [targetId, setTargetId] = useState(candidateSemesters[0]?.id || '');
  const [busy, setBusy] = useState(false);

  const selectedTarget = useMemo(
    () => candidateSemesters.find((c) => c.id === targetId),
    [candidateSemesters, targetId]
  );

  const targetHasStudents = Boolean(selectedTarget && selectedTarget.studentCount > 0);

  const handlePromote = async () => {
    if (!targetId) {
      toast.error('Please select a target semester');
      return;
    }
    if (targetHasStudents) {
      toast.error('Cannot promote: Target semester already has students. Promote or pass out the existing students first!');
      return;
    }

    setBusy(true);
    try {
      const res = await api.post('/admin/classes/promote', {
        sourceClassId: sourceClass.id,
        targetClassId: targetId,
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
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Promote Entire Semester Batch
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sourceClass.program} · Universal Batch Progression
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

        {/* Visual From -> To Card */}
        <div className="grid grid-cols-5 items-center gap-2 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="col-span-2 text-center">
            <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Current</span>
            <p className="font-bold text-slate-900 dark:text-white truncate">{sourceClass.semester}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
              {sourceClass.studentCount} Students
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
              {selectedTarget ? selectedTarget.semester : 'Select Below'}
            </p>
            <span className="inline-block mt-1 text-[11px] text-slate-400">
              {targetHasStudents ? '⚠️ Class Not Empty' : 'Empty & Ready'}
            </span>
          </div>
        </div>

        {/* Target Semester Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Select Next Target Semester
          </label>
          {candidateSemesters.length === 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No other semesters exist in this program. Please create the next semester first.
            </p>
          ) : (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
            >
              {candidateSemesters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.semester} ({c.studentCount} active students)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Safety Shield Warning Alert if Target Has Students */}
        {targetHasStudents ? (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Promotion Blocked by Safety Shield</p>
              <p className="mt-0.5 leading-relaxed text-red-600/90 dark:text-red-300/90">
                <strong>{selectedTarget.semester}</strong> already has {selectedTarget.studentCount} active students. To avoid mixing batches, please promote or pass out the existing seniors first!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Target semester is empty. All {sourceClass.studentCount} students will be safely transferred.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handlePromote}
            disabled={busy || targetHasStudents || !targetId || sourceClass.studentCount === 0}
            className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold px-5 py-2 text-xs shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{busy ? 'Promoting…' : `Promote All ${sourceClass.studentCount} Students`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
