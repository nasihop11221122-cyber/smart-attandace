/**
 * StudentCards.jsx
 *
 * A modern, responsive Student Cards management page built with:
 * - React (JavaScript)
 * - Tailwind CSS (Light & Dark theme with custom palette)
 * - Framer Motion (Staggered entry, layout animations, exit transitions)
 * - GSAP (3D cursor tilt, radial spotlight, elastic save pop, shrinking progress bar)
 *
 * --------------------------------------------------------------------------
 * TAILWIND DARK MODE CONFIGURATION NOTES:
 *
 * In Tailwind CSS v3:
 * In your `tailwind.config.js` file, ensure:
 *   module.exports = {
 *     darkMode: 'class',
 *     ...
 *   }
 *
 * In Tailwind CSS v4:
 * In your primary CSS file (e.g. `src/index.css`), add:
 *   @custom-variant dark (&:where(.dark, .dark *));
 *
 * This component toggles the `dark` class on the <html> element and preserves
 * the user's choice in localStorage with system preference fallback.
 * --------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

/* -------------------------------------------------------------------------- */
/* SEED DATA                                                                  */
/* -------------------------------------------------------------------------- */

const SEED = [
  {
    id: '1',
    name: 'Rahim',
    roll: '3',
    program: 'BS Computer Science',
    semester: '1',
    email: 'rahim@gmail.com',
  },
  {
    id: '2',
    name: 'Rahim khan',
    roll: '6',
    program: 'BS Computer Science',
    semester: '1',
    email: 'buggdadi617@gmail.com',
  },
  {
    id: '3',
    name: 'Junaid Khan',
    roll: '02',
    program: 'BS Computer Science',
    semester: '1',
    email: 'bughdadi617@gmail.com',
  },
];

/* -------------------------------------------------------------------------- */
/* 1. useTheme HOOK                                                           */
/* -------------------------------------------------------------------------- */

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // localStorage may fail in private browsing or iframe
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      // Fallback silently if storage unavailable
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return { isDark, toggleTheme };
}

/* -------------------------------------------------------------------------- */
/* 2. BUTTON COMPONENT (Btn)                                                  */
/* -------------------------------------------------------------------------- */

export function Btn({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl text-xs px-3.5 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 focus-visible:ring-teal-600 shadow-sm',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 focus-visible:ring-slate-400',
    delete:
      'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-900/50 focus-visible:ring-red-500',
    confirmDelete:
      'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 focus-visible:ring-red-600 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 focus-visible:ring-slate-400',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Action button')}
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. CARD WRAPPER COMPONENT                                                  */
/* -------------------------------------------------------------------------- */

export function Tilt({ children, className = '', onTiltReady }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (onTiltReady && cardRef.current) {
      onTiltReady(cardRef.current);
    }
  }, [onTiltReady]);

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-200 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. STUDENT CARD COMPONENT                                                  */
/* -------------------------------------------------------------------------- */

export function StudentCard({
  student,
  index,
  onSave,
  onDelete,
  prefersReducedMotion = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
  });
  const [nameError, setNameError] = useState('');
  const innerCardRef = useRef(null);

  // Sync state if student prop changes externally
  useEffect(() => {
    setFormData({ name: student.name, email: student.email });
  }, [student.name, student.email]);

  // Two-letter initials generator
  const initials = useMemo(() => {
    if (!student.name) return 'ST';
    const parts = student.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [student.name]);

  const handleSave = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }
    setNameError('');

    onSave({
      ...student,
      name: trimmedName,
      email: formData.email.trim(),
    });

    setIsEditing(false);

    // Elastic scale pop animation via GSAP upon saving
    if (innerCardRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        innerCardRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' }
      );
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: student.name, email: student.email });
    setNameError('');
    setIsEditing(false);
  };

  return (
    /* OUTER WRAPPER: Managed exclusively by Framer Motion for layout & exit transitions */
    <motion.div
      layout
      layoutId={student.id}
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 25 }
      }
      animate={{ opacity: 1, y: 0 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.95 }
      }
      transition={{
        duration: 0.45,
        delay: prefersReducedMotion ? 0 : index * 0.06,
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.35, ease: 'easeInOut' },
      }}
      className="w-full"
    >
      {/* INNER CARD: Managed by GSAP for 3D tilt and elastic transforms */}
      <Tilt
        disabled={prefersReducedMotion || isEditing || isConfirmingDelete}
        onTiltReady={(el) => {
          innerCardRef.current = el;
        }}
        className="group relative rounded-2xl border transition-colors overflow-hidden bg-white border-slate-200/80 shadow-md shadow-slate-200/50 dark:bg-[#0b1f2a] dark:border-teal-900/40 dark:shadow-none"
      >
        {/* Soft Radial Spotlight (follows cursor via CSS variables --mx, --my) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{
            background:
              'radial-gradient(450px circle at var(--mx) var(--my), rgba(20, 184, 166, 0.12), transparent 75%)',
          }}
        />

        {/* Card Content Area */}
        <div className="relative z-10 p-5 flex flex-col justify-between min-h-[220px]">
          {/* HEADER ROW */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Conic Rotating Gradient Avatar Ring */}
                <div className="relative flex-shrink-0 w-12 h-12 rounded-full p-[2px] overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute inset-[-100%] animate-[spin_8s_linear_infinite]"
                    style={{
                      background:
                        'conic-gradient(from 0deg, #14b8a6, #6366f1, #ec4899, #14b8a6)',
                    }}
                  />
                  <div className="relative w-full h-full rounded-full bg-white dark:bg-[#0b1f2a] flex items-center justify-center font-bold text-xs tracking-wider text-teal-800 dark:text-teal-300 select-none">
                    {initials}
                  </div>
                </div>

                {/* Name & Program */}
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value.trim()) setNameError('');
                        }}
                        placeholder="Student name"
                        aria-label="Student name"
                        className="w-full text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-2.5 py-1 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        autoFocus
                      />
                      {nameError && (
                        <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                          {nameError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {student.name}
                    </h3>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {student.program}
                  </p>
                </div>
              </div>

              {/* Roll Number Pill Badge */}
              <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/70 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60">
                #{student.roll}
              </span>
            </div>

            {/* DETAILS (Semester & Email) */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-500 dark:text-slate-400">Semester</span>
                <span className="font-semibold text-teal-700 dark:text-teal-300">
                  Semester {student.semester}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
                  Email
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    aria-label="Student email"
                    className="w-48 text-right text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-2 py-0.5 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 truncate"
                  />
                ) : (
                  <span
                    title={student.email}
                    className="truncate max-w-[190px] text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                  >
                    {student.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM ACTIONS ROW */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
            {isEditing ? (
              <>
                <Btn
                  variant="ghost"
                  onClick={handleCancelEdit}
                  ariaLabel={`Cancel editing ${student.name}`}
                >
                  Cancel
                </Btn>
                <Btn
                  variant="primary"
                  onClick={handleSave}
                  ariaLabel={`Save changes for ${student.name}`}
                >
                  Save
                </Btn>
              </>
            ) : (
              <>
                <Btn
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  ariaLabel={`Edit ${student.name}`}
                >
                  Edit
                </Btn>
                <Btn
                  variant="delete"
                  onClick={() => setIsConfirmingDelete(true)}
                  ariaLabel={`Delete ${student.name}`}
                >
                  Delete
                </Btn>
              </>
            )}
          </div>
        </div>

        {/* DELETE CONFIRMATION OVERLAY (Inside Card) */}
        <AnimatePresence>
          {isConfirmingDelete && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-20 bg-slate-900/40 dark:bg-black/60 p-5 flex flex-col justify-center items-center text-center"
            >
              <div className="bg-white dark:bg-[#0b1f2a] rounded-xl p-4 shadow-xl border border-slate-200 dark:border-teal-900/60 max-w-xs w-full">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Confirmation
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Delete {student.name}?
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This action can be undone from the toast.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <Btn
                    variant="secondary"
                    onClick={() => setIsConfirmingDelete(false)}
                    ariaLabel="Keep student"
                  >
                    Keep
                  </Btn>
                  <Btn
                    variant="confirmDelete"
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      onDelete(student);
                    }}
                    ariaLabel={`Confirm deletion of ${student.name}`}
                  >
                    Delete
                  </Btn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tilt>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. MAIN STUDENT CARDS PAGE                                                 */
/* -------------------------------------------------------------------------- */

export default function StudentCards() {
  const { isDark, toggleTheme } = useTheme();
  const [students, setStudents] = useState(SEED);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedRecord, setDeletedRecord] = useState(null);
  const toastProgressRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Check user preference for reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Filtered students by live search (name, email, roll, or program)
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.roll.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Handle Save
  const handleSaveStudent = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  // Handle Delete with Undo option
  const handleDeleteStudent = (studentToDelete) => {
    const originalIndex = students.findIndex((s) => s.id === studentToDelete.id);

    // Remove from array
    setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));

    // Clear any existing undo timer
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    // Save deleted info for undo
    setDeletedRecord({
      student: studentToDelete,
      index: originalIndex >= 0 ? originalIndex : 0,
    });

    // 5-second automatic dismiss
    toastTimeoutRef.current = setTimeout(() => {
      setDeletedRecord(null);
    }, 5000);
  };

  // Handle Undo
  const handleUndo = () => {
    if (!deletedRecord) return;
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    const { student, index } = deletedRecord;
    setStudents((prev) => {
      const next = [...prev];
      next.splice(index, 0, student);
      return next;
    });
    setDeletedRecord(null);
  };

  // Animate the shrinking progress bar on the undo toast with GSAP
  useEffect(() => {
    if (deletedRecord && toastProgressRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        toastProgressRef.current,
        { width: '100%' },
        { width: '0%', duration: 5, ease: 'linear' }
      );
    }
  }, [deletedRecord, prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#031018] text-slate-800 dark:text-slate-100 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP BAR */}
        <header className="rounded-2xl border bg-white/80 dark:bg-[#0b1f2a]/90 backdrop-blur-md border-slate-200/80 dark:border-teal-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, roll or program…"
              aria-label="Search students"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
            />
          </div>

          {/* Right: Live count pill + Theme toggle */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
            {/* Live Count Pill */}
            <span
              aria-live="polite"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/60 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800/60 select-none"
            >
              {filteredStudents.length}{' '}
              {filteredStudents.length === 1 ? 'student' : 'students'}
            </span>

            {/* Light / Dark Toggle Button */}
            <Btn
              variant="secondary"
              onClick={toggleTheme}
              ariaLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="flex items-center gap-1.5"
            >
              {isDark ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark mode</span>
                </>
              )}
            </Btn>
          </div>
        </header>

        {/* RESPONSIVE GRID OF CARDS */}
        <main>
          {filteredStudents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No student matches your search.
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, index) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    index={index}
                    onSave={handleSaveStudent}
                    onDelete={handleDeleteStudent}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* UNDO TOAST NOTIFICATION */}
        <AnimatePresence>
          {deletedRecord && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white dark:bg-[#0b1f2a] dark:text-slate-100 rounded-2xl p-4 shadow-2xl border border-slate-800 dark:border-teal-900/60 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium truncate">
                  {deletedRecord.student.name} deleted
                </p>
                <Btn
                  variant="primary"
                  onClick={handleUndo}
                  ariaLabel={`Undo deletion of ${deletedRecord.student.name}`}
                  className="py-1 px-3 text-xs"
                >
                  Undo
                </Btn>
              </div>

              {/* 5-second shrinking progress bar */}
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 dark:bg-slate-900"
              >
                <div
                  ref={toastProgressRef}
                  className="h-full bg-teal-500 transition-none"
                  style={{ width: '100%' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
