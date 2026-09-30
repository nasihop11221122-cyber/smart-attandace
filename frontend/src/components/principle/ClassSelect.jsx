import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function ClassSelect({ value, onChange, currentClass = '' }) {
  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/principal/classes');
      setClasses(res.data.classes);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const addClass = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const res = await api.post('/principal/classes', { name });
      await load();
      onChange(res.data.classItem.name);
      setNewName('');
      setAdding(false);
      toast.success('Class added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setBusy(false);
    }
  };

  const removeClass = async (item) => {
    try {
      await api.delete(`/principal/classes/${item.id}`);
      setClasses((prev) => prev.filter((c) => c.id !== item.id));
      if (value === item.name) onChange('');
      toast.success('Class deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    }
  };

  return (
    <div className="flex flex-col gap-1.5 text-sm text-slate-500">
      <span>Class Name</span>

      <div className="flex items-stretch gap-2">
        <div ref={wrapRef} className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`${inputClass} flex w-full items-center justify-between gap-2 text-left`}
          >
            <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
              {value || 'Select class'}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-slate-500"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              {classes.length === 0 ? (
                <li className="px-3 py-2 text-slate-400">No classes yet</li>
              ) : (
                classes.map((item) => {
                  const taken = item.assigned && item.name !== currentClass;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 hover:bg-slate-50"
                    >
                      <button
                        type="button"
                        disabled={taken}
                        onClick={() => {
                          onChange(item.name);
                          setOpen(false);
                        }}
                        className={`flex flex-1 items-center justify-between gap-2 py-1 text-left ${
                          taken ? 'cursor-not-allowed text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        {taken && <span className="shrink-0 text-xs">(assigned)</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeClass(item)}
                        title="Delete class"
                        aria-label={`Delete class ${item.name}`}
                        className="grid h-6 w-6 shrink-0 place-items-center rounded text-red-600 transition hover:bg-red-600 hover:text-white"
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
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          title="Add class"
          aria-label="Add class"
          className="grid w-11 shrink-0 place-items-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-blue-700 hover:text-white"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {adding && (
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addClass();
              }
            }}
            placeholder="New class name"
            maxLength={30}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={addClass}
            disabled={busy}
            className="rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Adding…' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}