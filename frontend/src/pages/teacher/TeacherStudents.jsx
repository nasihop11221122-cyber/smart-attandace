import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import CreateStudentModal from '../../components/teacher/CreateStudentModal';
import UpdateStudentModal from '../../components/teacher/UpdateStudentModal';
import DeleteStudentModal from '../../components/teacher/DeleteStudentModal';
import { Tilt, Btn } from '../StudentCards';
import { FileSpreadsheet, Plus } from 'lucide-react';
import BulkImportModal from '../../components/BulkImportModal';
import GraduatedStudentsModal from '../../components/GraduatedStudentsModal';
import PassOutClassModal from '../../components/PassOutClassModal';
import PromoteClassModal from '../../components/PromoteClassModal';
import { Sparkles } from 'lucide-react';
import { GraduationCap } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [classLabel, setClassLabel] = useState('');
  const [nextRollNo, setNextRollNo] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [alumniOpen, setAlumniOpen] = useState(false);
  const [passOutOpen, setPassOutOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/teacher/students');
      setClassLabel(res.data.className);
      setStudents(res.data.students);
      setNextRollNo(res.data.nextRollNo);
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            All Class Students
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {classLabel ? `Assigned Class: ${classLabel}` : 'Manage student enrollments and roll numbers.'}
          </p>
        </div>
        {classLabel && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAlumniOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-3 py-2 text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Alumni</span>
            </button>
            <button
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 px-3 py-2 text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Import Excel</span>
            </button>
            {students.length > 0 && (
              <>
                <button
                  onClick={() => setPromoteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 px-3 py-2 text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Promote Class</span>
                </button>
                <button
                  onClick={() => setPassOutOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Pass Out</span>
                </button>
              </>
            )}
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 px-3.5 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Student</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : !classLabel ? (
        <p className="mt-6 text-slate-500">
          No class is assigned to you yet. Please contact the principal.
        </p>
      ) : students.length === 0 ? (
        <p className="mt-6 text-slate-500">No students yet</p>
      ) : (
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {students.map((s, index) => (
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
                            Father: {s.fatherName}
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
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Class</span>
                        <span className="font-semibold text-teal-700 dark:text-teal-300">
                          {s.className}
                        </span>
                      </div>
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

      {creating && (
        <CreateStudentModal
          classLabel={classLabel}
          nextRollNo={nextRollNo}
          onClose={() => setCreating(false)}
          onCreated={load}
        />
      )}
      {editing && (
        <UpdateStudentModal student={editing} onClose={() => setEditing(null)} onUpdated={load} />
      )}
      {alumniOpen && (
        <GraduatedStudentsModal
          type="teacher"
          onClose={() => setAlumniOpen(false)}
        />
      )}
      {promoteOpen && (
        <PromoteClassModal
          sourceClassName={classLabel}
          students={students}
          onClose={() => setPromoteOpen(false)}
          onPromoted={load}
        />
      )}
      {passOutOpen && (
        <PassOutClassModal
          type="teacher"
          classItem={{ className: classLabel }}
          onClose={() => setPassOutOpen(false)}
          onGraduated={load}
        />
      )}
      {bulkOpen && (
        <BulkImportModal
          type="teacher"
          onClose={() => setBulkOpen(false)}
          onImported={load}
        />
      )}
      {deleting && (
        <DeleteStudentModal student={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
}