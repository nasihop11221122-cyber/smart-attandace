import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import ClassStudentsView from '../../components/ClassStudentsView';
import DownloadHistoryMenu from '../../components/principle/DownloadHistoryMenu';

export default function PrincipalHistory() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get('/principal/history/classes');
      setClasses(res.data.classes);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  if (selected) {
    return (
      <ClassStudentsView
        basePath="/principal/history"
        classLabel={selected.className}
        teacherName={selected.teacherName}
        onBack={() => {
          setSelected(null);
          loadClasses();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance History</h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Class records, student attendance summaries, and official reports.</p>
        </div>
        <div className="ml-auto">
          <DownloadHistoryMenu />
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No classes are assigned to teachers yet</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <button
              key={c.className}
              onClick={() => setSelected(c)}
              className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-md cursor-pointer"
            >
              <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">{c.className}</h3>
              <p className="mt-1 truncate text-sm font-medium text-slate-500 dark:text-slate-400">{c.teacherName}</p>
              <p className="mt-3 text-sm text-slate-500">
                {c.studentCount} {c.studentCount === 1 ? 'student' : 'students'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}