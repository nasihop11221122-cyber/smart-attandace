import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

function ClassStudents({ classItem, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get('/admin/students', { params: { className: classItem.name } });
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
  }, [classItem.name]);

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
          <h2 className="truncate text-2xl font-semibold text-slate-800">{classItem.name}</h2>
          <p className="text-sm text-slate-500">Students in this class</p>
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
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Roll No</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3">{s.rollNo}</td>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3">{s.email}</td>
                      <td className="px-4 py-3">{s.semester || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get('/admin/classes');
        if (active) setClasses(res.data.classes);
      } catch (err) {
        if (active) toast.error(err.response?.data?.message || 'Could not connect to the server');
      } finally {
        if (active) setLoading(false);
      }
    };

    // Wapas aane par students ki tadad dobara fresh ho
    if (!selected) load();
    return () => {
      active = false;
    };
  }, [selected]);

  if (selected) return <ClassStudents classItem={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">All Classes</h2>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No classes yet. Add a class from the Create Student form.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <div key={c.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="truncate text-lg font-semibold text-slate-800">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {c.studentCount} {c.studentCount === 1 ? 'student' : 'students'}
              </p>
              <button
                onClick={() => setSelected(c)}
                className="mt-4 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                View Students
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}