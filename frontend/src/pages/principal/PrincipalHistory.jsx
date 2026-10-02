import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import ClassStudentsView from '../../components/ClassStudentsView';

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
      <h2 className="text-2xl font-semibold text-slate-800">History</h2>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="mt-6 text-slate-500">No classes are assigned to teachers yet</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((c) => (
            <button
              key={c.className}
              onClick={() => setSelected(c)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-700 hover:shadow-sm"
            >
              <h3 className="truncate text-lg font-semibold text-slate-800">{c.className}</h3>
              <p className="mt-1 truncate text-sm text-slate-500">{c.teacherName}</p>
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