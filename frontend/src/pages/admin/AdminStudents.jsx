import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import CreateOnlineStudentModal from '../../components/admin/CreateOnlineStudentModal';
import UpdateOnlineStudentModal from '../../components/admin/UpdateOnlineStudentModal';
import DeleteOnlineStudentModal from '../../components/admin/DeleteOnlineStudentModal';
import { Tilt, Btn } from '../StudentCards';
import { FileSpreadsheet, Plus } from 'lucide-react';
import BulkImportModal from '../../components/BulkImportModal';
import GraduatedStudentsModal from '../../components/GraduatedStudentsModal';
import { GraduationCap } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [alumniOpen, setAlumniOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data.students);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || String(s.rollNo || '').toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            All Students
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Enrolled college and university students, assigned classes and device verification.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAlumniOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-4 py-2.5 text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Alumni & Certificates</span>
          </button>
          <button
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 px-4 py-2.5 text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <span>Create Student</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : students.length === 0 ? (
        <p className="mt-6 text-slate-500">No students yet</p>
      ) : (
        <>
          <div className="mt-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or roll no"
              aria-label="Search students"
              className="w-full max-w-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
            />
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 text-slate-500">No students found</p>
          ) : (
            <motion.div
              layout
              className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((s, index) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Tilt className="group relative rounded-2xl border transition-colors overflow-hidden bg-white border-slate-200/80 shadow-md shadow-slate-200/50 dark:bg-[#0b1f2a] dark:border-teal-900/40 dark:shadow-none p-5 flex flex-col justify-between min-h-[220px]">
                      {/* Soft Radial Spotlight */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                        style={{
                          background:
                            'radial-gradient(450px circle at var(--mx) var(--my), rgba(20, 184, 166, 0.12), transparent 75%)',
                        }}
                      />

                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Conic Rotating Gradient Avatar */}
                            <div className="relative flex-shrink-0 w-12 h-12 rounded-full p-[2px] overflow-hidden">
                              <div
                                aria-hidden="true"
                                className="absolute inset-[-100%] animate-[spin_8s_linear_infinite]"
                                style={{
                                  background:
                                    'conic-gradient(from 0deg, #14b8a6, #6366f1, #ec4899, #14b8a6)',
                                }}
                              />
                              <div className="relative w-full h-full rounded-full bg-white dark:bg-[#0b1f2a] flex items-center justify-center font-bold text-xs tracking-wider text-teal-800 dark:text-teal-300 select-none">
                                {getInitials(s.name)}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {s.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {s.program || s.className}
                              </p>
                            </div>
                          </div>

                          {/* Roll Badge */}
                          <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/70 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60">
                            #{s.rollNo}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                          {s.semester ? (
                            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                              <span className="font-medium text-slate-500 dark:text-slate-400">
                                Semester
                              </span>
                              <span className="font-semibold text-teal-700 dark:text-teal-300">
                                Semester {s.semester}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                              <span className="font-medium text-slate-500 dark:text-slate-400">
                                Class
                              </span>
                              <span className="font-semibold text-teal-700 dark:text-teal-300">
                                {s.className}
                              </span>
                            </div>
                          )}

                          {s.email && (
                            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
                              <span className="font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
                                Email
                              </span>
                              <span
                                title={s.email}
                                className="truncate max-w-[190px] text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                              >
                                {s.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                        <Btn
                          variant="secondary"
                          onClick={() => setEditing(s)}
                          ariaLabel={`Edit ${s.name}`}
                        >
                          Edit
                        </Btn>
                        <Btn
                          variant="delete"
                          onClick={() => setDeleting(s)}
                          ariaLabel={`Delete ${s.name}`}
                        >
                          Delete
                        </Btn>
                      </div>
                    </Tilt>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {creating && (
        <CreateOnlineStudentModal onClose={() => setCreating(false)} onCreated={load} />
      )}
      {editing && (
        <UpdateOnlineStudentModal
          student={editing}
          onClose={() => setEditing(null)}
          onUpdated={load}
        />
      )}
      {alumniOpen && (
        <GraduatedStudentsModal
          type="online"
          onClose={() => setAlumniOpen(false)}
        />
      )}
      {bulkOpen && (
        <BulkImportModal
          type="online"
          onClose={() => setBulkOpen(false)}
          onImported={load}
        />
      )}
      {deleting && (
        <DeleteOnlineStudentModal
          student={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={load}
        />
      )}
    </div>
  );
}