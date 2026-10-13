import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Users, School } from 'lucide-react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const cardClass =
  'flex w-full flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-left transition-all hover:border-[var(--border-focus)] hover:shadow-[var(--glow)]';

function Header({ title, text, onBack }) {
  const { isRTL } = useLanguage();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{text}</p>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--border-focus)]"
      >
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
        <span>Back</span>
      </button>
    </div>
  );
}

function CountCard({ name, count }) {
  return (
    <motion.div whileHover={{ y: -3 }} className={cardClass}>
      <h3 className="truncate text-lg font-bold text-[var(--text-main)]" title={name}>
        {name}
      </h3>
      <p className="text-sm text-[var(--text-muted)]">
        Students: <span className="text-base font-extrabold text-[var(--primary)]">{count}</span>
      </p>
    </motion.div>
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

  if (loading) return <p className="text-[var(--text-muted)]">Loading…</p>;
  if (!data) return null;

  if (view === 'online') {
    return (
      <div className="space-y-6">
        <Header
          title="Online Students"
          text="All programs, with the students of all their semesters."
          onBack={() => setView('home')}
        />

        {data.programs.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No programs yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      <div className="space-y-6">
        <Header
          title="Manual Students"
          text="All classes of the offline system, with their students."
          onBack={() => setView('home')}
        />

        {data.manualClasses.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No classes yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.manualClasses.map((c) => (
              <CountCard key={c.name} name={c.name} count={c.students} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Students</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setView('online')}
          className={`${cardClass} cursor-pointer`}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Online Students</h3>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--primary)] border border-[var(--border)]">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-[var(--primary)]">{data.onlineTotal}</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setView('manual')}
          className={`${cardClass} cursor-pointer`}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Manual Students</h3>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--primary)] border border-[var(--border)]">
              <School className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-black text-[var(--primary)]">{data.manualTotal}</p>
        </motion.button>
      </div>
    </div>
  );
}