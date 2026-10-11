import axios from 'axios';

// Live site: always call /api on the same site (vercel.json sends it to the backend),
// so the login cookie belongs to this site. On your own computer: VITE_API_URL or the local backend.
const baseURL = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // httpOnly cookie bhejne ke liye
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

export default api;