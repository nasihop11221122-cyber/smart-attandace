import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { X, Award, Download, Search, CheckCircle, Calendar, GraduationCap, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { generateStudentCertificate } from '../utils/generateCertificate';

export default function GraduatedStudentsModal({ type = 'online', onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let active = true;
    const endpoint = type === 'online' ? '/admin/students/graduated' : '/teacher/students/graduated';

    api
      .get(endpoint)
      .then((res) => {
        if (active) setStudents(res.data?.students || []);
      })
      .catch((err) => {
        if (active) toast.error(err.response?.data?.message || 'Failed to load graduated students');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.rollNo || '').toLowerCase().includes(q) ||
        String(s.certificateId || '').toLowerCase().includes(q) ||
        String(s.program || s.className || '').toLowerCase().includes(q)
    );
  }, [students, query]);

  const handleDownload = async (student) => {
    setDownloadingId(student.id);
    try {
      await generateStudentCertificate(student, 'Smart Attendance Institute');
      toast.success(`Certificate downloaded for ${student.name}!`);
    } catch (err) {
      console.error('Certificate generation error:', err);
      toast.error(err?.message || err?.toString() || 'Could not generate PDF certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pass-Out Alumni & Official Certificates</span>
                <span className="rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 text-xs font-bold border border-teal-200/50 dark:border-teal-800/50">
                  {students.length} Graduated
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and download official PDF Completion & Attendance Certificates for alumni.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student name, roll number, or certificate ID..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1f2a] pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition shadow-sm"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              <span>Loading graduated records…</span>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
              <Award className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {query ? 'No matching graduated students found' : 'No students have been passed out yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                When you pass out a terminal class (10th grade, 12th grade, or 8th semester), records will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Program / Class</th>
                      <th className="px-4 py-3">Attendance</th>
                      <th className="px-4 py-3">Certificate ID</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {visible.map((s) => (
                      <tr key={s.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 font-semibold text-teal-700 dark:text-teal-300">
                          #{s.rollNo}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium">
                            {s.program || s.className} {s.semester ? `· ${s.semester}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> {s.attendancePercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {s.certificateId}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDownload(s)}
                            disabled={downloadingId === s.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3 py-1.5 font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                          >
                            {downloadingId === s.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            <span>Download Certificate</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
          <p>Official Verification Standard: ISO A4 Certified Landscape</p>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
