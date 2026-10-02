import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import ClassStudentsView from '../components/ClassStudentsView';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get('/super-admin/teachers');
        if (active) setTeachers(res.data.teachers);
      } catch (err) {
        if (active) toast.error(err.response?.data?.message || 'Could not connect to the server');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (selected) {
    return (
      <div className="p-6">
        <ClassStudentsView
          basePath="/super-admin"
          classLabel={selected.className}
          teacherName={selected.name}
          onBack={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-slate-800">All Teachers</h2>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="mt-6 text-slate-500">No teachers yet</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-1.5 bg-linear-to-r from-blue-700 to-blue-400" />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-xl font-bold text-blue-700 ring-4 ring-blue-50/60">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Form Master
                    </p>
                    <h3 className="mt-0.5 truncate text-xl font-bold text-slate-800">{t.name}</h3>
                  </div>
                </div>

                <div className="my-4 h-px bg-slate-100" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Assigned class</span>
                  <span className="max-w-[60%] truncate rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {t.className || 'No class'}
                  </span>
                </div>

                <div className="flex-1" />

                <button
                  onClick={() => setSelected(t)}
                  disabled={!t.className}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-700 disabled:hover:shadow-sm disabled:active:scale-100"
                >
                  View class
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}