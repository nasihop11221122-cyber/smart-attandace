import DashboardLayout from '../components/DashboardLayout';

const links = [
  { to: '/super-admin', label: 'Overview', end: true },
  { to: '/super-admin/principal', label: 'Principal' },
  { to: '/super-admin/admin', label: 'Admin' },
  { to: '/super-admin/teachers', label: 'Teachers' },
  { to: '/super-admin/students', label: 'Students' },
  { to: '/super-admin/profile', label: 'Profile' },
];

export default function SuperAdminDashboard() {
  return <DashboardLayout links={links} />;
}