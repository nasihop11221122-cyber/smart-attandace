import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { getCurrentLocation } from '../../utils/getLocation';
import { getDeviceId } from '../../utils/deviceId';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// "13:05" -> "1:05 PM"
const format12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/student/attendance', { params: { deviceId: getDeviceId() } });
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const course = data?.course || null;
  const status = data?.request?.status || null;
  const deviceStatus = data?.device?.status || 'new';
  const changePending = Boolean(data?.device?.changePending);
  const otherPhone = deviceStatus === 'other';

  // The course changes with the time, so the page checks again by itself
  const waiting = status === 'pending' || (otherPhone && changePending);
  useEffect(() => {
    const timer = setInterval(
      () => {
        if (!document.hidden) load();
      },
      waiting ? 15000 : 30000
    );
    return () => clearInterval(timer);
  }, [waiting, load]);

  const send = async () => {
    setBusy(true);
    try {
      let location;
      try {
        location = await getCurrentLocation();
      } catch (locErr) {
        toast.warn(locErr.message || 'Could not get your location');
      }

      const res = await api.post('/student/attendance', { location, deviceId: getDeviceId() });
      const { request, message } = res.data;
      if (request.status === 'accepted') toast.success(message);
      else if (request.status === 'rejected') toast.error(message);
      else toast.info(message);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      const code = err.response?.data?.code;
      const httpStatus = err.response?.status;
      if (httpStatus === 409 || httpStatus === 400 || code === 'device_mismatch') await load();
    } finally {
      setBusy(false);
    }
  };

  const requestChange = async () => {
    setBusy(true);
    try {
      const res = await api.post('/student/attendance/device-change', { deviceId: getDeviceId() });
      toast.success(res.data.message);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      if (err.response?.status === 409 || err.response?.status === 400) await load();
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
          ) : data.holiday ? (
            <p className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Today is a holiday{data.holiday.title ? `: ${data.holiday.title}` : ''}. There is no
              attendance today.
            </p>
          ) : !course ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No course is running right now. The course will appear here when its time starts.
            </p>
          ) : (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs font-medium text-blue-600">Running now</p>
                <p className="mt-0.5 text-lg font-semibold text-slate-800">{course.name}</p>
                <p className="text-sm text-slate-600">
                  {format12(course.startTime)} – {format12(course.endTime)}
                </p>
              </div>

              {status === 'pending' && (
                <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Your request has been sent. Waiting for the admin to approve it.
                </p>
              )}
              {status === 'accepted' && (
                <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Your attendance for this course has been accepted.
                </p>
              )}
              {status === 'rejected' && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  Your request was rejected. You can send it again.
                </p>
              )}

              {otherPhone && (!status || status === 'rejected') && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <p>This phone is not registered for your account.</p>
                  {changePending ? (
                    <p className="mt-1 text-xs">
                      Your phone change request is sent. Waiting for the admin to approve it.
                    </p>
                  ) : (
                    <button
                      onClick={requestChange}
                      disabled={busy}
                      className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? 'Please wait…' : 'Request Phone Change'}
                    </button>
                  )}
                </div>
              )}

              {!otherPhone && (!status || status === 'rejected') && (
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
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