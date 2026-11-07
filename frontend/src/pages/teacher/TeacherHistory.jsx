import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

function Svg({ children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {children}
    </svg>
  );
}

export default function TeacherHistory() {
  const [busy, setBusy] = useState('');

  const download = async (type) => {
    setBusy(type);
    try {
      const res = await api.get('/teacher/history-export');
      const { downloadHistoryExcel, downloadHistoryPdf } = await import(
        '../../utils/historyExport'
      );
      if (type === 'excel') await downloadHistoryExcel(res.data);
      else await downloadHistoryPdf(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not download the history');
    } finally {
      setBusy('');
    }
  };

  const options = [
    {
      type: 'excel',
      title: 'Excel file',
      hint: 'Download the complete attendance of your class as an Excel sheet.',
      button: 'Download Excel',
      icon: 'from-emerald-500 to-teal-600',
      card: 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a]',
      btn: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600',
      glyph: (
        <Svg>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </Svg>
      ),
    },
    {
      type: 'pdf',
      title: 'PDF file',
      hint: 'Download the complete attendance of your class as a PDF to print or share.',
      button: 'Download PDF',
      icon: 'from-blue-600 to-indigo-600',
      card: 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1f2a]',
      btn: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
      glyph: (
        <Svg>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </Svg>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">History</h2>
      <p className="mt-1 text-sm text-slate-500">
        Download the complete attendance history of your class whenever you need it.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-3xl">
        {options.map((o) => (
          <div
            key={o.type}
            className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${o.card}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${o.icon}`}
              >
                {o.glyph}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{o.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{o.hint}</p>
              </div>
            </div>

            <button
              onClick={() => download(o.type)}
              disabled={Boolean(busy)}
              className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${o.btn}`}
            >
              {busy === o.type ? 'Preparing…' : o.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}