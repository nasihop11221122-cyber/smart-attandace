import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

const labelClass = 'flex flex-col gap-1.5 text-sm text-slate-500';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({ name: '', email: '', currentPassword: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);

  const startEdit = (field) => {
    setValues({ name: user.name, email: user.email, currentPassword: '', password: '' });
    setEditing(field);
  };

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const save = async (e, label) => {
    e.preventDefault();
    const payload =
      editing === 'password'
        ? { password: values.password, currentPassword: values.currentPassword }
        : { [editing]: values[editing] };

    setBusy(true);
    try {
      await updateProfile(payload);
      toast.success(`${label} updated successfully`);
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server se connect nahi ho saka');
    } finally {
      setBusy(false);
    }
  };

  const sendResetLink = async () => {
    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email: user.email });
      toast.success('Reset link aapki email par bhej diya gaya hai');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server se connect nahi ho saka');
    } finally {
      setSending(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Name', display: user.name },
    { key: 'email', label: 'Email', display: user.email },
    { key: 'password', label: 'Password', display: '••••••••' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-slate-800">Profile</h2>

      <div className="mt-6 max-w-xl divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {fields.map((f) => (
          <div key={f.key} className="p-4">
            {editing === f.key ? (
              <form onSubmit={(e) => save(e, f.label)} className="flex flex-col gap-3">
                {f.key === 'password' ? (
                  <>
                    <label className={labelClass}>
                      Current Password
                      <PasswordInput
                        name="currentPassword"
                        value={values.currentPassword}
                        onChange={onChange}
                        required
                        autoComplete="current-password"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={sendResetLink}
                      disabled={sending}
                      className="self-start text-sm text-blue-700 hover:underline disabled:opacity-60"
                    >
                      {sending ? 'Sending…' : 'Current password bhool gaye? Email par reset link bhejein'}
                    </button>
                    <label className={labelClass}>
                      New Password
                      <PasswordInput
                        name="password"
                        value={values.password}
                        onChange={onChange}
                        required
                        autoComplete="new-password"
                      />
                    </label>
                  </>
                ) : (
                  <label className={labelClass}>
                    {f.label}
                    <input
                      name={f.key}
                      type={f.key === 'email' ? 'email' : 'text'}
                      value={values[f.key]}
                      onChange={onChange}
                      required
                      className={inputClass}
                    />
                  </label>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
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
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{f.label}</p>
                  <p className="truncate font-medium text-slate-800">{f.display}</p>
                </div>
                <button
                  onClick={() => startEdit(f.key)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Update
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Role</p>
            <p className="truncate font-medium text-slate-800">{user.role}</p>
          </div>
          <button
            disabled
            className="cursor-not-allowed rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}