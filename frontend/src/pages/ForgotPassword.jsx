import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Server se connect nahi ho saka');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-8"
      >
        <h1 className="text-2xl font-semibold text-slate-800">Forgot password</h1>
        <p className="text-sm text-slate-500">
          Apni email dein, hum aapko password reset link bhej denge.
        </p>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={busy}
          className="rounded-md bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Please wait…' : 'Send reset link'}
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