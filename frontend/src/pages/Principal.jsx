import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import CreatePrincipalModal from '../components/CreatePrincipalModal';
import UpdatePrincipalModal from '../components/UpdatePrincipalModal';

export default function Principal() {
  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchPrincipals = useCallback(async () => {
    try {
      const res = await api.get('/principals');
      setPrincipals(res.data.principals);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Principals load nahi ho sake');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrincipals();
  }, [fetchPrincipals]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Kya aap "${p.name}" ko delete karna chahte hain?`)) return;
    try {
      await api.delete(`/principals/${p.id}`);
      toast.success('Principal deleted successfully');
      fetchPrincipals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server se connect nahi ho saka');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">All Principals</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : principals.length === 0 ? (
        <p className="mt-6 text-slate-500">Abhi koi principal nahi hai.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {principals.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-lg font-bold text-white">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{p.name}</p>
                <p className="truncate text-sm text-slate-500">{p.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(p)}
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
        <CreatePrincipalModal
          onClose={() => setCreateOpen(false)}
          onCreated={fetchPrincipals}
        />
      )}

      {editing && (
        <UpdatePrincipalModal
          principal={editing}
          onClose={() => setEditing(null)}
          onUpdated={fetchPrincipals}
        />
      )}
    </div>
  );
}