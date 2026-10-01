import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function CreateStudentModal({ classLabel, nextRollNo, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', fatherName: '', rollNo: String(nextRollNo) });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/teacher/students', {
        name: form.name,
        fatherName: form.fatherName,
        rollNo: Number(form.rollNo),
      });
      toast.success('Student created successfully');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6"
      >
        <h3 className="text-xl font-semibold text-slate-800">Create Student</h3>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Student Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Father Name
          <input
            name="fatherName"
            value={form.fatherName}
            onChange={onChange}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Roll No
          <input
            name="rollNo"
            type="number"
            min="1"
            step="1"
            value={form.rollNo}
            onChange={onChange}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Class
          <input
            value={classLabel}
            disabled
            className={`${inputClass} cursor-not-allowed text-slate-500`}
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
            {busy ? 'Please wait…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}