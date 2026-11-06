import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Calendar,
  Check,
  AlertCircle,
  Loader2,
  User,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';

/**
 * Frosted-Glass Pill Input Component
 * High-precision frosted glass styling with leading/trailing icons and focus animations
 */
function GlassPillInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  disabled = false,
  autoComplete,
  placeholder,
  hasError = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  onTrailingClick,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col text-left">
      {/* Label: 11.5px Inter 600, uppercase, letter-spacing 0.06em */}
      <label
        htmlFor={id}
        className="mb-[6px] text-[11.5px] font-semibold tracking-[0.06em] text-[#1b2230]/75 uppercase"
      >
        {label}
      </label>

      {/* Input container with shake animation on error */}
      <motion.div
        animate={
          hasError
            ? { x: [-4, 4, -3, 3, -1, 1, 0] }
            : isFocused
            ? { y: -1 }
            : { y: 0 }
        }
        transition={
          hasError
            ? { duration: 0.22, ease: 'easeInOut' }
            : { duration: 0.18, ease: 'easeOut' }
        }
        className="relative flex items-center"
      >
        {/* Leading Icon (16px, 55% opacity) */}
        {LeadingIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-[#1b2230]/60">
            <LeadingIcon className="h-4 w-4" />
          </div>
        )}

        {/* Pill Input */}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            backgroundColor: isFocused
              ? 'rgba(255, 255, 255, 0.40)'
              : 'rgba(255, 255, 255, 0.25)',
            borderColor: hasError
              ? 'rgba(240, 68, 82, 0.85)'
              : isFocused
              ? 'rgba(56, 160, 255, 0.9)'
              : 'rgba(255, 255, 255, 0.65)',
            boxShadow: hasError
              ? '0 0 0 4px rgba(240, 68, 82, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              : isFocused
              ? '0 0 0 4px rgba(56, 160, 255, 0.18), 0 8px 22px rgba(56, 160, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.05), 0 4px 14px rgba(20, 30, 50, 0.06)',
            backdropFilter: 'blur(10px) saturate(140%)',
            WebkitBackdropFilter: 'blur(10px) saturate(140%)',
          }}
          className={`h-[46px] w-full rounded-[14px] border text-[14px] font-medium text-[#1b2230] placeholder-[#1b2230]/45 caret-[#1b2230] outline-none transition-all duration-[180ms] ${
            LeadingIcon ? 'pl-10' : 'pl-4'
          } ${TrailingIcon ? 'pr-11' : 'pr-4'}`}
        />

        {/* Trailing Icon (Eye toggle or Calendar) */}
        {TrailingIcon && (
          <div className="absolute right-3.5 flex items-center">
            {onTrailingClick ? (
              <motion.button
                type="button"
                onClick={onTrailingClick}
                tabIndex={-1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center text-[#1b2230]/55 hover:text-[#1b2230] transition-colors cursor-pointer"
              >
                <TrailingIcon className="h-4 w-4" />
              </motion.button>
            ) : (
              <div className="pointer-events-none flex items-center text-[#1b2230]/50">
                <TrailingIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * GlassFormCard
 * 
 * 1. STATIC: All continuous floating/parallax movement removed as requested.
 * 2. NO BACKGROUND CIRCLE: Circle disc behind the card removed.
 * 3. UNIQUE ANIMATION: 3D depth-flip transition with smooth perspective push
 *    and top frosted-glass segmented mode switcher.
 * 4. FULL TRANSPARENCY: Premium frosted glass with backdrop-filter blur.
 */
export default function GlassFormCard({
  form,
  onChange,
  onSubmit,
  error,
  busy,
  isRegister = false,
  showPassword,
  setShowPassword,
  isDoorOpen = true,
}) {
  const [currentFace, setCurrentFace] = useState(isRegister ? 'signup' : 'login');
  const [rememberMe, setRememberMe] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);

  // Unique 3D Transition Handler
  const triggerFlip = (targetFace) => {
    if (targetFace === currentFace || isFlipping) return;
    setIsFlipping(true);
    setCurrentFace(targetFace);
    setTimeout(() => {
      setIsFlipping(false);
    }, 700);
  };

  const isSignup = currentFace === 'signup';

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 3D Static Perspective Wrapper */}
      <div
        style={{
          perspective: 1400,
        }}
        className="relative flex items-center justify-center"
      >
        {/* Animated 3D Card with Unique Flip & Depth Spring */}
        <motion.div
          animate={{
            rotateY: isSignup ? 180 : 0,
            scale: isFlipping ? 0.95 : 1,
            z: isFlipping ? -60 : 0,
          }}
          transition={{
            duration: 0.7,
            ease: [0.34, 1.3, 0.64, 1], // Custom bouncy spring curve
          }}
          style={{
            width: '356px',
            minHeight: '480px',
            transformStyle: 'preserve-3d',
          }}
          className="relative flex items-center justify-center"
        >
          {/* ============================================================== */}
          {/* LOGIN FACE (Front Face)                                        */}
          {/* ============================================================== */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.60)',
              boxShadow:
                '0 12px 36px 0 rgba(31, 38, 135, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.04)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`w-[356px] rounded-[28px] p-6 transition-all duration-300 ${
              !isSignup
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0 select-none'
            }`}
          >
            {/* Top Sleek Segmented Switcher */}
            <div className="relative mx-auto mb-5 flex w-full max-w-[240px] items-center rounded-full border border-white/50 bg-white/20 p-1 backdrop-blur-md shadow-2xs">
              <button
                type="button"
                onClick={() => triggerFlip('login')}
                className="relative z-10 flex-1 py-1.5 text-center text-[12px] font-semibold transition-colors duration-200 cursor-pointer text-[#121824]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => triggerFlip('signup')}
                className="relative z-10 flex-1 py-1.5 text-center text-[12px] font-medium transition-colors duration-200 cursor-pointer text-[#121824]/65 hover:text-[#121824]"
              >
                Sign Up
              </button>
              {/* Sliding Active Pill */}
              <motion.div
                layoutId="active-mode-pill"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/90 shadow-sm"
              />
            </div>

            {/* Inner frame */}
            <div className="relative mx-auto flex w-full max-w-[290px] flex-col items-center">
              {/* Heading */}
              <h1
                style={{
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.85)',
                }}
                className="text-[24px] font-bold text-[#121824] text-center tracking-tight"
              >
                Welcome Back
              </h1>
              <p className="mt-1 text-[12px] text-[#1b2230]/65 text-center">
                Enter your credentials to access your portal
              </p>

              {/* Error Notice */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-3 flex w-full items-center gap-2 rounded-[10px] border border-rose-300/80 bg-rose-50/85 px-3 py-1.5 text-[11.5px] text-rose-700 shadow-2xs backdrop-blur-xs"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                  <span className="truncate">{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="mt-4 flex w-full flex-col gap-3.5">
                {/* Username Field */}
                <GlassPillInput
                  id="login-username"
                  name="email"
                  label="Username or Email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  disabled={!isDoorOpen || busy}
                  autoComplete="username email"
                  placeholder="name@school.edu"
                  hasError={Boolean(error)}
                  leadingIcon={User}
                />

                {/* Password Field */}
                <GlassPillInput
                  id="login-password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={onChange}
                  required
                  disabled={!isDoorOpen || busy}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  hasError={Boolean(error)}
                  leadingIcon={Lock}
                  trailingIcon={showPassword ? EyeOff : Eye}
                  onTrailingClick={() => setShowPassword(!showPassword)}
                />

                {/* "Remember me" Row + Pill Toggle */}
                <div className="mt-0.5 flex items-center justify-between px-1">
                  <label
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex cursor-pointer items-center gap-2.5 select-none"
                  >
                    <div
                      style={{
                        borderColor: rememberMe ? '#1b2230' : 'rgba(255, 255, 255, 0.75)',
                        backgroundColor: rememberMe ? '#1b2230' : 'rgba(255, 255, 255, 0.35)',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                      className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors duration-150"
                    >
                      {rememberMe && <Check className="h-3.5 w-3.5 stroke-[3] text-white" />}
                    </div>
                    <span className="text-[12.5px] font-medium text-[#1b2230]/80">Remember me</span>
                  </label>

                  {/* Pill Toggle on right */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{
                      backgroundColor: rememberMe ? '#2f9bf0' : '#d4d8dd',
                      boxShadow: rememberMe
                        ? '0 0 10px rgba(47, 155, 240, 0.4)'
                        : 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    className="relative flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9bf0]"
                  >
                    <motion.div
                      animate={{ x: rememberMe ? 16 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      className="h-4 w-4 rounded-full bg-white shadow-xs"
                    />
                  </button>
                </div>

                {/* Full width SIGN IN Button */}
                <motion.button
                  type="submit"
                  disabled={busy || !isDoorOpen}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    letterSpacing: '0.08em',
                    boxShadow:
                      'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(20, 30, 50, 0.15)',
                  }}
                  className="group relative mt-2 flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-[#1b2230] text-[12px] font-semibold text-white uppercase transition-all duration-[200ms] hover:bg-gradient-to-r hover:from-[#1e6bff] hover:to-[#38bdf8] hover:shadow-[0_10px_28px_rgba(30,120,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9bf0] disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>SIGN IN</span>
                  )}
                </motion.button>

                {/* Flip Switch to Sign Up */}
                <div className="mt-1 text-center">
                  <button
                    type="button"
                    onClick={() => triggerFlip('signup')}
                    className="text-[12px] font-medium text-[#1b2230]/75 hover:text-[#1e6bff] transition-colors cursor-pointer"
                  >
                    Don't have an account? <span className="font-semibold underline">Sign Up</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SIGN UP FACE (Back Face - 180deg)                              */}
          {/* ============================================================== */}
          <div
            style={{
              transform: 'rotateY(180deg)',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.60)',
              boxShadow:
                '0 12px 36px 0 rgba(31, 38, 135, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.04)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`absolute inset-0 w-[356px] rounded-[28px] p-6 transition-all duration-300 ${
              isSignup
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0 select-none'
            }`}
          >
            {/* Top Sleek Segmented Switcher */}
            <div className="relative mx-auto mb-5 flex w-full max-w-[240px] items-center rounded-full border border-white/50 bg-white/20 p-1 backdrop-blur-md shadow-2xs">
              <button
                type="button"
                onClick={() => triggerFlip('login')}
                className="relative z-10 flex-1 py-1.5 text-center text-[12px] font-medium transition-colors duration-200 cursor-pointer text-[#121824]/65 hover:text-[#121824]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => triggerFlip('signup')}
                className="relative z-10 flex-1 py-1.5 text-center text-[12px] font-semibold transition-colors duration-200 cursor-pointer text-[#121824]"
              >
                Sign Up
              </button>
              {/* Sliding Active Pill */}
              <motion.div
                layoutId="active-mode-pill-back"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-y-1 right-1 w-[calc(50%-4px)] rounded-full bg-white/90 shadow-sm"
              />
            </div>

            {/* Inner frame */}
            <div className="relative mx-auto flex w-full max-w-[290px] flex-col items-center">
              {/* Heading */}
              <h2
                style={{
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.85)',
                }}
                className="text-[24px] font-bold text-[#121824] text-center tracking-tight"
              >
                Create Account
              </h2>
              <p className="mt-1 text-[12px] text-[#1b2230]/65 text-center">
                Register to get started with your attendance account
              </p>

              {/* Error Notice */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-2.5 flex w-full items-center gap-2 rounded-[10px] border border-rose-300/80 bg-rose-50/85 px-3 py-1.5 text-[11.5px] text-rose-700 shadow-2xs backdrop-blur-xs"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                  <span className="truncate">{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="mt-3.5 flex w-full flex-col gap-2.5">
                {/* Email Field */}
                <GlassPillInput
                  id="signup-email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  disabled={!isDoorOpen || busy}
                  autoComplete="email"
                  placeholder="name@school.edu"
                  hasError={Boolean(error)}
                  leadingIcon={Mail}
                />

                {/* Password Field */}
                <GlassPillInput
                  id="signup-password"
                  name="password"
                  label="Create Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={onChange}
                  required
                  disabled={!isDoorOpen || busy}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  hasError={Boolean(error)}
                  leadingIcon={Lock}
                  trailingIcon={showPassword ? EyeOff : Eye}
                  onTrailingClick={() => setShowPassword(!showPassword)}
                />

                {/* Confirm Password Field */}
                <GlassPillInput
                  id="signup-confirm-password"
                  name="name"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (onChange) {
                      onChange({ target: { name: 'name', value: e.target.value } });
                    }
                  }}
                  required
                  disabled={!isDoorOpen || busy}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  hasError={Boolean(error)}
                  leadingIcon={Lock}
                  trailingIcon={Calendar}
                />

                {/* Full width SIGN UP Button */}
                <motion.button
                  type="submit"
                  disabled={busy || !isDoorOpen}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    letterSpacing: '0.08em',
                    boxShadow:
                      'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(20, 30, 50, 0.15)',
                  }}
                  className="group relative mt-1.5 flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-[#1b2230] text-[12px] font-semibold text-white uppercase transition-all duration-[200ms] hover:bg-gradient-to-r hover:from-[#1e6bff] hover:to-[#38bdf8] hover:shadow-[0_10px_28px_rgba(30,120,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9bf0] disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>SIGN UP</span>
                  )}
                </motion.button>

                {/* Flip Switch back to Login */}
                <div className="mt-1 text-center">
                  <button
                    type="button"
                    onClick={() => triggerFlip('login')}
                    className="text-[12px] font-medium text-[#1b2230]/75 hover:text-[#1e6bff] transition-colors cursor-pointer"
                  >
                    Already have an account? <span className="font-semibold underline">Login</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
