import { useState } from 'react';
import { toast } from 'react-toastify';
import { X, GraduationCap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function PassOutClassModal({
  classItem, // { id, program, semester, studentCount } or { className }
  type = 'online', // 'online' or 'teacher'
  onClose,
  onGraduated,
}) {
  const [busy, setBusy] = useState(false);
  const title = type === 'online' ? `${classItem.program} · ${classItem.semester}` : classItem.className;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      if (type === 'online') {
        const res = await api.post('/admin/students/graduate', { classId: classItem.id });
        toast.success(res.data.message || 'Class passed out successfully!');
      } else {
        const res = await api.post('/teacher/students/graduate', {});
        toast.success(res.data.message || 'Class passed out successfully!');
      }
      onGraduated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not pass out class');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Pass Out Class ({title})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Graduation & Alumni Archiving
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

        <div className="space-y-3 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="space-y-1.5 leading-relaxed">
              <p className="font-bold">What happens when you Pass Out this class?</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                <li>All active students in <strong>{title}</strong> will be marked as <strong>Graduated Alumni</strong>.</li>
                <li>This class will become <strong>completely empty</strong> and ready for the next incoming batch.</li>
                <li>Each student's attendance records and final standing % will be permanently frozen and preserved.</li>
                <li>Official <strong>PDF Certificates of Merit & Attendance</strong> will be instantly generated and available in the Alumni tab.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2 text-xs shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
            <span>{busy ? 'Passing Out Students…' : 'Confirm Pass Out Class'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
