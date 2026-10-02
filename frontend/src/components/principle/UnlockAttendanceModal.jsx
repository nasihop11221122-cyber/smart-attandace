import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function UnlockAttendanceModal({ notification, onClose, onUnlocked }) {
  const [busy, setBusy] = useState(false);

  const onConfirm = async () => {
    setBusy(true);
    try {
      await api.post(`/principal/dashboard/attendance/${notification.id}/unlock`);
      toast.success(`${notification.className} attendance unlocked`);
      onUnlocked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6">
        <h3 className="text-xl font-semibold text-slate-800">Unlock Attendance</h3>

        <p className="text-sm text-slate-500">
          Unlock the attendance of{' '}
          <span className="font-medium text-slate-800">{notification.className}</span> submitted by{' '}
          <span className="font-medium text-slate-800">{notification.teacherName}</span>? The
          teacher will be able to correct it and submit it again.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}