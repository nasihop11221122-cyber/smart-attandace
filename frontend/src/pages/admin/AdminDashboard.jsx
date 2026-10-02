import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/profile', label: 'Profile' },
];

export default function AdminDashboard() {
  return <DashboardLayout links={links} />;
}