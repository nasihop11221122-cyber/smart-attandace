import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/student/attendance');
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const status = data?.request?.status || null;

  // Jab tak request pending hai, status dekhte rahein
  useEffect(() => {
    if (status !== 'pending') return undefined;
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, 15000);
    return () => clearInterval(timer);
  }, [status, load]);

  const send = async () => {
    setBusy(true);
    try {
      await api.post('/student/attendance');
      toast.success('Attendance request sent');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      if (err.response?.status === 409) await load();
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return <p className={error ? 'text-red-600' : 'text-slate-500'}>{error || 'Loading…'}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Mark Attendance</h2>
        <p className="text-sm text-slate-500">{formatDate(data.date)}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-1.5 text-sm">
          <p className="flex justify-between gap-3">
            <span className="text-slate-500">Class</span>
            <span className="font-medium text-slate-800">{data.className || '—'}</span>
          </p>
          {data.semester && (
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Semester</span>
              <span className="font-medium text-slate-800">{data.semester}</span>
            </p>
          )}
          {data.rollNo && (
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">Roll No</span>
              <span className="font-medium text-slate-800">{data.rollNo}</span>
            </p>
          )}
        </div>

        <div className="mt-5">
          {!data.className ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You are not assigned to a class yet. Please contact the admin.
            </p>
          ) : (
            <>
              {status === 'pending' && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Your request has been sent. Waiting for the admin to approve it.
                </p>
              )}
              {status === 'accepted' && (
                <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Your attendance for today has been accepted.
                </p>
              )}
              {status === 'rejected' && (
                <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  Your request was rejected. You can send it again.
                </p>
              )}

              {(!status || status === 'rejected') && (
                <button
                  onClick={send}
                  disabled={busy}
                  className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy
                    ? 'Please wait…'
                    : status === 'rejected'
                      ? 'Send Again'
                      : 'Send Attendance Request'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-xl bg-green-50 py-3">
          <p className="text-2xl font-semibold text-green-700">{data.counts.accepted}</p>
          <p className="text-slate-500">Accepted</p>
        </div>
        <div className="rounded-xl bg-amber-50 py-3">
          <p className="text-2xl font-semibold text-amber-700">{data.counts.pending}</p>
          <p className="text-slate-500">Pending</p>
        </div>
        <div className="rounded-xl bg-red-50 py-3">
          <p className="text-2xl font-semibold text-red-700">{data.counts.rejected}</p>
          <p className="text-slate-500">Rejected</p>
        </div>
      </div>
    </div>
  );
}