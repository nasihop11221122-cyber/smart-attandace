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
  DoorOpen,
  DoorClosed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginDoorScene from '../components/auth/LoginDoorScene';
import GlassFormCard from '../components/auth/GlassFormCard';

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

  // Door open state
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isDoorOpen) return;
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

  // Keyboard shortcut listener (Space or Enter toggles door when not in an input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsDoorOpen((prev) => !prev);
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
      {/* 1. 3D REALISTIC INTERACTIVE LOGIN DOOR CANVAS                    */}
      {/* ================================================================ */}
      <LoginDoorScene
        isOpen={isDoorOpen}
        onToggleDoor={setIsDoorOpen}
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
          onClick={() => setIsDoorOpen((prev) => !prev)}
          className="group inline-flex items-center gap-2 rounded-full border border-[#E7E2D9] bg-white px-4 py-2 text-xs font-bold tracking-wider text-[#14213D] uppercase shadow-xs transition-all duration-200 hover:border-[#3B4CCA] hover:bg-slate-50 active:scale-95 cursor-pointer"
          aria-label={isDoorOpen ? 'Close door' : 'Open door'}
        >
          {isDoorOpen ? (
            <DoorOpen className="h-3.5 w-3.5 text-[#3B4CCA] transition-transform duration-200" />
          ) : (
            <DoorClosed className="h-3.5 w-3.5 text-[#5B6475] transition-transform duration-200" />
          )}
          <span className="hidden sm:inline">
            {isDoorOpen ? 'Close Door' : 'Open Door'}
          </span>
          <span className="hidden sm:inline rounded bg-[#FAF8F4] border border-[#E7E2D9] px-1.5 py-0.5 text-[10px] text-[#5B6475]">
            Space
          </span>
        </button>
      </header>

      {/* ================================================================ */}
      {/* 3. SLEEK ANIMATED INDICATOR ARROW POINTING TO DOOR HANDLE        */}
      {/* ================================================================ */}
      {!isDoorOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 sm:bottom-12 sm:left-1/3"
        >
          <div className="flex items-center gap-2 rounded-full border border-[#E7E2D9] bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#14213D] shadow-sm backdrop-blur-md">
            <span>Click the door handle</span>
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
      {/* 4. SOLID WHITE CLEAN FORM OVERLAY (Revealed when Door is OPEN)   */}
      {/* ================================================================ */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-4 sm:p-6 lg:justify-end lg:pr-16 xl:pr-24 pointer-events-none">
        <AnimatePresence>
          {isDoorOpen && (
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto"
            >
              <GlassFormCard
                form={form}
                onChange={onChange}
                onSubmit={onSubmit}
                error={error}
                busy={busy}
                isRegister={isRegister}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isDoorOpen={isDoorOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
