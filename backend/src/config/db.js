import mongoose from 'mongoose';
import { env } from './env.js';

// On Vercel one running instance serves many requests, so the connection is saved here and reused.
// (On your own computer, server.js connects once and this still works the same.)
const cache = globalThis.__mongoCache || (globalThis.__mongoCache = { conn: null, promise: null });

export const connectDB = async () => {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 })
      .then((m) => {
        console.log('MongoDB connected');
        return m;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // the next request tries again
    throw err;
  }
  return cache.conn;
};