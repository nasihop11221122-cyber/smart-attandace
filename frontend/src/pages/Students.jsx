import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const cardClass =
  'flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left';

function Header({ title, text, onBack }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
      <button
        onClick={onBack}
        className="shrink-0 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Back
      </button>
    </div>
  );
}

function CountCard({ name, count }) {
  return (
    <div className={cardClass}>
      <h3 className="truncate text-lg font-semibold text-slate-800" title={name}>
        {name}
      </h3>
      <p className="text-sm text-slate-500">
        Students: <span className="text-base font-semibold text-blue-700">{count}</span>
      </p>
    </div>
  );
}

export default function Students() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); // 'home', 'online' or 'manual'

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
        <Header
          title="Online Students"
          text="All programs, with the students of all their semesters."
          onBack={() => setView('home')}
        />

        {data.programs.length === 0 ? (
          <p className="mt-6 text-slate-500">No programs yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.programs.map((p) => (
              <CountCard key={p.program} name={p.program} count={p.students} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'manual') {
    return (
      <div>
        <Header
          title="Manual Students"
          text="All classes of the offline system, with their students."
          onBack={() => setView('home')}
        />

        {data.manualClasses.length === 0 ? (
          <p className="mt-6 text-slate-500">No classes yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.manualClasses.map((c) => (
              <CountCard key={c.name} name={c.name} count={c.students} />
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

        <button
          onClick={() => setView('manual')}
          className={`${cardClass} transition hover:border-blue-700 hover:shadow-sm`}
        >
          <h3 className="text-lg font-semibold text-slate-800">Manual Students</h3>
          <p className="text-3xl font-semibold text-blue-700">{data.manualTotal}</p>
        </button>
      </div>
    </div>
  );
}