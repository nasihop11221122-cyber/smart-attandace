import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import LocationField, { locationPayload } from './LocationField';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function UpdateClassModal({ classItem, onClose, onUpdated }) {
  const [semester, setSemester] = useState(classItem.semester);
  const [location, setLocation] = useState(classItem.location ? { ...classItem.location } : null);
  const [locationChanged, setLocationChanged] = useState(false);
  const [busy, setBusy] = useState(false);

  const onLocation = (next) => {
    setLocation(next);
    setLocationChanged(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = semester.trim();
    if (next === classItem.semester && !locationChanged) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await api.patch(`/admin/classes/${classItem.id}`, {
        semester: next,
        ...(location ? { location: locationPayload(location) } : {}),
      });
      toast.success('Semester updated successfully');
      onUpdated();
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
          <h3 className="text-xl font-semibold text-slate-800">Update Semester</h3>
          <p className="text-sm text-slate-500">{classItem.program}</p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Semester Name
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
            maxLength={30}
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <LocationField value={location} onChange={onLocation} />

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
            {busy ? 'Please wait…' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}