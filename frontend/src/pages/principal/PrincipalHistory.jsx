import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import StudentDetailModal from '../../components/principle/StudentDetailModal';

export default function PrincipalHistory() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get('/principal/history/classes');
      setClasses(res.data.classes);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Present = present + leave. Sab se zyada present wala sab se upar.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .map((s) => ({ ...s, presentTotal: s.counts.present + s.counts.leave }))
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .sort((a, b) => b.presentTotal - a.presentTotal || a.rollNo - b.rollNo);
  }, [students, query]);

  const openClass = async (item) => {
    setSelected(item);
    setStudents([]);
    setQuery('');
    setDetail(null);
    setStudentsLoading(true);
    try {
      const res = await api.get('/principal/history/students', {
        params: { className: item.className },
      });
      setStudents(res.data.students);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setStudentsLoading(false);
    }
  };

  const goBack = () => {
    setSelected(null);
    setDetail(null);
    setQuery('');
    loadClasses();
  };

  if (selected) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
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
            <h2 className="truncate text-2xl font-semibold text-slate-800">{selected.className}</h2>
            <p className="truncate text-sm text-slate-500">Form Master: {selected.teacherName}</p>
          </div>
        </div>

        {studentsLoading ? (
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
                placeholder="Search by student name"
                aria-label="Search students by name"
                className="w-full max-w-sm rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
              <p className="mt-2 text-xs text-slate-500">Leave days are counted as present.</p>
            </div>

            {rows.length === 0 ? (
              <p className="mt-6 text-slate-500">No students found</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Father Name</th>
                      <th className="px-4 py-3 text-right font-medium">Present</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {rows.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setDetail(s)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setDetail(s);
                        }}
                        tabIndex={0}
                        className="cursor-pointer transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3">{s.fatherName}</td>
                        <td className="px-4 py-3 text-right font-semibold">{s.presentTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {detail && <StudentDetailModal student={detail} onClose={() => setDetail(null)} />}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">History</h2>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="mt-6 text-slate-500">No classes are assigned to teachers yet</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <button
              key={c.className}
              onClick={() => openClass(c)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-700 hover:shadow-sm"
            >
              <h3 className="truncate text-lg font-semibold text-slate-800">{c.className}</h3>
              <p className="mt-1 truncate text-sm text-slate-500">{c.teacherName}</p>
              <p className="mt-3 text-sm text-slate-500">
                {c.studentCount} {c.studentCount === 1 ? 'student' : 'students'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}