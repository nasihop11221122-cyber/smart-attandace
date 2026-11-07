import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Clock, Calendar, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import CourseFormModal from './CourseFormModal';
import DeleteCourseModal from './DeleteCourseModal';
import { formatCourseDate, formatDays } from '../../utils/courseDays';

// "13:05" -> "1:05 PM"
const format12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export default function ClassCourses({ classItem, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/courses', { params: { classId: classItem.id } });
      setCourses(res.data.courses);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, [classItem.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            title="Back to classes"
            aria-label="Back to classes"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {classItem.program}
            </h2>
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
              {classItem.semester} · Class Courses
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No courses yet. Press <span className="font-semibold text-teal-600 dark:text-teal-400">Create Course</span> to add the first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    {c.name}
                  </h3>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                    <Clock className="h-3.5 w-3.5" />
                    {format12(c.startTime)} – {format12(c.endTime)}
                  </span>
                </div>

                <div className="mt-3">
                  {c.days.length > 0 ? (
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatDays(c.days)}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Days are not set. Update course to set days.
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatCourseDate(c.startDate)} – {formatCourseDate(c.endDate)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <button
                  onClick={() => setEditing(c)}
                  title="Update course"
                  aria-label="Update course"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Update</span>
                </button>

                <button
                  onClick={() => setDeleting(c)}
                  title="Delete course"
                  aria-label="Delete course"
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <CourseFormModal classItem={classItem} onClose={() => setCreating(false)} onSaved={load} />
      )}
      {editing && (
        <CourseFormModal
          classItem={classItem}
          course={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
      {deleting && (
        <DeleteCourseModal course={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
}
