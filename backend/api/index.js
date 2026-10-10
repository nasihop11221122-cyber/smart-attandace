import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel runs this function for every request (see vercel.json)
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Server error' }));
    return;
  }
  app(req, res);
}