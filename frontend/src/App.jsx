import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import AuthForm from './pages/AuthForm';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Overview from './pages/Overview';
import Principal from './pages/Principal';
import Admin from './pages/Admin';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminProfile from './pages/admin/AdminProfile';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import PrincipalHome from './pages/principal/PrincipalHome.jsx';
import PrincipalTeacher from './pages/principal/PrincipalTeacher.jsx';
import PrincipalHistory from './pages/principal/PrincipalHistory.jsx';
import PrincipalProfile from './pages/principal/PrincipalProfile.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TeacherStudents from './pages/teacher/TeacherStudents.jsx';
import TeacherAttendance from './pages/teacher/TeacherAttendance.jsx';
import TeacherProfile from './pages/teacher/TeacherProfile.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthForm mode="login" /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthForm mode="register" /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/super-admin"
            element={<ProtectedRoute role="super_admin"><SuperAdminDashboard /></ProtectedRoute>}
          >
            <Route index element={<Overview />} />
            <Route path="principal" element={<Principal />} />
            <Route path="admin" element={<Admin />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="students" element={<Students />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route
            path="/admin"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          <Route
            path="/principal"
            element={<ProtectedRoute role="principal"><PrincipalDashboard /></ProtectedRoute>}
          >
            <Route index element={<PrincipalHome />} />
            <Route path="teacher" element={<PrincipalTeacher />} />
            <Route path="history" element={<PrincipalHistory />} />
            <Route path="profile" element={<PrincipalProfile />} />
          </Route>
          <Route
            path="/teacher"
            element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>
          <Route
            path="/student"
            element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}