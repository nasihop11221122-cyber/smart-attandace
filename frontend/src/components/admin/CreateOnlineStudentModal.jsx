import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import PasswordInput from '../PasswordInput';
import ClassSelect from '../principle/ClassSelect';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function CreateOnlineStudentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    rollNo: '',
    className: '',
    email: '',
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
    try {
      await api.post('/admin/students', form);
      toast.success('Student created successfully');
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
          Roll / Registration No
          <input
            name="rollNo"
            value={form.rollNo}
            onChange={onChange}
            required
            maxLength={30}
            className={inputClass}
          />
        </label>

        <ClassSelect
          endpoint="/admin/classes"
          value={form.className}
          onChange={(className) => setForm((f) => ({ ...f, className }))}
        />

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Password
          <PasswordInput
            name="password"
            value={form.password}
            onChange={onChange}
            required
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
            {busy ? 'Please wait…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}