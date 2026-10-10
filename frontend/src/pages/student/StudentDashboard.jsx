import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/student', label: 'Attendance', end: true },
  { to: '/student/history', label: 'History' },
  { to: '/student/profile', label: 'Profile' },
];

export default function StudentDashboard() {
  return <DashboardLayout links={links} />;
}