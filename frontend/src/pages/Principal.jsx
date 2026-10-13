import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
      toast.error(err.response?.data?.message || 'Could not load the principals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrincipals();
  }, [fetchPrincipals]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await api.delete(`/principals/${p.id}`);
      toast.success('Principal deleted successfully');
      fetchPrincipals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">All Principals</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage educational principals and supervisors.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Principal</span>
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-[var(--text-muted)]">Loading…</p>
      ) : principals.length === 0 ? (
        <p className="mt-6 text-[var(--text-muted)]">No principals yet. Press Create to add the first one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {principals.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="ultra-card flex flex-col justify-between gap-4 p-5 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-lg font-black text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)]">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-[var(--text-main)]" title={p.name}>
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]" title={p.email}>
                    {p.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setEditing(p)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-bold text-[var(--text-main)] transition hover:border-[var(--border-focus)] hover:scale-105 active:scale-95"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Update</span>
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
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