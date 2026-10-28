import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Power,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DeskLampScene from '../components/auth/DeskLampScene';

/* ==========================================================================
   ROLE NAVIGATION MAPPING (Preserved Business Logic)
   ========================================================================== */

const roleRoutes = {
  super_admin: '/super-admin',
  admin: '/admin',
  principal: '/principal',
  teacher: '/teacher',
  student: '/student',
};

/* ==========================================================================
   MODERN ACADEMIC CAMPUS AUTH PAGE (Option 1: Clean Light Theme)
   ========================================================================== */

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Core business logic state
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lamp state
  const [isLampOn, setIsLampOn] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLampOn) return;
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

  // Keyboard shortcut listener (Space or Enter toggles lamp when not in an input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsLampOn((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="relative min-h-screen w-full overflow-hidden bg-[#FAF8F4] text-[#14213D] selection:bg-[#3B4CCA]/15 selection:text-[#14213D]"
    >
      {/* ================================================================ */}
      {/* 1. 3D NATURAL LIGHT OAK DESK LAMP SCENE CANVAS                   */}
      {/* ================================================================ */}
      <DeskLampScene
        isLampOn={isLampOn}
        onToggleLamp={() => setIsLampOn((prev) => !prev)}
      />

      {/* ================================================================ */}
      {/* 2. TOP HEADER BAR: Back to Home + Accessible Toggle Button       */}
      {/* ================================================================ */}
      <header className="relative z-20 flex w-full items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-[#E7E2D9] bg-white px-4 py-2 text-xs font-semibold text-[#5B6475] shadow-xs transition-all duration-200 hover:border-[#3B4CCA] hover:text-[#14213D]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Accessible Keyboard / Touch Switch */}
        <button
          type="button"
          onClick={() => setIsLampOn((prev) => !prev)}
          className="group inline-flex items-center gap-2 rounded-full border border-[#E7E2D9] bg-white px-4 py-2 text-xs font-bold tracking-wider text-[#14213D] uppercase shadow-xs transition-all duration-200 hover:border-[#3B4CCA] hover:bg-slate-50 active:scale-95"
          aria-label={isLampOn ? 'Turn lamp OFF' : 'Turn lamp ON'}
        >
          <Power
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              isLampOn ? 'text-[#3B4CCA] rotate-180' : 'text-[#5B6475]'
            }`}
          />
          <span className="hidden sm:inline">
            {isLampOn ? 'Switch Off Lamp' : 'Turn On Lamp'}
          </span>
          <span className="hidden sm:inline rounded bg-[#FAF8F4] border border-[#E7E2D9] px-1.5 py-0.5 text-[10px] text-[#5B6475]">
            Space
          </span>
        </button>
      </header>

      {/* ================================================================ */}
      {/* 3. SLEEK ANIMATED INDICATOR ARROW POINTING TO LAMP               */}
      {/* ================================================================ */}
      {!isLampOn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 sm:bottom-12 sm:left-1/3"
        >
          <div className="flex items-center gap-2 rounded-full border border-[#E7E2D9] bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#14213D] shadow-sm backdrop-blur-md">
            <span>Click the lamp</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center text-[#3B4CCA]"
            >
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* ================================================================ */}
      {/* 4. SOLID WHITE CLEAN FORM OVERLAY (Revealed when Lamp is ON)     */}
      {/* ================================================================ */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-4 sm:p-6 lg:justify-end lg:pr-16 xl:pr-24 pointer-events-none">
        <AnimatePresence>
          {isLampOn && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#E7E2D9] bg-white p-7 shadow-[0_20px_50px_rgba(20,33,61,0.08)] sm:p-8"
            >
              {/* Clean Academic Header (No plips, pure typography) */}
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-[26px]">
                  {isRegister ? 'Create an account' : 'Welcome back'}
                </h1>
                <p className="mt-1.5 text-xs text-[#5B6475] sm:text-sm">
                  {isRegister
                    ? 'Enter your details below to register on the attendance system.'
                    : 'Sign in to access your attendance workspace.'}
                </p>
              </div>

              {/* Error Notice */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    role="alert"
                    className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 shadow-2xs"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Inputs (Enabled strictly when light is ON) */}
              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                {/* Name Field (Register Mode Only) */}
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-[#14213D]">
                      Full Name
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5B6475]">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                        disabled={!isLampOn}
                        autoComplete="name"
                        placeholder="e.g. Alex Morgan"
                        className="w-full rounded-xl border border-[#E7E2D9] bg-[#FAF8F4]/60 py-2.5 pl-10 pr-4 text-sm text-[#14213D] placeholder-[#5B6475]/50 outline-none transition-all duration-200 focus:border-[#3B4CCA] focus:bg-white focus:ring-4 focus:ring-[#3B4CCA]/10 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#14213D]">
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5B6475]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      disabled={!isLampOn}
                      autoComplete="email"
                      placeholder="name@school.edu or user@domain.com"
                      className="w-full rounded-xl border border-[#E7E2D9] bg-[#FAF8F4]/60 py-2.5 pl-10 pr-4 text-sm text-[#14213D] placeholder-[#5B6475]/50 outline-none transition-all duration-200 focus:border-[#3B4CCA] focus:bg-white focus:ring-4 focus:ring-[#3B4CCA]/10 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#14213D]">
                      Password
                    </label>
                    {!isRegister && (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-[#3B4CCA] transition-colors duration-200 hover:text-[#14213D] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5B6475]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={onChange}
                      required
                      disabled={!isLampOn}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      placeholder="Enter your secret password"
                      className="w-full rounded-xl border border-[#E7E2D9] bg-[#FAF8F4]/60 py-2.5 pl-10 pr-10 text-sm text-[#14213D] placeholder-[#5B6475]/50 outline-none transition-all duration-200 focus:border-[#3B4CCA] focus:bg-white focus:ring-4 focus:ring-[#3B4CCA]/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={!isLampOn}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5B6475] transition-colors duration-200 hover:text-[#14213D]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Action Button (Solid Academic Indigo) */}
                <motion.button
                  type="submit"
                  disabled={busy || !isLampOn}
                  whileHover={busy ? {} : { scale: 1.015 }}
                  whileTap={busy ? {} : { scale: 0.985 }}
                  className="mt-2 flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B4CCA] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(59,76,202,0.22)] transition-all duration-200 hover:bg-[#2e3ea8] hover:shadow-[0_12px_26px_rgba(59,76,202,0.3)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B4CCA]/20"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{isRegister ? 'Create Account' : 'Sign In to Attendance'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                {/* Mode Switcher */}
                <div className="mt-4 text-center text-xs text-[#5B6475]">
                  {isRegister ? (
                    <p>
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="font-bold text-[#3B4CCA] transition-colors hover:text-[#14213D] hover:underline"
                      >
                        Sign in here
                      </Link>
                    </p>
                  ) : (
                    <p>
                      Don't have an attendance account?{' '}
                      <Link
                        to="/register"
                        className="font-bold text-[#3B4CCA] transition-colors hover:text-[#14213D] hover:underline"
                      >
                        Create an account
                      </Link>
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
