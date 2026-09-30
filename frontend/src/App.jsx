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
import AdminDashboard from './pages/AdminDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

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
          />
          <Route
            path="/principal"
            element={<ProtectedRoute role="principal"><PrincipalDashboard /></ProtectedRoute>}
          />
          <Route
            path="/teacher"
            element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>}
          />
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