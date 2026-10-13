import DashboardLayout from '../components/DashboardLayout';

const links = [
  { to: '/super-admin', label: 'Overview', key: 'overview', icon: 'LayoutDashboard', end: true },
  { to: '/super-admin/principal', label: 'Principal', key: 'principal', icon: 'Building2' },
  { to: '/super-admin/admin', label: 'Admin', key: 'admin', icon: 'ShieldCheck' },
  { to: '/super-admin/teachers', label: 'Teachers', key: 'teachers', icon: 'GraduationCap' },
  { to: '/super-admin/students', label: 'Students', key: 'students', icon: 'Users' },
  { to: '/super-admin/settings', label: 'Settings', key: 'settings', icon: 'Sliders' },
  { to: '/super-admin/profile', label: 'Profile', key: 'profile', icon: 'UserCircle' },
];

export default function SuperAdminDashboard() {
  return <DashboardLayout links={links} />;
}