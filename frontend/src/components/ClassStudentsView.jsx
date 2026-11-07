import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, Search, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
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
    `rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
      tab === name
        ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back"
          aria-label="Back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {classLabel}
          </h2>
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            Form Master: <span className="text-teal-700 dark:text-teal-300 font-semibold">{teacherName}</span>
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
        <>
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] p-1 shadow-sm">
            <button onClick={() => setTab('students')} className={tabClass('students')}>
              All Students ({students.length})
            </button>
            <button onClick={() => setTab('date')} className={tabClass('date')}>
              By Date
            </button>
          </div>

          {tab === 'students' && (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search student by name..."
                  aria-label="Search students by name"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                />
              </div>

              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No students match your search.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-sm">
                      <thead className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-5 py-3.5">Roll No</th>
                          <th className="px-5 py-3.5">Name</th>
                          <th className="px-5 py-3.5">Father Name</th>
                          <th className="px-5 py-3.5 text-right">Present Days</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                        {rows.map((s) => (
                          <tr
                            key={s.id}
                            onClick={() => setDetail(s)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setDetail(s);
                            }}
                            tabIndex={0}
                            className="group cursor-pointer transition-colors hover:bg-teal-50/40 dark:hover:bg-teal-950/20 focus:bg-teal-50/40 dark:focus:bg-teal-950/20 focus:outline-none"
                          >
                            <td className="px-5 py-3.5 font-bold text-teal-700 dark:text-teal-300">
                              #{s.rollNo}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                              {s.name}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{s.fatherName}</td>
                            <td className="px-5 py-3.5 text-right font-bold text-teal-600 dark:text-teal-400">
                              {s.presentTotal}
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

          {tab === 'date' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="history-date" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Select Date:
                </label>
                <input
                  id="history-date"
                  type="date"
                  value={date}
                  max={todayLocal()}
                  onChange={(e) => {
                    if (e.target.value) setDate(e.target.value);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                />
              </div>

              {dayLoading ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading attendance…</p>
              ) : !dayData ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Could not load the attendance for this date.</p>
              ) : !dayData.submitted ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/40">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No attendance was submitted on this date.</p>
                </div>
              ) : (
                <>
                  <div className="grid max-w-md grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 p-3">
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{dayCounts.present}</p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Present</p>
                    </div>
                    <div className="rounded-xl border border-red-200/60 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3">
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{dayCounts.absent}</p>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">Absent</p>
                    </div>
                    <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-3">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{dayCounts.leave}</p>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Leave</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-sm">
                        <thead className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="px-5 py-3.5">Roll No</th>
                            <th className="px-5 py-3.5">Name</th>
                            <th className="px-5 py-3.5">Father Name</th>
                            <th className="px-5 py-3.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                          {dayRows.map((s) => (
                            <tr key={s.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="px-5 py-3.5 font-bold text-teal-700 dark:text-teal-300">#{s.rollNo}</td>
                              <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                              <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{s.fatherName}</td>
                              <td className="px-5 py-3.5 text-right">
                                <StatusBadge status={s.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {detail && (
        <StudentDetailModal student={detail} basePath={basePath} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
