import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Languages, Check, User, Mail, Key, Shield } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PasswordInput from '../components/PasswordInput';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

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
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setBusy(false);
    }
  };

  const handleLanguageChange = async (langCode) => {
    try {
      await setLanguage(langCode);
      toast.success(t('languageSaved'), { icon: '🌐' });
    } catch {
      toast.error('Failed to update language');
    }
  };

  const sendResetLink = async () => {
    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email: user.email });
      toast.success('Reset link has been sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setSending(false);
    }
  };

  const fields = [
    { key: 'name', label: t('name'), display: user?.name, icon: User },
    { key: 'email', label: t('email'), display: user?.email, icon: Mail },
    { key: 'password', label: t('password'), display: '••••••••', icon: Key },
  ];

  const languagesList = [
    { code: 'en', label: 'English', native: 'English', sub: 'Default' },
    { code: 'ar', label: 'Arabic', native: 'العربية', sub: 'RTL' },
    { code: 'ur', label: 'Urdu', native: 'اردو', sub: 'RTL' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
          {t('profile')}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage your personal credentials and system language preferences.
        </p>
      </div>

      {/* SECTION 1: PERSONAL LANGUAGE SWITCHER */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--primary)] border border-[var(--border)]">
            <Languages className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              {t('preferredLanguage')}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Choose your personal interface language (English, العربية, or اردو). Applies only to your session.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languagesList.map((lang) => {
            const isCurrent = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all ${
                  isCurrent
                    ? 'border-[var(--primary)] bg-[var(--bg-elevated)] ring-2 ring-[var(--primary)]/20 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-focus)]'
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-[var(--text-main)]">{lang.native}</p>
                  <p className="text-xs text-[var(--text-muted)]">{lang.label} ({lang.sub})</p>
                </div>
                {isCurrent && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CREDENTIALS & ACCOUNT */}
      <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="p-5">
              {editing === f.key ? (
                <form onSubmit={(e) => save(e, f.label)} className="flex flex-col gap-3">
                  {f.key === 'password' ? (
                    <>
                      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                        {t('currentPassword')}
                        <PasswordInput
                          name="currentPassword"
                          value={values.currentPassword}
                          onChange={onChange}
                          required
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--text-main)] outline-none focus:border-[var(--border-focus)]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={sendResetLink}
                        disabled={sending}
                        className="self-start text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-60"
                      >
                        {sending ? t('pleaseWait') : 'Forgot password? Send reset link'}
                      </button>
                      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                        {t('newPassword')}
                        <PasswordInput
                          name="password"
                          value={values.password}
                          onChange={onChange}
                          required
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--text-main)] outline-none focus:border-[var(--border-focus)]"
                        />
                      </label>
                    </>
                  ) : (
                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                      {f.label}
                      <input
                        name={f.key}
                        type={f.key === 'email' ? 'email' : 'text'}
                        value={values[f.key]}
                        onChange={onChange}
                        required
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20"
                      />
                    </label>
                  )}

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      disabled={busy}
                      className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-fg)] transition hover:brightness-110 disabled:opacity-60"
                    >
                      {busy ? t('pleaseWait') : t('save')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">{f.label}</p>
                      <p className="truncate font-bold text-sm text-[var(--text-main)]">{f.display}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(f.key)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs font-bold text-[var(--text-main)] transition hover:border-[var(--border-focus)]"
                  >
                    {t('update')}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Role row */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
              <Shield className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)]">{t('role')}</p>
              <p className="truncate font-bold text-sm uppercase text-[var(--primary)]">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)]">
            Protected
          </span>
        </div>
      </div>
    </motion.div>
  );
}