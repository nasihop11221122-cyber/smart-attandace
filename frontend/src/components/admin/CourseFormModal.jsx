import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { DAY_OPTIONS, formatCourseDate } from '../../utils/courseDays';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function CourseFormModal({ classItem, course, onClose, onSaved }) {
  const editing = Boolean(course);
  const [form, setForm] = useState({
    name: course?.name || '',
    startTime: course?.startTime || '',
    endTime: course?.endTime || '',
  });
  const [days, setDays] = useState(course?.days || []);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDay = (value) =>
    setDays((current) =>
      current.includes(value) ? current.filter((d) => d !== value) : [...current, value]
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.endTime <= form.startTime) {
      toast.error('End time must be after the start time');
      return;
    }
    if (days.length === 0) {
      toast.error('Please select at least one day');
      return;
    }
    setBusy(true);
    const payload = { ...form, days };
    try {
      if (editing) {
        await api.patch(`/admin/courses/${course.id}`, payload);
        toast.success('Course updated successfully');
      } else {
        await api.post('/admin/courses', { classId: classItem.id, ...payload });
        toast.success('Course created successfully');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6"
      >
        <div>
          <h3 className="text-xl font-semibold text-slate-800">
            {editing ? 'Update Course' : 'Create Course'}
          </h3>
          <p className="text-sm text-slate-500">{classItem.label}</p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Course Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            maxLength={60}
            placeholder="e.g. Programming Fundamentals"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-slate-500">
            Start Time
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-slate-500">
            End Time
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-slate-500">
          Days of the week
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map((d) => {
              const selected = days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  aria-pressed={selected}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    selected
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
          {course?.startDate
            ? `This course runs from ${formatCourseDate(course.startDate)} to ${formatCourseDate(course.endDate)}.`
            : 'This course will run for 6 months from today.'}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : editing ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}