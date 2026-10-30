import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

const PWA_INSTALLED_KEY = 'smart_attendance_pwa_installed';
const PWA_DISMISSED_KEY = 'smart_attendance_pwa_dismissed';

/**
 * PwaInstallPrompt
 * 
 * Production-ready PWA installation controller:
 * - Permanent suppression once installed (stored in localStorage).
 * - Immediate suppression when launched in standalone mode.
 * - Suppressed via native navigator.getInstalledRelatedApps() when available.
 * - Listens for appinstalled and accepted installation prompts.
 * - Zero repeated nagging for users who already have the app.
 */
export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopHelpModal, setShowDesktopHelpModal] = useState(false);

  useEffect(() => {
    // 1. Check permanent storage: if already recorded as installed, do not show
    const alreadyInstalledInStorage = localStorage.getItem(PWA_INSTALLED_KEY) === 'true';
    if (alreadyInstalledInStorage) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if running in standalone mode (installed app opened)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandaloneMode) {
      // User is inside the installed app, mark permanently as installed
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      setIsInstalled(true);
      return;
    }

    // 3. Check dismissed flag (suppress if dismissed recently)
    const dismissedUntil = localStorage.getItem(PWA_DISMISSED_KEY);
    const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();
    if (isDismissed) {
      return;
    }

    // 4. Query navigator.getInstalledRelatedApps() (supported in modern Chrome / Android)
    if (typeof navigator !== 'undefined' && 'getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps()
        .then((relatedApps) => {
          if (relatedApps && relatedApps.length > 0) {
            localStorage.setItem(PWA_INSTALLED_KEY, 'true');
            setIsInstalled(true);
            setShowPrompt(false);
          }
        })
        .catch(() => {});
    }

    // 5. Detect iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    setIsIOS(isIOSDevice);

    // 6. Listen for Android / Chromium `beforeinstallprompt`
    // (Chromium natively will NOT fire this event if the app is already installed)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed && !alreadyInstalledInStorage) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 7. Listen for successful installation event
    const handleAppInstalled = () => {
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS only: show prompt after gentle delay (since iOS doesn't have beforeinstallprompt)
    let iosTimer = null;
    if (isIOSDevice && !alreadyInstalledInStorage && !isDismissed && !isStandaloneMode) {
      iosTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  // Dismiss button handler (remembers dismissal for 14 days)
  const handleDismiss = () => {
    setShowPrompt(false);
    const fourteenDaysLater = Date.now() + 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem(PWA_DISMISSED_KEY, String(fourteenDaysLater));
  };

  // Trigger Install flow based on platform
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          // Permanently mark as installed
          localStorage.setItem(PWA_INSTALLED_KEY, 'true');
          setIsInstalled(true);
          setShowPrompt(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Installation error:', err);
      }
    } else {
      setShowDesktopHelpModal(true);
    }
  };

  // Handler when user confirms iOS installation or completes it
  const handleIOSConfirmed = () => {
    localStorage.setItem(PWA_INSTALLED_KEY, 'true');
    setIsInstalled(true);
    setShowPrompt(false);
    setShowIOSModal(false);
  };

  // If already installed, never render anything
  if (isInstalled || !showPrompt) {
    return (
      <>
        <IOSInstallModal
          isOpen={showIOSModal}
          onClose={() => setShowIOSModal(false)}
          onConfirm={handleIOSConfirmed}
        />
        <DesktopInstallModal
          isOpen={showDesktopHelpModal}
          onClose={() => setShowDesktopHelpModal(false)}
        />
      </>
    );
  }

  return (
    <>
      {/* Floating Modern Pill: "Install App" / "Download App" */}
      <aside
        aria-label="Install Smart Attendance Application"
        className="fixed bottom-5 right-5 z-50 flex items-center justify-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="group relative flex items-center gap-3 rounded-2xl border border-[#3B4CCA]/20 bg-white/95 p-2.5 sm:p-3 shadow-[0_12px_36px_rgba(20,33,61,0.18)] backdrop-blur-md ring-1 ring-black/5"
        >
          {/* App Icon Thumbnail */}
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#4B5EFC] to-[#232E8F] shadow-sm">
            <img
              src="/icon-192x192.png"
              alt="Smart Attendance App Icon"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Smartphone className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>

          {/* App Info */}
          <div className="flex flex-col pr-1">
            <span className="text-xs sm:text-sm font-bold text-[#14213D] leading-tight">
              Smart Attendance
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#5B6475] leading-tight">
              {isIOS ? 'Install on iPhone' : 'Install as Fast App'}
            </span>
          </div>

          {/* Main Action Install Button */}
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-xl bg-[#3B4CCA] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all duration-150 hover:bg-[#2F3DAA] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4CCA]"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Install App</span>
          </button>

          {/* Dismiss 'X' Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#5B6475] transition-colors hover:bg-[#14213D]/10 hover:text-[#14213D]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </aside>

      {/* iOS Step-by-Step Guide Modal */}
      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        onConfirm={handleIOSConfirmed}
      />

      {/* Desktop / Manual Browser Guidance Modal */}
      <DesktopInstallModal
        isOpen={showDesktopHelpModal}
        onClose={() => setShowDesktopHelpModal(false)}
      />
    </>
  );
}

/**
 * iOS Installation Instructions Modal
 */
function IOSInstallModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#E7E2D9] bg-white p-6 shadow-2xl"
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#4B5EFC] to-[#232E8F] shadow-sm">
                <img
                  src="/apple-touch-icon.png"
                  alt="App Icon"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Install on iPhone / iPad
                </h3>
                <p className="text-xs text-[#5B6475]">
                  Get full-screen app experience
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#5B6475] transition-colors hover:bg-[#14213D]/10 hover:text-[#14213D]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Steps List */}
          <div className="mt-5 space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 rounded-xl border border-[#E7E2D9]/70 bg-[#FAF8F4] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B4CCA] text-xs font-bold text-white">
                1
              </span>
              <div className="text-xs text-[#14213D] leading-relaxed">
                Open this website in <strong className="font-semibold text-[#3B4CCA]">Safari</strong> on your iPhone.
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 rounded-xl border border-[#E7E2D9]/70 bg-[#FAF8F4] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B4CCA] text-xs font-bold text-white">
                2
              </span>
              <div className="text-xs text-[#14213D] leading-relaxed">
                Tap the <strong className="font-semibold text-[#3B4CCA]">Share</strong> button <Share2 className="inline-block h-3.5 w-3.5 text-[#3B4CCA] mx-1 align-baseline" /> at the bottom or top of your browser.
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 rounded-xl border border-[#E7E2D9]/70 bg-[#FAF8F4] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B4CCA] text-xs font-bold text-white">
                3
              </span>
              <div className="text-xs text-[#14213D] leading-relaxed">
                Scroll down and tap <strong className="font-semibold text-[#3B4CCA]">"Add to Home Screen"</strong> <PlusSquare className="inline-block h-3.5 w-3.5 text-[#3B4CCA] mx-1 align-baseline" />.
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 rounded-xl border border-[#E7E2D9]/70 bg-[#FAF8F4] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B4CCA] text-xs font-bold text-white">
                4
              </span>
              <div className="text-xs text-[#14213D] leading-relaxed">
                Enable <strong className="font-semibold text-[#3B4CCA]">"Open as Web App"</strong> if available on your iOS version.
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3 rounded-xl border border-[#E7E2D9]/70 bg-[#FAF8F4] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B4CCA] text-xs font-bold text-white">
                5
              </span>
              <div className="text-xs text-[#14213D] leading-relaxed">
                Tap <strong className="font-semibold text-[#14B8A6]">"Add"</strong> in the top-right corner to finish.
              </div>
            </div>
          </div>

          {/* Action Confirmation Button */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B4CCA] py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#2F3DAA]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>I've Added It to My Home Screen</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * Desktop Installation Guidance Modal
 */
function DesktopInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-sm rounded-3xl border border-[#E7E2D9] bg-white p-6 shadow-2xl"
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4B5EFC] to-[#232E8F] text-white">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14213D]">
                  Install Smart Attendance
                </h3>
                <p className="text-xs text-[#5B6475]">Desktop App</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#5B6475] hover:bg-[#14213D]/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-xs text-[#5B6475] leading-relaxed">
            To install this app on your computer, click the <strong className="text-[#3B4CCA]">Install</strong> icon in your browser address bar (top-right of Chrome, Edge, or Brave), or open the browser menu (<strong className="text-[#14213D]">&#8942;</strong>) and select <strong>"Install Smart Attendance"</strong>.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-[#3B4CCA] py-2 text-xs font-bold text-white transition-colors hover:bg-[#2F3DAA]"
          >
            Understood
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
