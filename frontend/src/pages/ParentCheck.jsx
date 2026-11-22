import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, User, Clock, FileText, Percent } from 'lucide-react';
import api from '../api/axios';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

const buttonClass =
  'rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors';

export default function ParentCheck() {
  const navigate = useNavigate();
  const [rollNo, setRollNo] = useState('');
  const [searching, setSearching] = useState(false);
  const [child, setChild] = useState(null);
  const [error, setError] = useState('');
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    if (!child) {
      setError('');
      setShowNotFound(false);
    }
  }, [child]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rollNo.trim()) {
      setError('Please enter a roll number');
      return;
    }
    setError('');
    setShowNotFound(false);
    setSearching(true);

    try {
      const response = await api.get('/public/student-by-rollno', {
        params: { rollNo: rollNo.trim() },
      });
      setSearching(false);
      setChild(response.data);
    } catch (err) {
      setSearching(false);
      if (err.response && err.response.status === 404) {
        setShowNotFound(true);
        setError('No student found with this roll number');
      } else {
        setError('Search failed. Please try again.');
      }
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') handleSearch(e);
  };

  const presentCount = child?.attendance.filter((a) => a.status === 'Present').length || 0;
  const absentCount = child?.attendance.filter((a) => a.status === 'Absent').length || 0;
  const leaveCount = child?.attendance.filter((a) => a.status === 'Leave').length || 0;
  const totalDays = child?.attendance.length || 0;
  const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const goBack = () => {
    setChild(null);
    setRollNo('');
    setError('');
    setShowNotFound(false);
  };

  // Search View (when no child selected)
  if (!child) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome, Parent</h2>
                <p className="mt-1 text-slate-500">
                  Check your child's attendance and profile details here.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Search Your Child</h3>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="rollNo"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Enter Roll Number (e.g. 101)"
                className={inputClass + ' sm:flex-1'}
                disabled={searching}
              />
              <button
                type="submit"
                disabled={searching}
                className={buttonClass + ' sm:w-auto'}
              >
                {searching ? 'Searching…' : <><Search className="h-4 w-4 mr-1" /> Search</>}
              </button>
            </form>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </div>

          {showNotFound && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 text-sm mb-6">
              No student found with roll number "{rollNo}". Please try again.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Child Profile View (when child is loaded)
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{child.name}</h2>
              <p className="text-slate-500">Roll No: {child.rollNo}</p>
            </div>
            <div className="flex items-center gap-4 text-right sm:text-left">
              <div className="px-4 py-2 rounded-xl bg-green-50 text-green-700 font-medium text-sm">
                {child.level} • {child.className}
              </div>
              <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium text-sm">
                {child.section}
              </div>
              <div className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium text-sm">
                {child.teacherName}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Present</p>
                <p className="text-2xl font-bold text-green-700">{presentCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Absent</p>
                <p className="text-2xl font-bold text-red-700">{absentCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Attendance %</p>
                <p className="text-2xl font-bold text-indigo-700">{percentage}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <Percent className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {child.attendance.map((record, index) => {
                  const statusColor =
                    record.status === 'Present'
                      ? 'bg-green-50 text-green-700'
                      : record.status === 'Absent'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700';
                  return (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-800">{record.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {child.attendance.length === 0 && (
            <p className="mt-4 text-slate-500 text-center">No attendance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
