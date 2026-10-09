import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// "13:05" -> "1:05 PM"
const format12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

const NOTE_TEXT = {
  deleted: 'This course was deleted. Only the saved attendance is shown.',
  other_class: 'This course belongs to a class the student was in before. Only the saved attendance is shown.',
  old_daily: 'This attendance was saved before the courses were added.',
};

function DateList({ title, dates, chip }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">
        {title} <span className="text-slate-400">({dates.length})</span>
      </p>
      {dates.length === 0 ? (
        <p className="mt-1.5 text-sm text-slate-400">None</p>
      ) : (
        <div className="mt-1.5 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {dates.map((d) => (
            <span key={d} className={`rounded-md px-2 py-1 text-xs font-medium ${chip}`}>
              {formatDate(d)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentAttendanceModal({ student, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get(`/admin/students/${student.id}/attendance`);
        if (active) setData(res.data);
      } catch (err) {
        const message = err.response?.data?.message || 'Could not connect to the server';
        if (active) setError(message);
        toast.error(message);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [student.id]);

  const course = data?.courses[selected] || null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-slate-800">{student.name}</h3>
            <p className="text-sm text-slate-500">
              {student.rollNo ? `Roll No ${student.rollNo} · ` : ''}Attendance
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close"
            aria-label="Close"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!data ? (
          <p className={error ? 'text-red-600' : 'text-slate-500'}>{error || 'Loading…'}</p>
        ) : data.courses.length === 0 ? (
          <p className="text-slate-500">
            This class has no courses yet, so there is no attendance to show.
          </p>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.courses.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(i)}
                  className={`shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    i === selected
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-800">{course.name}</h4>
              {course.startTime && (
                <p className="text-sm text-slate-500">
                  {format12(course.startTime)} – {format12(course.endTime)}
                </p>
              )}
              {course.note && (
                <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {NOTE_TEXT[course.note]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl bg-green-50 py-3">
                <p className="text-2xl font-semibold text-green-700">{course.present.length}</p>
                <p className="text-slate-500">Present</p>
              </div>
              <div className="rounded-xl bg-red-50 py-3">
                <p className="text-2xl font-semibold text-red-700">{course.absent.length}</p>
                <p className="text-slate-500">Absent</p>
              </div>
              <div className="rounded-xl bg-amber-50 py-3">
                <p className="text-2xl font-semibold text-amber-700">{course.pending.length}</p>
                <p className="text-slate-500">Pending</p>
              </div>
            </div>

            <DateList title="Present dates" dates={course.present} chip="bg-green-50 text-green-800" />
            <DateList title="Absent dates" dates={course.absent} chip="bg-red-50 text-red-800" />
            {course.pending.length > 0 && (
              <DateList
                title="Pending dates"
                dates={course.pending}
                chip="bg-amber-50 text-amber-800"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}