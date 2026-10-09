import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import LocationField, { locationPayload } from './LocationField';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function CreateClassModal({ programs, onClose, onCreated }) {
  const [form, setForm] = useState({ program: '', semester: '' });
  const [location, setLocation] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/classes', {
        ...form,
        ...(location ? { location: locationPayload(location) } : {}),
      });
      toast.success('Class created successfully');
      onCreated();
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
        <h3 className="text-xl font-semibold text-slate-800">Create Class</h3>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Program Name
          <input
            name="program"
            value={form.program}
            onChange={onChange}
            required
            maxLength={60}
            list="program-options"
            placeholder="e.g. BS Computer Science"
            autoComplete="off"
            className={inputClass}
          />
          <datalist id="program-options">
            {programs.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Semester Name
          <input
            name="semester"
            value={form.semester}
            onChange={onChange}
            required
            maxLength={30}
            placeholder="e.g. Semester 1"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <LocationField value={location} onChange={setLocation} />

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
            {busy ? 'Please wait…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}