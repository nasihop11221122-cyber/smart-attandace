const STYLES = {
  present: 'bg-green-50 text-green-700',
  absent: 'bg-red-50 text-red-700',
  leave: 'bg-amber-50 text-amber-700',
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-slate-400">—</span>;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}