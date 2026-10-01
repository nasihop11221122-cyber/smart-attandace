import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import StudentDetailModal from './principle/StudentDetailModal';

export default function ClassStudentsView({ endpoint, classLabel, teacherName, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get(endpoint, { params: { className: classLabel } });
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
  }, [endpoint, classLabel]);

  // Present = present + leave. Sab se zyada present wala sab se upar.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .map((s) => ({ ...s, presentTotal: s.counts.present + s.counts.leave }))
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .sort((a, b) => b.presentTotal - a.presentTotal || a.rollNo - b.rollNo);
  }, [students, query]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back"
          aria-label="Back to teachers"
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
          <h2 className="truncate text-2xl font-semibold text-slate-800">{classLabel}</h2>
          <p className="truncate text-sm text-slate-500">Form Master: {teacherName}</p>
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