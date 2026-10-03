import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function Row({ label, value }) {
  return (
    <p className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="truncate font-medium text-slate-800">{value}</span>
    </p>
  );
}

export default function RequestDecisionModal({ request, onClose, onDecided }) {
  const [busy, setBusy] = useState('');

  const decide = async (decision) => {
    setBusy(decision);
    try {
      await api.patch(`/admin/requests/${request.id}`, { decision });
      toast.success(decision === 'accept' ? 'Request accepted' : 'Request rejected');
      onDecided();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      const status = err.response?.status;
      if (status === 409 || status === 404) {
        onDecided();
        onClose();
      } else {
        setBusy('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Attendance Request</h3>
          <p className="text-sm text-slate-500">Accept or reject this request</p>
        </div>

        <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <Row label="Student" value={request.studentName} />
          {request.rollNo && <Row label="Roll No" value={request.rollNo} />}
          <Row label="Class" value={request.className} />
          {request.semester && <Row label="Semester" value={request.semester} />}
          <Row label="Date" value={formatDate(request.date)} />
          <Row label="Sent at" value={formatTime(request.time)} />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(busy)}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => decide('reject')}
            disabled={Boolean(busy)}
            className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'reject' ? 'Please wait…' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={() => decide('accept')}
            disabled={Boolean(busy)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'accept' ? 'Please wait…' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}