import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function DownloadHistoryMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef(null);

  // Bahar click karne par menu band ho jaye
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const download = async (type) => {
    setOpen(false);
    setBusy(true);
    try {
      const res = await api.get('/admin/history/export');
      const { downloadAdminHistoryExcel, downloadAdminHistoryPdf } = await import(
        '../../utils/adminHistoryExport'
      );
      if (type === 'excel') await downloadAdminHistoryExcel(res.data);
      else await downloadAdminHistoryPdf(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download the history');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Preparing…' : 'Download'}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => download('excel')}
            className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => download('pdf')}
            className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}