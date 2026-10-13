import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Lock, PowerOff, Terminal } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyLockdownOverlay() {
  const {
    emergencyMode,
    emergencyMessage,
    emergencyLockedAt,
    previewEmergency,
    setPreviewEmergency,
    setEmergencyMode,
  } = useSystem();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [unlocking, setUnlocking] = useState(false);
  const canvasRef = useRef(null);

  const isVisible = emergencyMode || previewEmergency;
  const isSuperAdmin = user?.role === 'super_admin';

  // Matrix digital rain background effect
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*!§±';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(5, 6, 8, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ef4444'; // Red matrix rain for lockdown
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 45);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const handleDeactivate = async () => {
    if (previewEmergency) {
      setPreviewEmergency(false);
      return;
    }
    setUnlocking(true);
    try {
      await setEmergencyMode(false);
    } finally {
      setUnlocking(false);
    }
  };

  const formattedTime = emergencyLockedAt
    ? new Date(emergencyLockedAt).toLocaleTimeString()
    : new Date().toLocaleTimeString();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center bg-[#030406] text-red-500 overflow-hidden select-none font-mono"
      >
        {/* Matrix background canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />

        {/* CRT Scanline & grid overlay */}
        <div className="scanline-effect opacity-60" />

        {/* Background pulsing glow orb */}
        <div className="absolute h-96 w-96 rounded-full bg-red-600/15 blur-3xl pulse-glow pointer-events-none" />

        {/* Central Hacker Terminal Containment Box */}
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-20 mx-4 max-w-2xl w-full rounded-2xl border-2 border-red-500/60 bg-black/90 p-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] backdrop-blur-xl text-center"
        >
          {/* Top terminal bar */}
          <div className="flex items-center justify-between border-b border-red-900/60 pb-4 mb-6 text-xs tracking-widest text-red-400">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <Terminal className="h-4 w-4" />
              <span>TERMINAL // ROOT LOCKDOWN ACTIVE</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-red-950 px-2 py-0.5 text-red-300 font-semibold border border-red-800">
                CRITICAL
              </span>
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Warning Icon Badge */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-red-500 bg-red-950/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse">
            <ShieldAlert className="h-10 w-10" />
          </div>

          {/* Big Bold Hacker Center Text */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
            {emergencyMessage || 'SYSTEM IS OFF BY SUPER ADMIN'}
          </h1>

          {/* Multilingual bold subtitles */}
          <div className="mt-4 space-y-1.5 text-sm sm:text-base text-red-300/90 font-medium">
            <p dir="rtl" className="text-lg font-bold text-red-400 font-['Cairo']">
              تم إيقاف النظام بالكامل بواسطة المشرف العام
            </p>
            <p dir="rtl" className="text-lg font-bold text-red-400 font-['Noto_Nastaliq_Urdu']">
              سسٹم کو سپر ایڈمن نے مکمل طور پر بند کر دیا ہے
            </p>
          </div>

          {/* Technical Diagnostics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-400/80">
            <div>
              <p className="text-[10px] uppercase text-red-600">Protocol</p>
              <p className="font-semibold text-red-300">SEC-ALPHA-99</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-red-600">All Dashboards</p>
              <p className="font-semibold text-red-400">DISCONNECTED</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase text-red-600">Access Mode</p>
              <p className="font-semibold text-red-300">LOCKDOWN ONLY</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-red-500/60 tracking-wider">
            SYSTEM WILL AUTOMATICALLY RESUME AS SOON AS SUPER ADMIN DEACTIVATES EMERGENCY MODE.
          </p>

          {/* Super Admin Control Options */}
          {isSuperAdmin && (
            <div className="mt-8 pt-6 border-t border-red-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left text-xs text-red-300/80">
                <p className="font-bold text-red-200">👑 Super Admin Override Identified</p>
                <p className="text-[11px] text-red-400">
                  {previewEmergency ? 'Preview Mode Active' : 'You possess authorization to unlock'}
                </p>
              </div>

              <button
                onClick={handleDeactivate}
                disabled={unlocking}
                className="flex items-center gap-2 rounded-xl border border-red-400 bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] transition hover:bg-red-500 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <PowerOff className="h-4 w-4" />
                {previewEmergency
                  ? 'Exit Preview'
                  : unlocking
                  ? 'Deactivating…'
                  : 'Turn Off Emergency Mode'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

