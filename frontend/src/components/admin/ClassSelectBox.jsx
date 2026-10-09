import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const inputClass =
  'rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20';

export default function ClassSelectBox({ value, onChange }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get('/admin/classes');
        if (active) setClasses(res.data.classes);
      } catch (err) {
        if (active) toast.error(err.response?.data?.message || 'Could not connect to the server');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-500">
      Class (Program · Semester)
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={loading}
        className={inputClass}
      >
        <option value="">{loading ? 'Loading…' : 'Select class'}</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      {!loading && classes.length === 0 && (
        <span className="text-xs text-amber-700">
          No classes yet. Create a class from the Classes page first.
        </span>
      )}
    </label>
  );
}