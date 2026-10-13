import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { UserCheck, Plus, Edit2, Trash2 } from 'lucide-react';
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
      toast.error(err.response?.data?.message || 'Could not load the admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async (a) => {
    if (!window.confirm(`Are you sure you want to delete "${a.name}"?`)) return;
    try {
      await api.delete(`/admins/${a.id}`);
      toast.success('Admin deleted successfully');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not connect to the server');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">All Admins</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage system administrators and privileges.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Admin</span>
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-[var(--text-muted)]">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="mt-6 text-[var(--text-muted)]">No admins yet. Press Create to add the first one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {admins.map((a) => (
            <motion.div
              key={a.id}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="ultra-card flex flex-col justify-between gap-4 p-5 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-lg font-black text-[var(--primary-fg)] shadow-[0_0_15px_var(--glow)]">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-[var(--text-main)]" title={a.name}>
                    {a.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]" title={a.email}>
                    {a.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setEditing(a)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-bold text-[var(--text-main)] transition hover:border-[var(--border-focus)] hover:scale-105 active:scale-95"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Update</span>
                </button>
                <button
                  onClick={() => handleDelete(a)}
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