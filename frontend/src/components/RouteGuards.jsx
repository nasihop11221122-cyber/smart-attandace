import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleRoutes = {
  super_admin: '/super-admin',
  admin: '/admin',
  principal: '/principal',
  teacher: '/teacher',
  student: '/student',
};

const Loader = () => (
  <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>
);

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }
  return children;
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user && roleRoutes[user.role]) return <Navigate to={roleRoutes[user.role]} replace />;
  return children;
}