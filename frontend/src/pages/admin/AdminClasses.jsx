import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import CreateClassModal from '../../components/admin/CreateClassModal';
import DeleteClassModal from '../../components/admin/DeleteClassModal';
import UpdateClassModal from '../../components/admin/UpdateClassModal';
import UpdateProgramModal from '../../components/admin/UpdateProgramModal';
import DeleteProgramModal from '../../components/admin/DeleteProgramModal';
import ClassCourses from '../../components/admin/ClassCourses';
import StudentAttendanceModal from '../../components/admin/StudentAttendanceModal';

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CardActions({ onEdit, onDelete, label }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={onEdit}
        title="Update"
        aria-label={`Update ${label}`}
        className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-blue-700 hover:text-white"
      >
        <EditIcon />
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        aria-label={`Delete ${label}`}
        className="grid h-9 w-9 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
      >
        <TrashIcon />
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
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back"
          aria-label="Back to classes"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold text-slate-800">{classItem.program}</h2>
          <p className="truncate text-sm text-slate-500">{classItem.semester}</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : students.length === 0 ? (
        <p className="mt-6 text-slate-500">No students in this class yet</p>
      ) : (
        <>
          <div className="mt-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or roll no"
              aria-label="Search students"
              className="w-full max-w-sm rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

{rows.length === 0 ? (
            <p className="mt-6 text-slate-500">No students found</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Roll No</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {rows.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setViewing(s)}
                      onKeyDown={(e) => e.key === 'Enter' && setViewing(s)}
                      tabIndex={0}
                      title="View attendance"
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{s.rollNo}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{s.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setProgram(null)}
            title="Back"
            aria-label="Back to programs"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold text-slate-800">{program}</h2>
            <p className="truncate text-sm text-slate-500">Semesters</p>
          </div>
        </div>

        {semesterCards.length === 0 ? (
          <p className="mt-6 text-slate-500">No semesters in this program</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {semesterCards.map((c) => (
              <div key={c.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-lg font-semibold text-slate-800">{c.semester}</h3>
                  <CardActions
                    label="semester"
                    onEdit={() => setEditingClass(c)}
                    onDelete={() => setDeleting(c)}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {c.studentCount} {c.studentCount === 1 ? 'student' : 'students'} · {c.courseCount}{' '}
                  {c.courseCount === 1 ? 'course' : 'courses'}
                </p>
                <p className={`mt-1 text-xs ${c.location ? 'text-green-700' : 'text-amber-700'}`}>
                  {c.location ? `Location set · ${c.location.radius} m radius` : 'Location not set'}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setView({ mode: 'students', item: c })}
                    className="rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    View Students
                  </button>
                  <button
                    onClick={() => setView({ mode: 'courses', item: c })}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
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
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">All Classes</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : programCards.length === 0 ? (
        <p className="mt-6 text-slate-500">No classes yet. Press Create to add the first class.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {programCards.map((p) => (
            <div key={p.name} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-lg font-semibold text-slate-800">{p.name}</h3>
                <CardActions
                  label="program"
                  onEdit={() => setEditingProgram(p.name)}
                  onDelete={() => setDeletingProgram(p.name)}
                />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {p.semesters} {p.semesters === 1 ? 'semester' : 'semesters'} · {p.students}{' '}
                {p.students === 1 ? 'student' : 'students'}
              </p>

              <button
                onClick={() => setProgram(p.name)}
                className="mt-4 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
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