import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import ChangeStatusModal from '../../components/admin/ChangeStatusModal';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

const STATUS_STYLE = {
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
};

const STATUS_LABEL = { accepted: 'Accepted', rejected: 'Rejected', pending: 'Pending' };

const VERDICT_LABEL = {
  inside: 'Inside',
  outside: 'Outside',
  uncertain: 'Not verified',
};

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const todayText = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

const locationText = (r) => {
  if (!r.verdict) return '—';
  const label = VERDICT_LABEL[r.verdict] || '—';
  return r.distance !== null ? `${label} · ${r.distance} m` : label;
};

// Shown when an admin changed the status by hand
function AdminNote({ record }) {
  if (!record.markedByAdmin) return null;
  return (
    <p className="mt-1 text-xs text-blue-700">
      Changed by admin{record.adminNote ? `: ${record.adminNote}` : ''}
    </p>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function AdminHistory() {
  const initial = { from: todayText(), to: todayText(), classId: '', courseId: '', status: '', q: '' };
  const [form, setForm] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [page, setPage] = useState(1);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(null);

  // Classes for the filter
  useEffect(() => {
    let active = true;
    api
      .get('/admin/classes')
      .then((res) => active && setClasses(res.data.classes))
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Could not connect to the server')
      );
    return () => {
      active = false;
    };
  }, []);

  // Courses of the selected class
  useEffect(() => {
    let active = true;
    if (!form.classId) {
      setCourses([]);
      return undefined;
    }
    api
      .get('/admin/courses', { params: { classId: form.classId } })
      .then((res) => active && setCourses(res.data.courses))
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Could not connect to the server')
      );
    return () => {
      active = false;
    };
  }, [form.classId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      Object.entries(applied).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await api.get('/admin/history', { params });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onClassChange = (e) => setForm({ ...form, classId: e.target.value, courseId: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    setApplied({ ...form });
    setPage(1);
  };

  const onReset = () => {
    setForm(initial);
    setApplied(initial);
    setPage(1);
  };

  const requests = result?.requests || [];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Attendance History</h2>
      <p className="mt-1 text-sm text-slate-500">
        All attendance requests, with the decision and the location result.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          From
          <input
            type="date"
            name="from"
            value={form.from}
            onChange={onChange}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          To
          <input type="date" name="to" value={form.to} onChange={onChange} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Status
          <select name="status" value={form.status} onChange={onChange} className={inputClass}>
            <option value="">All</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Class
          <select name="classId" value={form.classId} onChange={onClassChange} className={inputClass}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Course
          <select
            name="courseId"
            value={form.courseId}
            onChange={onChange}
            disabled={!form.classId}
            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <option value="">{form.classId ? 'All courses' : 'Select a class first'}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Student
          <input
            type="search"
            name="q"
            value={form.q}
            onChange={onChange}
            maxLength={60}
            placeholder="Name or roll no"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-3 lg:justify-end">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-none"
          >
            Reset
          </button>
          <button className="flex-1 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:flex-none">
            Search
          </button>
        </div>
      </form>

      {!result && loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="mt-6 text-slate-500">No requests found for these filters.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-500">
            {result.total} {result.total === 1 ? 'request' : 'requests'}
          </p>

          {/* Phones and small screens: cards */}
          <div className={`mt-3 space-y-3 md:hidden ${loading ? 'opacity-60' : ''}`}>
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{r.studentName}</p>
                    {r.rollNo && <p className="text-xs text-slate-500">Roll No {r.rollNo}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Course</span>
                    <span className="truncate font-medium text-slate-800">{r.courseName || '—'}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Class</span>
                    <span className="truncate font-medium text-slate-800">{r.className}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Date</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(r.date)} · {formatTime(r.time)}
                    </span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Location</span>
                    <span className="font-medium text-slate-800">{locationText(r)}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Decided by</span>
                    <span className="truncate font-medium text-slate-800">{r.decidedBy || '—'}</span>
                  </p>
                </div>
                <AdminNote record={r} />
                <button
                  onClick={() => setChanging(r)}
                  className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Change status
                </button>
              </div>
            ))}
          </div>

          {/* Tablets and computers: table */}
          <div
            className={`mt-3 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block ${
              loading ? 'opacity-60' : ''
            }`}
          >
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Decided by</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.studentName}</p>
                      <p className="text-xs text-slate-500">
                        {r.rollNo ? `Roll ${r.rollNo} · ` : ''}
                        {r.className}
                      </p>
                    </td>
                    <td className="px-4 py-3">{r.courseName || '—'}</td>
                    <td className="px-4 py-3">
                      <p>{formatDate(r.date)}</p>
                      <p className="text-xs text-slate-500">{formatTime(r.time)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">{locationText(r)}</td>
                    <td className="px-4 py-3">
                      {r.decidedBy || '—'}
                      <AdminNote record={r} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setChanging(r)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Change
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.pages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || loading}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {result.page} of {result.pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= result.pages || loading}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {changing && (
        <ChangeStatusModal record={changing} onClose={() => setChanging(null)} onDone={load} />
      )}
    </div>
  );
}