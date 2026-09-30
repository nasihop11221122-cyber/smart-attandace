import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Dono passwords match nahi karte');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset ho gaya, ab login karein');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Server se connect nahi ho saka');
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-8"
      >
        <h1 className="text-2xl font-semibold text-slate-800">Reset password</h1>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          New Password
          <PasswordInput
            name="password"
            value={form.password}
            onChange={onChange}
            required
            autoComplete="new-password"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Confirm Password
          <PasswordInput
            name="confirm"
            value={form.confirm}
            onChange={onChange}
            required
            autoComplete="new-password"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={busy}
          className="rounded-md bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Please wait…' : 'Reset password'}
        </button>

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="text-blue-700 hover:underline">
            Login par wapas jayein
          </Link>
        </p>
      </form>
    </div>
  );
}