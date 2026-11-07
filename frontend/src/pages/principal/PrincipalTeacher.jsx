import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import CreateTeacherModal from '../../components/principle/CreateTeacherModal';
import UpdateTeacherModal from '../../components/principle/UpdateTeacherModal';
import DeleteTeacherModal from '../../components/principle/DeleteTeacherModal';

export default function PrincipalTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/principal/teachers');
      setTeachers(res.data.teachers);
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
            All Teachers
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Educational faculty, form masters and assigned classes.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <span>Create Teacher</span>
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="mt-6 text-slate-500">No teachers yet</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="group relative rounded-2xl border transition-all duration-200 overflow-hidden bg-white border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-lg hover:-translate-y-1 dark:bg-[#0b1f2a] dark:border-teal-900/40 dark:shadow-none p-5 flex flex-col justify-between min-h-[195px]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0 w-11 h-11 rounded-xl p-[2px] overflow-hidden">
                      <div
                        aria-hidden="true"
                        className="absolute inset-[-100%] animate-[spin_8s_linear_infinite]"
                        style={{
                          background: 'conic-gradient(from 0deg, #14b8a6, #6366f1, #ec4899, #14b8a6)',
                        }}
                      />
                      <div className="relative w-full h-full rounded-[10px] bg-white dark:bg-[#0b1f2a] flex items-center justify-center font-bold text-xs tracking-wider text-teal-800 dark:text-teal-300 select-none">
                        {t.name ? t.name.slice(0, 2).toUpperCase() : 'TR'}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">{t.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 font-mono">{t.email}</p>
                    </div>
                  </div>

                  <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/70 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60">
                    {t.className || 'No class'}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditing(t)}
                  title="Update"
                  aria-label="Update teacher"
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleting(t)}
                  title="Delete"
                  aria-label="Delete teacher"
                  className="rounded-xl border border-red-200/60 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 px-3 py-1.5 text-xs font-semibold hover:bg-red-600 hover:text-white dark:hover:bg-red-700 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && <CreateTeacherModal onClose={() => setCreating(false)} onCreated={load} />}
      {editing && (
        <UpdateTeacherModal teacher={editing} onClose={() => setEditing(null)} onUpdated={load} />
      )}
      {deleting && (
        <DeleteTeacherModal teacher={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
}