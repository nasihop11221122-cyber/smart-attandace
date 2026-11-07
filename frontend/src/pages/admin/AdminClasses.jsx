import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Edit2, Trash2, Search, BookOpen, Users, MapPin } from 'lucide-react';
import api from '../../api/axios';
import CreateClassModal from '../../components/admin/CreateClassModal';
import DeleteClassModal from '../../components/admin/DeleteClassModal';
import UpdateClassModal from '../../components/admin/UpdateClassModal';
import UpdateProgramModal from '../../components/admin/UpdateProgramModal';
import DeleteProgramModal from '../../components/admin/DeleteProgramModal';
import ClassCourses from '../../components/admin/ClassCourses';
import StudentAttendanceModal from '../../components/admin/StudentAttendanceModal';
import PassOutClassModal from '../../components/PassOutClassModal';
import GraduatedStudentsModal from '../../components/GraduatedStudentsModal';
import PromoteSemesterModal from '../../components/PromoteSemesterModal';
import { Sparkles } from 'lucide-react';
import { GraduationCap, Award } from 'lucide-react';

function CardActions({ onEdit, onDelete, label }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        onClick={onEdit}
        title="Update"
        aria-label={`Update ${label}`}
        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 cursor-pointer"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        aria-label={`Delete ${label}`}
        className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ClassStudents({ classItem, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get('/admin/students', { params: { classId: classItem.id } });
        if (active) setStudents(res.data.students);
      } catch (err) {
        if (active) toast.error(err.response?.data?.message || 'Could not connect to the server');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [classItem.id]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter(
        (s) => !q || s.name.toLowerCase().includes(q) || String(s.rollNo || '').toLowerCase().includes(q)
      )
      .sort((a, b) => String(a.rollNo).localeCompare(String(b.rollNo), 'en', { numeric: true }));
  }, [students, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back"
          aria-label="Back to classes"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {classItem.program}
          </h2>
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {classItem.semester} · Enrolled Students
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">No students in this class yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or roll no..."
              aria-label="Search students"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>

          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No students found.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap">Roll No</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Name</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                    {rows.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setViewing(s)}
                        onKeyDown={(e) => e.key === 'Enter' && setViewing(s)}
                        tabIndex={0}
                        title="View attendance"
                        className="group cursor-pointer transition-colors hover:bg-teal-50/40 dark:hover:bg-teal-950/20 focus:bg-teal-50/40 dark:focus:bg-teal-950/20 focus:outline-none"
                      >
                        <td className="px-5 py-3.5 font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap">
                          #{s.rollNo}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors whitespace-nowrap">
                          {s.name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {s.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {viewing && <StudentAttendanceModal student={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [view, setView] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [passOutClass, setPassOutClass] = useState(null);
  const [promoteClass, setPromoteClass] = useState(null);
  const [alumniOpen, setAlumniOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/classes');
      setClasses(res.data.classes);
      setPrograms(res.data.programs);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh the counts when coming back
  useEffect(() => {
    if (!view) load();
  }, [view, load]);

  const programCards = useMemo(() => {
    const map = new Map();
    classes.forEach((c) => {
      const entry = map.get(c.program) || { name: c.program, semesters: 0, students: 0 };
      entry.semesters += 1;
      entry.students += c.studentCount;
      map.set(c.program, entry);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [classes]);

  const semesterCards = useMemo(
    () => classes.filter((c) => c.program === program),
    [classes, program]
  );

  if (view?.mode === 'students') {
    return <ClassStudents classItem={view.item} onBack={() => setView(null)} />;
  }
  if (view?.mode === 'courses') {
    return <ClassCourses classItem={view.item} onBack={() => setView(null)} />;
  }

  if (program) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setProgram(null)}
              title="Back to programs"
              aria-label="Back to programs"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {program}
              </h2>
              <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                Semesters & Course Schedules
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlumniOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-4 py-2.5 text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Alumni & Certificates</span>
          </button>
        </div>

        {semesterCards.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No semesters in this program</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {semesterCards.map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-md min-h-[210px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {c.semester}
                    </h3>
                    <CardActions
                      label="semester"
                      onEdit={() => setEditingClass(c)}
                      onDelete={() => setDeleting(c)}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5" />
                      {c.studentCount} {c.studentCount === 1 ? 'student' : 'students'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <BookOpen className="h-3.5 w-3.5" />
                      {c.courseCount} {c.courseCount === 1 ? 'course' : 'courses'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                        c.location
                          ? 'border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      {c.location ? `Location set · ${c.location.radius} m radius` : 'Location not set'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  {c.studentCount > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPromoteClass(c)}
                        title="Promote batch to next semester"
                        className="flex items-center gap-1.5 rounded-lg border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Promote</span>
                      </button>
                      <button
                        onClick={() => setPassOutClass(c)}
                        title="Pass out and graduate this class"
                        className="flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                      >
                        <GraduationCap className="h-3 w-3" />
                        <span>Pass Out</span>
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <button
                    onClick={() => setView({ mode: 'students', item: c })}
                    className="flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    View Students
                  </button>
                  <button
                    onClick={() => setView({ mode: 'courses', item: c })}
                    className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                  >
                    View Courses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingClass && (
          <UpdateClassModal
            classItem={editingClass}
            onClose={() => setEditingClass(null)}
            onUpdated={load}
          />
        )}
        {deleting && (
          <DeleteClassModal
            classItem={deleting}
            onClose={() => setDeleting(null)}
            onDeleted={load}
          />
        )}
        {promoteClass && (
          <PromoteSemesterModal
            sourceClass={promoteClass}
            allClasses={classes}
            onClose={() => setPromoteClass(null)}
            onPromoted={load}
          />
        )}
        {passOutClass && (
          <PassOutClassModal
            type="online"
            classItem={passOutClass}
            onClose={() => setPassOutClass(null)}
            onGraduated={load}
          />
        )}
        {alumniOpen && (
          <GraduatedStudentsModal
            type="online"
            onClose={() => setAlumniOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            All Classes & Programs
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage academic programs, semesters, locations, and active courses.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAlumniOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-4 py-2.5 text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Alumni & Certificates</span>
          </button>
          <button
            onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Class</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : programCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">No classes yet. Press Create Class to add the first class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {programCards.map((p) => (
            <div
              key={p.name}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-md min-h-[195px]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 font-black text-sm">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <CardActions
                    label="program"
                    onEdit={() => setEditingProgram(p.name)}
                    onDelete={() => setDeletingProgram(p.name)}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <BookOpen className="h-3.5 w-3.5" />
                    {p.semesters} {p.semesters === 1 ? 'semester' : 'semesters'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Users className="h-3.5 w-3.5" />
                    {p.students} {p.students === 1 ? 'student' : 'students'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setProgram(p.name)}
                className="mt-5 w-full flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                View Semesters
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <CreateClassModal
          programs={programs}
          onClose={() => setCreating(false)}
          onCreated={load}
        />
      )}
      {editingProgram && (
        <UpdateProgramModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onUpdated={load}
        />
      )}
      {promoteClass && (
        <PromoteSemesterModal
          sourceClass={promoteClass}
          allClasses={classes}
          onClose={() => setPromoteClass(null)}
          onPromoted={load}
        />
      )}
      {passOutClass && (
        <PassOutClassModal
          type="online"
          classItem={passOutClass}
          onClose={() => setPassOutClass(null)}
          onGraduated={load}
        />
      )}
      {alumniOpen && (
        <GraduatedStudentsModal
          type="online"
          onClose={() => setAlumniOpen(false)}
        />
      )}
      {deletingProgram && (
        <DeleteProgramModal
          program={deletingProgram}
          onClose={() => setDeletingProgram(null)}
          onDeleted={load}
        />
      )}
    </div>
  );
}
