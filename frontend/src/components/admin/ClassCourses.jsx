import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            title="Back"
            aria-label="Back to classes"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold text-slate-800">{classItem.program}</h2>
            <p className="truncate text-sm text-slate-500">{classItem.semester} · Courses</p>
          </div>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="shrink-0 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : courses.length === 0 ? (
        <p className="mt-6 text-slate-500">No courses yet. Press Create to add the first course.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="truncate text-lg font-semibold text-slate-800">{c.name}</h3>

              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {format12(c.startTime)} – {format12(c.endTime)}
              </p>

              {c.days.length > 0 ? (
                <p className="mt-2 text-sm font-medium text-slate-700">{formatDays(c.days)}</p>
              ) : (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Days are not set. Press update to choose the days.
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {formatCourseDate(c.startDate)} – {formatCourseDate(c.endDate)}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing(c)}
                  title="Update"
                  aria-label="Update course"
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-blue-700 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>

                <button
                  onClick={() => setDeleting(c)}
                  title="Delete"
                  aria-label="Delete course"
                  className="grid h-9 w-9 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
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