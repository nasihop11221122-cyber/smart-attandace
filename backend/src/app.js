import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import principalRoutes from './routes/principalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import classRoutes from './routes/classRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import superAdminViewRoutes from './routes/superAdminViewRoutes.js';
import programClassRoutes from './routes/programClassRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import schoolHolidayRoutes from './routes/schoolHolidayRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import onlineStudentRoutes from './routes/onlineStudentRoutes.js';
import onlineRequestRoutes from './routes/onlineRequestRoutes.js';
import studentRequestRoutes from './routes/studentRequestRoutes.js';
import { requireXHR } from './middleware/csrf.js';
import attendanceHistoryRoutes from './routes/attendanceHistoryRoutes.js';
import historyExportRoutes from './routes/historyExportRoutes.js';
import systemSettingRoutes from './routes/systemSettingRoutes.js';
import teacherHistoryExportRoutes from './routes/teacherHistoryExportRoutes.js';
const app = express();

app.set('trust proxy', 1); // Render/Railway/Heroku proxy ke peeche zaroori hai (secure cookie + rate limit)
app.disable('x-powered-by');
app.use(helmet());

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  // Allow localhost or 127.0.0.1 on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Check configured client URLs
  if (env.clientUrls.includes(origin)) return true;
  // In development mode, allow local network IPs as well
  if (!env.isProd && /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(requireXHR);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/principals', principalRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/principal/teachers', teacherRoutes);
app.use('/api/principal/classes', classRoutes);
app.use('/api/principal/history', historyRoutes);
app.use('/api/principal/history-export', historyExportRoutes);
app.use('/api/principal/dashboard', dashboardRoutes);
app.use('/api/teacher/students', studentRoutes);
app.use('/api/teacher/attendance', attendanceRoutes);
app.use('/api/super-admin', superAdminViewRoutes);
app.use('/api/admin/classes', programClassRoutes);
app.use('/api/admin/courses', courseRoutes);
app.use('/api/admin/students', onlineStudentRoutes);
app.use('/api/admin/requests', onlineRequestRoutes);
app.use('/api/student/attendance', studentRequestRoutes);
app.use('/api/admin/holidays', holidayRoutes);
app.use('/api/principal/holidays', schoolHolidayRoutes);
app.use('/api/admin/history', attendanceHistoryRoutes);
app.use('/api/system/settings', systemSettingRoutes);
app.use('/api/teacher/history-export', teacherHistoryExportRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-varsa
app.use((err, req, res, next) => {
  console.error(err.message);
  const cors403 = err.message === 'Not allowed by CORS';
  res.status(cors403 ? 403 : 500).json({ message: cors403 ? 'CORS blocked' : 'Server error' });
});


export default app;