import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
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
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">All Teachers</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Form masters, assigned classes, and student enrollments.
        </p>
      </div>

      {loading ? (
        <p className="mt-6 text-[var(--text-muted)]">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="mt-6 text-[var(--text-muted)]">No teachers yet</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="ultra-card flex flex-col overflow-hidden p-5 shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)]">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                    Form Master
                  </p>
                  <h3 className="mt-0.5 truncate text-lg font-bold text-[var(--text-main)]">{t.name}</h3>
                </div>
              </div>

              <div className="my-4 h-px bg-[var(--border)]" />

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  Assigned class
                </span>
                <span className="max-w-[60%] truncate rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs font-bold text-[var(--text-main)] border border-[var(--border)]">
                  {t.className || 'No class'}
                </span>
              </div>

              <div className="flex-1" />

              <button
                onClick={() => setSelected(t)}
                disabled={!t.className}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-[var(--primary-fg)] shadow-sm transition-all hover:brightness-110 hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <span>View class</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}