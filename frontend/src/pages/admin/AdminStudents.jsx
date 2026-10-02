import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import CreateOnlineStudentModal from '../../components/admin/CreateOnlineStudentModal';
import UpdateOnlineStudentModal from '../../components/admin/UpdateOnlineStudentModal';
import DeleteOnlineStudentModal from '../../components/admin/DeleteOnlineStudentModal';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data.students);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || String(s.rollNo || '').toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">All Students</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : students.length === 0 ? (
        <p className="mt-6 text-slate-500">No students yet</p>
      ) : (
        <>
          <div className="mt-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or roll no"
              aria-label="Search students"
              className="w-full max-w-sm rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 text-slate-500">No students found</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="truncate text-lg font-semibold text-slate-800">{s.name}</h3>

                  <div className="mt-3 space-y-1 text-sm">
                    <p className="flex justify-between gap-3">
                      <span className="text-slate-500">Roll No</span>
                      <span className="font-medium text-slate-800">{s.rollNo}</span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-slate-500">Class</span>
                      <span className="truncate font-medium text-slate-800">{s.className}</span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-slate-500">Email</span>
                      <span className="truncate font-medium text-slate-800">{s.email}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setEditing(s)}
                      title="Update"
                      aria-label="Update student"
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
                      onClick={() => setDeleting(s)}
                      title="Delete"
                      aria-label="Delete student"
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
        </>
      )}

      {creating && (
        <CreateOnlineStudentModal onClose={() => setCreating(false)} onCreated={load} />
      )}
      {editing && (
        <UpdateOnlineStudentModal
          student={editing}
          onClose={() => setEditing(null)}
          onUpdated={load}
        />
      )}
      {deleting && (
        <DeleteOnlineStudentModal
          student={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={load}
        />
      )}
    </div>
  );
}