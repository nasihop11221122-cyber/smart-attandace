import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

const CURRENT_LABEL = { accepted: 'Present', rejected: 'Absent', pending: 'Pending' };

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function ChangeStatusModal({ record, onClose, onDone }) {
  // Start with the opposite of what is saved (a pending record starts with Present)
  const [status, setStatus] = useState(record.status === 'accepted' ? 'absent' : 'present');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const optionClass = (value, active) =>
    `flex-1 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
      status === value
        ? value === 'present'
          ? 'border-green-600 bg-green-600 text-white'
          : 'border-red-600 bg-red-600 text-white'
        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
    } ${active ? '' : 'cursor-not-allowed opacity-50'}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.patch(`/admin/history/${record.id}`, { status, reason });
      toast.success(res.data.message);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6"
      >
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Change Status</h3>
          <p className="text-sm text-slate-500">
            {record.studentName}
            {record.courseName ? ` · ${record.courseName}` : ''} · {formatDate(record.date)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Now: <span className="font-medium text-slate-700">{CURRENT_LABEL[record.status]}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus('present')}
            disabled={record.status === 'accepted'}
            className={optionClass('present', record.status !== 'accepted')}
          >
            Present
          </button>
          <button
            type="button"
            onClick={() => setStatus('absent')}
            disabled={record.status === 'rejected'}
            className={optionClass('absent', record.status !== 'rejected')}
          >
            Absent
          </button>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Reason (optional)
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="e.g. Student had a network problem"
            className={inputClass}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}