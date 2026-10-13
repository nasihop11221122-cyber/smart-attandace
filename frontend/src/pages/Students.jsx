import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const cardClass =
  'flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left';

export default function Students() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); // 'home' or 'online'

  useEffect(() => {
    let active = true;
    api
      .get('/super-admin/students-overview')
      .then((res) => active && setData(res.data))
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Could not connect to the server')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!data) return null;

  if (view === 'online') {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-slate-800">Online Students</h2>
            <p className="mt-1 text-sm text-slate-500">
              All programs, with the students of all their semesters.
            </p>
          </div>
          <button
            onClick={() => setView('home')}
            className="shrink-0 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {data.programs.length === 0 ? (
          <p className="mt-6 text-slate-500">No programs yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.programs.map((p) => (
              <div key={p.program} className={cardClass}>
                <h3 className="truncate text-lg font-semibold text-slate-800" title={p.program}>
                  {p.program}
                </h3>
                <p className="text-sm text-slate-500">
                  Students:{' '}
                  <span className="text-base font-semibold text-blue-700">{p.students}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Students</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => setView('online')}
          className={`${cardClass} transition hover:border-blue-700 hover:shadow-sm`}
        >
          <h3 className="text-lg font-semibold text-slate-800">Online Students</h3>
          <p className="text-3xl font-semibold text-blue-700">{data.onlineTotal}</p>
        </button>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-800">Manual Students</h3>
          <p className="text-3xl font-semibold text-blue-700">{data.manualTotal}</p>
        </div>
      </div>
    </div>
  );
}