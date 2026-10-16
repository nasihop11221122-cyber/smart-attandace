import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/teacher/students', label: 'Students' },
  { to: '/teacher/attendance', label: 'Attendance' },
  { to: '/teacher/history', label: 'History' },
  { to: '/teacher/profile', label: 'Profile' },
];

export default function TeacherDashboard() {
  return <DashboardLayout links={links} />;
}