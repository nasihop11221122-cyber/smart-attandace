import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function DownloadHistoryMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const download = async (type) => {
    setOpen(false);
    setBusy(type);
    try {
      const res = await api.get('/principal/history-export');
      if (res.data.classes.length === 0) {
        toast.info('There is no history to download yet');
        return;
      }

      const { downloadHistoryExcel, downloadHistoryPdf } = await import('../../utils/historyExport');
      if (type === 'excel') await downloadHistoryExcel(res.data);
      else await downloadHistoryPdf(res.data);

      toast.success('History downloaded');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not prepare the download');
    } finally {
      setBusy('');
    }
  };

  const items = [
    {
      key: 'excel',
      label: 'Excel (.xlsx)',
      hint: 'One sheet for every class',
      chip: 'XLS',
      chipClass: 'bg-green-100 text-green-700',
    },
    {
      key: 'pdf',
      label: 'PDF (.pdf)',
      hint: 'One page for every class',
      chip: 'PDF',
      chipClass: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={Boolean(busy)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {busy ? 'Preparing…' : 'Download History'}
        {!busy && (
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              onClick={() => download(item.key)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold ${item.chipClass}`}
              >
                {item.chip}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                <span className="block text-xs text-slate-500">{item.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}