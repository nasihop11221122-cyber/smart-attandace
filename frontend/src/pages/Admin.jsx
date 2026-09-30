import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import CreateAdminModal from '../components/CreateAdminModal';
import UpdateAdminModal from '../components/UpdateAdminModal';

export default function Admin() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await api.get('/admins');
      setAdmins(res.data.admins);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admins load nahi ho sake');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async (a) => {
    if (!window.confirm(`Kya aap "${a.name}" ko delete karna chahte hain?`)) return;
    try {
      await api.delete(`/admins/${a.id}`);
      toast.success('Admin deleted successfully');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server se connect nahi ho saka');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">All Admins</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="mt-6 text-slate-500">Abhi koi admin nahi hai.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {admins.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-lg font-bold text-white">
                {a.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{a.name}</p>
                <p className="truncate text-sm text-slate-500">{a.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditing(a)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateAdminModal onClose={() => setCreateOpen(false)} onCreated={fetchAdmins} />
      )}

      {editing && (
        <UpdateAdminModal
          admin={editing}
          onClose={() => setEditing(null)}
          onUpdated={fetchAdmins}
        />
      )}
    </div>
  );
}