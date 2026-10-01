export default function StudentDetailModal({ student, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="truncate text-xl font-semibold text-slate-800">{student.name}</h3>

        <div className="space-y-1 text-sm">
          <p className="flex justify-between gap-3">
            <span className="text-slate-500">Father Name</span>
            <span className="truncate font-medium text-slate-800">{student.fatherName}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-slate-500">Roll No</span>
            <span className="font-medium text-slate-800">{student.rollNo}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md bg-green-50 py-2">
            <p className="text-lg font-semibold text-green-700">{student.counts.present}</p>
            <p className="text-slate-500">Present</p>
          </div>
          <div className="rounded-md bg-red-50 py-2">
            <p className="text-lg font-semibold text-red-700">{student.counts.absent}</p>
            <p className="text-slate-500">Absent</p>
          </div>
          <div className="rounded-md bg-amber-50 py-2">
            <p className="text-lg font-semibold text-amber-700">{student.counts.leave}</p>
            <p className="text-slate-500">Leave</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}