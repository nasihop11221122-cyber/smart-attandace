import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function SuperAdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title="Super Admin" />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}