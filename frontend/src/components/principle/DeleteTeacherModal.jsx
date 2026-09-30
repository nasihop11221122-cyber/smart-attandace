import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function DeleteTeacherModal({ teacher, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);

  const onConfirm = async () => {
    setBusy(true);
    try {
      await api.delete(`/principal/teachers/${teacher.id}`);
      toast.success('Teacher deleted successfully');
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
        <h3 className="text-xl font-semibold text-slate-800">Delete Teacher</h3>

        <p className="text-sm text-slate-500">
          Are you sure you want to delete <span className="font-medium text-slate-800">{teacher.name}</span>
          {teacher.className ? ` (${teacher.className})` : ''}? This cannot be undone.
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