import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  Search,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  Award,
  RefreshCw,
  HelpCircle,
  X,
} from 'lucide-react';
import api from '../api/axios';

const LOCAL_STORAGE_KEY = 'smart_attendance_recent_child';

export default function ParentCheck() {
  const navigate = useNavigate();

  // Search form state
  const [rollNo, setRollNo] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Results state
  const [child, setChild] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [recentChild, setRecentChild] = useState(null);

  // Filters inside child profile
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load available classes & saved recent child on mount
  useEffect(() => {
    // 1. Fetch classes for dropdown
    api
      .get('/public/classes')
      .then((res) => {
        if (res.data?.allClasses) {
          setAvailableClasses(res.data.allClasses);
        }
      })
      .catch(() => {
        // Non-fatal if classes fail to load
      });

    // 2. Load recent child from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setRecentChild(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Save to recent searches
  const saveRecentChild = (childData) => {
    try {
      const summary = {
        id: childData.id,
        name: childData.name,
        rollNo: childData.rollNo,
        className: childData.className,
        fatherName: childData.fatherName || '',
        type: childData.type,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(summary));
      setRecentChild(summary);
    } catch {
      // Ignore
    }
  };

  const clearRecentChild = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setRecentChild(null);
    } catch {
      // Ignore
    }
  };

  // Perform search
  const handleSearch = async (e, customParams = null) => {
    if (e) e.preventDefault();

    const targetRoll = customParams?.rollNo || rollNo.trim();
    const targetClass = customParams?.className !== undefined ? customParams.className : selectedClass;
    const targetStudentId = customParams?.studentId || null;
    const targetType = customParams?.type || null;

    if (!targetStudentId && !targetRoll) {
      setError('Please enter a student roll number');
      return;
    }

    setError('');
    setCandidates([]);
    setSearching(true);

    try {
      const params = {};
      if (targetStudentId) {
        params.studentId = targetStudentId;
        if (targetType) params.type = targetType;
      } else {
        params.rollNo = targetRoll;
        if (targetClass) params.className = targetClass;
      }

      const response = await api.get('/public/student-by-rollno', { params });
      setSearching(false);

      if (response.data.multiple && response.data.candidates?.length > 1) {
        setCandidates(response.data.candidates);
        setChild(null);
      } else {
        const studentData = response.data.student || response.data;
        setChild(studentData);
        setCandidates([]);
        saveRecentChild(studentData);
      }
    } catch (err) {
      setSearching(false);
      setChild(null);
      setCandidates([]);
      if (err.response?.status === 404) {
        setError(err.response.data?.message || 'No student found with these credentials.');
      } else {
        setError('Unable to fetch attendance. Please check your connection and try again.');
      }
    }
  };

  const handleSelectCandidate = (candidate) => {
    handleSearch(null, {
      studentId: candidate.id,
      type: candidate.type,
      rollNo: candidate.rollNo,
      className: candidate.className,
    });
  };

  const handleQuickLoadRecent = () => {
    if (!recentChild) return;
    setRollNo(recentChild.rollNo);
    setSelectedClass(recentChild.className || '');
    handleSearch(null, {
      studentId: recentChild.id,
      type: recentChild.type,
      rollNo: recentChild.rollNo,
      className: recentChild.className,
    });
  };

  const resetSearch = () => {
    setChild(null);
    setCandidates([]);
    setError('');
  };

  // Printable report
  const handlePrint = () => {
    window.print();
  };

  // Unique months available in child's attendance
  const availableMonths = useMemo(() => {
    if (!child?.attendance) return [];
    const months = new Set();
    child.attendance.forEach((r) => {
      if (r.date) {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          months.add(key);
        }
      }
    });
    return Array.from(months).sort().reverse();
  }, [child]);

  // Filtered attendance records
  const filteredAttendance = useMemo(() => {
    if (!child?.attendance) return [];
    return child.attendance.filter((r) => {
      if (monthFilter !== 'ALL') {
        const monthKey = r.date?.slice(0, 7);
        if (monthKey !== monthFilter) return false;
      }
      if (statusFilter !== 'ALL') {
        if (r.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [child, monthFilter, statusFilter]);

  // Stats
  const stats = child?.stats || {
    totalDays: child?.attendance?.length || 0,
    present: child?.attendance?.filter((a) => a.status === 'Present').length || 0,
    absent: child?.attendance?.filter((a) => a.status === 'Absent').length || 0,
    leave: child?.attendance?.filter((a) => a.status === 'Leave').length || 0,
    percentage:
      child?.attendance?.length > 0
        ? Math.round(
            ((child.attendance.filter((a) => a.status === 'Present').length) /
              child.attendance.length) *
              100
          )
        : 0,
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'present') {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
        label: 'Present',
      };
    }
    if (s === 'absent') {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        icon: XCircle,
        label: 'Absent',
      };
    }
    if (s === 'leave') {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        icon: Clock,
        label: 'On Leave',
      };
    }
    return {
      bg: 'bg-slate-100 text-black border-slate-300',
      dot: 'bg-slate-500',
      icon: HelpCircle,
      label: status || 'Not Marked',
    };
  };

  // Attendance health criteria
  const getAttendanceHealth = (pct) => {
    if (pct >= 75) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Excellent - Exam Eligible',
        text: 'Your child meets all regular institutional attendance requirements.',
      };
    }
    if (pct >= 60) {
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Moderate Attention Required',
        text: 'Attendance is slightly below optimal criteria (75%).',
      };
    }
    return {
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      label: 'Critical Shortage Alert',
      text: 'Attendance is critically low. Please contact the class coordinator.',
    };
  };

  const health = getAttendanceHealth(stats.percentage);

  // Format date readable
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F0F7FF] text-slate-800 font-sans selection:bg-blue-600 selection:text-white print:bg-white print:p-0 overflow-x-hidden">
      {/* Decorative Dot Grid Pattern Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-35"
        style={{
          backgroundImage: `radial-gradient(#93C5FD 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Floating Educational Circles / Glow Accents */}
      <div className="pointer-events-none fixed -top-24 -left-24 -z-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-28 -z-10 h-96 w-96 rounded-full bg-sky-200/35 blur-3xl" />

      {/* Decorative SVG Wave at the Bottom */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 -z-10 overflow-hidden leading-none opacity-40">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-20 text-blue-100"
          fill="currentColor"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,30 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

      {/* ============================================================== */}
      {/* WONDERFUL NAVBAR (EDGE-TO-EDGE)                                */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/85 backdrop-blur-md shadow-[0_4px_20px_rgba(37,99,235,0.05)] print:hidden">
        <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Home / Back Button */}
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => (child ? resetSearch() : navigate('/'))}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-blue-50/60 hover:border-blue-300 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500 transition-transform group-hover:-translate-x-0.5 group-hover:text-blue-600" />
              <span>{child ? 'Back to Search' : 'Home'}</span>
            </motion.button>

            <div className="hidden h-5 w-px bg-slate-200 sm:block" />

            {/* Parent Portal Brand Emblem & Typography */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-100">
                <ShieldCheck className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-black" style={{ color: '#000000' }}>
                  Parent Portal
                </span>
                <span className="text-[10px] font-semibold text-slate-400 leading-none">
                  Smart Attendance System
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {child && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                title="Print or Save Official Report Slip"
              >
                <Printer className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Print Slip</span>
              </motion.button>
            )}

            {/* Live Parent Portal Pill at the Right Edge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Parent Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT CONTAINER                                         */}
      {/* ============================================================== */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait">
          {/* =========================================================== */}
          {/* VIEW 1: SEARCH & HERO                                       */}
          {/* =========================================================== */}
          {!child && (
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* HERO CARD */}
              <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-[0_4px_25px_rgba(37,99,235,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    {/* Attendance Verification Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 mb-3 shadow-2xs">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span>Student Attendance Verification</span>
                    </div>

                    {/* Welcome Parents Heading */}
                    <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-black" style={{ color: '#000000' }}>
                      Welcome, Parents
                    </h1>

                    {/* Original Description */}
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-xl">
                      Check your child's daily arrival status, real-time presence, and detailed monthly attendance history in one click.
                    </p>
                  </div>

                  {/* GraduationCap in Blue Gradient Icon Container */}
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-600/25">
                    <GraduationCap className="h-9 w-9 sm:h-10 sm:w-10" />
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS (SAVED CHILD IN PHONE) */}
              {recentChild && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-blue-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-xs transition hover:border-blue-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
                        {recentChild.name?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                          Previously Checked
                        </p>
                        <p className="truncate text-sm font-bold text-[#18181B]">
                          {recentChild.name}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            (Roll #{recentChild.rollNo} • {recentChild.className})
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleQuickLoadRecent}
                        disabled={searching}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <span>Check Now</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </motion.button>
                      <button
                        type="button"
                        onClick={clearRecentChild}
                        className="rounded-lg p-2 text-slate-400 hover:text-slate-600 transition"
                        title="Clear saved child"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SEARCH CARD */}
              <div className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-[0_4px_25px_rgba(37,99,235,0.05)]">
                {/* Search Header */}
                <h2 className="text-base font-bold text-black flex items-center gap-2 mb-5" style={{ color: '#000000' }}>
                  <Search className="h-4.5 w-4.5 text-blue-600" />
                  <span style={{ color: '#000000' }}>Search by Roll Number &amp; Class</span>
                </h2>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid gap-3.5 sm:grid-cols-12">
                    {/* Roll Number Input */}
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Student Roll Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. 101, 12, or 2024-CS-01"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        disabled={searching}
                        autoFocus
                      />
                    </div>

                    {/* Class Dropdown */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Class / Program <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm font-medium text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        disabled={searching}
                      >
                        <option value="">All Classes</option>
                        {availableClasses.map((clsName) => (
                          <option key={clsName} value={clsName}>
                            {clsName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Attendance Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={searching || !rollNo.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying records…</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        <span>Search Attendance</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-rose-900">Student Not Found</p>
                      <p className="mt-0.5 text-rose-700 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* MULTIPLE MATCHES SELECTION */}
              {candidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-2 text-amber-900">
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-bold text-base">Multiple Students Found</h3>
                  </div>
                  <p className="text-xs text-amber-800 mb-4">
                    There are {candidates.length} students registered with Roll #{rollNo}. Please select your child's class below:
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {candidates.map((cand) => (
                      <motion.div
                        key={cand.id}
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectCandidate(cand)}
                        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-blue-500 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-[#18181B] group-hover:text-blue-600 transition truncate">
                              {cand.name}
                            </p>
                            {cand.fatherName && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                Father: {cand.fatherName}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                                {cand.className}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                Roll #{cand.rollNo}
                              </span>
                            </div>
                          </div>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* =========================================================== */}
          {/* VIEW 2: CHILD ATTENDANCE DASHBOARD                          */}
          {/* =========================================================== */}
          {child && (
            <motion.div
              key="child-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* STUDENT HEADER CARD */}
              <div className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-[0_4px_25px_rgba(37,99,235,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl shadow-md shadow-blue-500/20">
                      {child.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black" style={{ color: '#000000' }}>
                          {child.name}
                        </h1>
                        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-black border border-slate-300" style={{ color: '#000000' }}>
                          {child.type === 'college' ? 'College' : 'School'}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-500">
                        {child.fatherName && (
                          <span>
                            <strong className="text-slate-700">Father:</strong> {child.fatherName}
                          </span>
                        )}
                        <span>
                          <strong className="text-slate-700">Roll No:</strong> {child.rollNo}
                        </span>
                        <span>
                          <strong className="text-slate-700">Class:</strong> {child.className || 'General'}
                        </span>
                        {child.teacherName && (
                          <span>
                            <strong className="text-slate-700">Teacher:</strong> {child.teacherName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Switch Child Button */}
                  <div className="flex items-center gap-2 shrink-0 print:hidden">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetSearch}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:border-slate-300"
                    >
                      <Search className="h-3.5 w-3.5 text-slate-500" />
                      <span>Search Another Child</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* LIVE TODAY'S STATUS BANNER */}
              {(() => {
                const today = getStatusBadge(child.todayStatus);
                const TodayIcon = today.icon;
                return (
                  <div
                    className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition shadow-xs ${
                      child.todayStatus === 'Present'
                        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white'
                        : child.todayStatus === 'Absent'
                        ? 'border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50/40 to-white'
                        : child.todayStatus === 'Leave'
                        ? 'border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50/40 to-white'
                        : 'border-slate-200 bg-gradient-to-r from-slate-50 via-gray-50/40 to-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
                            child.todayStatus === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : child.todayStatus === 'Absent'
                              ? 'bg-rose-600 text-white'
                              : child.todayStatus === 'Leave'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          <TodayIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Today's Status ({formatDate(child.todayDate)})
                          </p>
                          <h3 className="text-xl font-bold tracking-tight text-black mt-0.5" style={{ color: '#000000' }}>
                            {child.todayStatus === 'Present' && 'Present Today in School'}
                            {child.todayStatus === 'Absent' && 'Marked Absent Today'}
                            {child.todayStatus === 'Leave' && 'Approved Leave Today'}
                            {child.todayStatus === 'Not Marked Yet' && 'Attendance Not Yet Marked'}
                          </h3>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border ${today.bg}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${today.dot} animate-pulse`} />
                          {child.todayStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* STATS OVERVIEW CARDS */}
              <div className="grid gap-4 sm:grid-cols-4">
                {/* Attendance Rate */}
                <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Attendance Rate
                    </span>
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {stats.percentage}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.percentage >= 75
                            ? 'bg-emerald-500'
                            : stats.percentage >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Present Days */}
                <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Present Days
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-emerald-700">
                    {stats.present}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Total verified sessions</p>
                </div>

                {/* Absent Days */}
                <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Absent Days
                    </span>
                    <XCircle className="h-4 w-4 text-rose-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-rose-700">
                    {stats.absent}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Total missed sessions</p>
                </div>

                {/* Total Working Days */}
                <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Records
                    </span>
                    <Calendar className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-indigo-700">
                    {stats.totalDays}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {stats.leave > 0 ? `${stats.leave} leave days recorded` : 'Recorded working days'}
                  </p>
                </div>
              </div>

              {/* Attendance Health Notice */}
              <div className={`rounded-2xl border px-4 py-3 text-xs flex items-center justify-between gap-3 ${health.badge}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>{health.label}:</strong> {health.text}
                  </span>
                </div>
                <span className="font-bold shrink-0">Req: 75%</span>
              </div>

              {/* ATTENDANCE HISTORY TABLE WITH FILTERS */}
              <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_4px_25px_rgba(37,99,235,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Attendance Log</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing {filteredAttendance.length} of {child.attendance?.length || 0} total records
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2 print:hidden">
                    {/* Month Filter */}
                    {availableMonths.length > 0 && (
                      <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="ALL">All Months</option>
                        {availableMonths.map((m) => {
                          const [y, mon] = m.split('-');
                          const d = new Date(Number(y), Number(mon) - 1, 1);
                          const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                          return (
                            <option key={m} value={m}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Present">Present Only</option>
                      <option value="Absent">Absent Only</option>
                      <option value="Leave">Leave Only</option>
                    </select>
                  </div>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-bold rounded-l-xl">Date &amp; Day</th>
                        {child.type === 'college' && (
                          <th className="px-4 py-3 font-bold">Course / Subject</th>
                        )}
                        <th className="px-4 py-3 font-bold text-right rounded-r-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttendance.map((record, index) => {
                        const badge = getStatusBadge(record.status);
                        const BadgeIcon = badge.icon;
                        return (
                          <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-4 py-3.5 font-medium text-slate-900">
                              {formatDate(record.date)}
                            </td>
                            {child.type === 'college' && (
                              <td className="px-4 py-3.5 text-slate-600">
                                {record.courseName || 'General Session'}
                              </td>
                            )}
                            <td className="px-4 py-3.5 text-right">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}
                              >
                                <BadgeIcon className="h-3.5 w-3.5" />
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredAttendance.length === 0 && (
                  <div className="py-12 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">No records found</p>
                    <p className="text-xs text-slate-400">
                      Try changing your month or status filter above.
                    </p>
                  </div>
                )}
              </div>

              {/* Report Footer */}
              <div className="rounded-2xl border border-blue-100 bg-white p-4 text-center text-xs text-slate-500 shadow-2xs">
                <p>
                  Smart Attendance System - Official Parent Portal Verification Slip - Generated on{' '}
                  {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
