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
import superAdminViewRoutes from './routes/superAdminViewRoutes.js';
import { requireXHR } from './middleware/csrf.js';

const app = express();

app.set('trust proxy', 1); // Render/Railway/Heroku proxy ke peeche zaroori hai (secure cookie + rate limit)
app.disable('x-powered-by');
app.use(helmet());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
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
app.use('/api/teacher/students', studentRoutes);
app.use('/api/teacher/attendance', attendanceRoutes);
app.use('/api/super-admin', superAdminViewRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);
  const cors403 = err.message === 'Not allowed by CORS';
  res.status(cors403 ? 403 : 500).json({ message: cors403 ? 'CORS blocked' : 'Server error' });
});

export default app;