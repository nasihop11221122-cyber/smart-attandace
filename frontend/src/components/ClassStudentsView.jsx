import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import StatusBadge from './StatusBadge';
import StudentDetailModal from './principle/StudentDetailModal';

const todayLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const STATUS_ORDER = { absent: 0, leave: 1, present: 2 };

export default function ClassStudentsView({ basePath, classLabel, teacherName, onBack }) {
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);

  const [date, setDate] = useState(todayLocal);
  const [dayData, setDayData] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get(`${basePath}/students`, { params: { className: classLabel } });
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
  }, [basePath, classLabel]);

  useEffect(() => {
    if (tab !== 'date') return undefined;
    let active = true;
    setDayLoading(true);

    const load = async () => {
      try {
        const res = await api.get(`${basePath}/day`, { params: { className: classLabel, date } });
        if (active) setDayData(res.data);
      } catch (err) {
        if (active) {
          setDayData(null);
          toast.error(err.response?.data?.message || 'Could not connect to the server');
        }
      } finally {
        if (active) setDayLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [tab, date, basePath, classLabel]);

  // Present = present + leave. Sab se zyada present wala sab se upar.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .map((s) => ({ ...s, presentTotal: s.counts.present + s.counts.leave }))
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .sort((a, b) => b.presentTotal - a.presentTotal || a.rollNo - b.rollNo);
  }, [students, query]);

  // Us din Absent sab se upar, phir Leave, phir Present
  const dayRows = useMemo(() => {
    if (!dayData) return [];
    return [...dayData.students].sort(
      (a, b) =>
        (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3) || a.rollNo - b.rollNo
    );
  }, [dayData]);

  const dayCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0 };
    dayRows.forEach((s) => {
      if (s.status) counts[s.status] += 1;
    });
    return counts;
  }, [dayRows]);

  const tabClass = (name) =>
    `rounded-md px-4 py-1.5 transition ${
      tab === name ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back"
          aria-label="Back"
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
          <div className="mt-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium">
            <button onClick={() => setTab('students')} className={tabClass('students')}>
              Students
            </button>
            <button onClick={() => setTab('date')} className={tabClass('date')}>
              By date
            </button>
          </div>

          {tab === 'students' && (
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

          {tab === 'date' && (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <label htmlFor="history-date" className="text-sm text-slate-500">
                  Date
                </label>
                <input
                  id="history-date"
                  type="date"
                  value={date}
                  max={todayLocal()}
                  onChange={(e) => {
                    if (e.target.value) setDate(e.target.value);
                  }}
                  className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                />
              </div>

              {dayLoading ? (
                <p className="mt-6 text-slate-500">Loading…</p>
              ) : !dayData ? (
                <p className="mt-6 text-slate-500">Could not load the attendance for this date</p>
              ) : !dayData.submitted ? (
                <p className="mt-6 text-slate-500">No attendance was submitted on this date.</p>
              ) : (
                <>
                  <div className="mt-4 grid max-w-md grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-green-50 py-2">
                      <p className="text-lg font-semibold text-green-700">{dayCounts.present}</p>
                      <p className="text-slate-500">Present</p>
                    </div>
                    <div className="rounded-md bg-red-50 py-2">
                      <p className="text-lg font-semibold text-red-700">{dayCounts.absent}</p>
                      <p className="text-slate-500">Absent</p>
                    </div>
                    <div className="rounded-md bg-amber-50 py-2">
                      <p className="text-lg font-semibold text-amber-700">{dayCounts.leave}</p>
                      <p className="text-slate-500">Leave</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Roll No</th>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Father Name</th>
                          <th className="px-4 py-3 text-right font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {dayRows.map((s) => (
                          <tr key={s.id}>
                            <td className="px-4 py-3">{s.rollNo}</td>
                            <td className="px-4 py-3 font-medium">{s.name}</td>
                            <td className="px-4 py-3">{s.fatherName}</td>
                            <td className="px-4 py-3 text-right">
                              <StatusBadge status={s.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {detail && (
        <StudentDetailModal student={detail} basePath={basePath} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}