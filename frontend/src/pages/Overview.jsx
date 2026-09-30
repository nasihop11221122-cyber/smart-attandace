import { useAuth } from '../context/AuthContext';

export default function Overview() {
  const { user } = useAuth();
  return (
    <h2 className="p-6 text-2xl font-semibold text-slate-800">
      Welcome, {user.name}
    </h2>
  );
}