import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function DeleteHolidayModal({ holiday, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);

  const onConfirm = async () => {
    setBusy(true);
    try {
      await api.delete(`/principal/holidays/${holiday.id}`);
      toast.success('Holiday deleted successfully');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6">
        <h3 className="text-xl font-semibold text-slate-800">Delete Holiday</h3>

        <p className="text-sm text-slate-500">
          Are you sure you want to delete the holiday on{' '}
          <span className="font-medium text-slate-800">{formatDate(holiday.date)}</span>? Teachers
          will be able to mark attendance on that day again.
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
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}