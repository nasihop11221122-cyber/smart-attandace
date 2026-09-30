import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import CreateTeacherModal from '../../components/principle/CreateTeacherModal';
import UpdateTeacherModal from '../../components/principle/UpdateTeacherModal';
import DeleteTeacherModal from '../../components/principle/DeleteTeacherModal';

export default function PrincipalTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/principal/teachers');
      setTeachers(res.data.teachers);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">All Teachers</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="mt-6 text-slate-500">No teachers yet</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="truncate text-lg font-semibold text-slate-800">{t.className}</h3>
              <p className="mt-1 truncate text-sm text-slate-500">{t.name}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing(t)}
                  title="Update"
                  aria-label="Update teacher"
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-blue-700 hover:text-white"
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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>

                <button
                  onClick={() => setDeleting(t)}
                  title="Delete"
                  aria-label="Delete teacher"
                  className="grid h-9 w-9 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && <CreateTeacherModal onClose={() => setCreating(false)} onCreated={load} />}
      {editing && (
        <UpdateTeacherModal teacher={editing} onClose={() => setEditing(null)} onUpdated={load} />
      )}
      {deleting && (
        <DeleteTeacherModal teacher={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
}