export default function AttendancePreviewModal({
  classLabel,
  date,
  students,
  marks,
  busy,
  onClose,
  onSubmit,
}) {
  const absent = students.filter((s) => marks[s.id] === 'absent');
  const leave = students.filter((s) => marks[s.id] === 'leave');
  const presentCount = students.length - absent.length - leave.length;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Attendance Preview</h3>
          <p className="text-sm text-slate-500">
            {classLabel} · {date}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md bg-green-50 py-2">
            <p className="text-lg font-semibold text-green-700">{presentCount}</p>
            <p className="text-slate-500">Present</p>
          </div>
          <div className="rounded-md bg-red-50 py-2">
            <p className="text-lg font-semibold text-red-700">{absent.length}</p>
            <p className="text-slate-500">Absent</p>
          </div>
          <div className="rounded-md bg-amber-50 py-2">
            <p className="text-lg font-semibold text-amber-700">{leave.length}</p>
            <p className="text-slate-500">Leave</p>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto text-sm">
          {absent.length === 0 && leave.length === 0 && (
            <p className="text-slate-500">All students are marked present.</p>
          )}

          {absent.length > 0 && (
            <div>
              <p className="mb-1 font-semibold text-red-700">Absent</p>
              <ul className="space-y-1 text-slate-800">
                {absent.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0 text-slate-500">Roll {s.rollNo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {leave.length > 0 && (
            <div>
              <p className="mb-1 font-semibold text-amber-700">Leave</p>
              <ul className="space-y-1 text-slate-800">
                {leave.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0 text-slate-500">Roll {s.rollNo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Attendance can be submitted only once per day and cannot be changed later.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}