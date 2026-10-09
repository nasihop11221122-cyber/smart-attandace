import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/holidays', label: 'Holidays' },
  { to: '/admin/profile', label: 'Profile' },
  
];

export default function AdminDashboard() {
  return <DashboardLayout links={links} />;
}