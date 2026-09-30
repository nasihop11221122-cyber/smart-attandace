import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import PasswordInput from '../PasswordInput';
import ClassSelect from './ClassSelect';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function UpdateTeacherModal({ teacher, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: teacher.name,
    className: teacher.className || '',
    email: teacher.email,
    password: '',
  });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.className) {
      toast.error('Please select a class');
      return;
    }
    setBusy(true);
    const payload = { name: form.name, className: form.className, email: form.email };
    if (form.password) payload.password = form.password;
    try {
      await api.patch(`/principal/teachers/${teacher.id}`, payload);
      toast.success('Teacher updated successfully');
      onUpdated();
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
        <h3 className="text-xl font-semibold text-slate-800">Update Teacher</h3>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Form Master Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className={inputClass}
          />
        </label>

        <ClassSelect
          value={form.className}
          onChange={(className) => setForm((f) => ({ ...f, className }))}
          currentClass={teacher.className || ''}
        />

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Form Master Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          New Password (leave empty to keep the current one)
          <PasswordInput
            name="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
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
            {busy ? 'Please wait…' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}