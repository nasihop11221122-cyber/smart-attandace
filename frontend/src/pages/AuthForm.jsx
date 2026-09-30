import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

const roleRoutes = {
  super_admin: '/super-admin',
  admin: '/admin',
  principal: '/principal',
  teacher: '/teacher',
  student: '/student',
};

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const loggedInUser = isRegister
        ? await register(form)
        : await login({ email: form.email, password: form.password });

      const target = roleRoutes[loggedInUser?.role];
      if (!target) {
        setError('No dashboard is available for this role');
        return;
      }
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server');
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
        <h1 className="text-2xl font-semibold text-slate-800">
          {isRegister ? 'Create account' : 'Log in'}
        </h1>

        {isRegister && (
          <label className="flex flex-col gap-1.5 text-sm text-slate-500">
            Name
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              autoComplete="name"
              className={inputClass}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            autoComplete="email"
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
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </label>

        {!isRegister && (
          <Link to="/forgot-password" className="self-end text-sm text-blue-700 hover:underline">
            Forgot password?
          </Link>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={busy}
          className="rounded-md bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Please wait…' : isRegister ? 'Register' : 'Log in'}
        </button>

        <p className="text-center text-sm text-slate-500">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-700 hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-700 hover:underline">
                Register
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}