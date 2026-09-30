import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/principal', label: 'Overview', end: true },
  { to: '/principal/teacher', label: 'Teacher' },
  { to: '/principal/history', label: 'History' },
  { to: '/principal/profile', label: 'Profile' },
];

export default function PrincipalDashboard() {
  return <DashboardLayout links={links} />;
}