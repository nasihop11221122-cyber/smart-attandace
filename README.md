# Auth App (Express + Vite React)

## Local
```
cd backend  && cp .env.example .env && npm install && npm run dev
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Deploy
**Backend (Render/Railway)** - Root: `backend`, Build: `npm install`, Start: `npm start`
Env: NODE_ENV=production, MONGO_URI, JWT_SECRET (32+ chars), CLIENT_URL=https://your-frontend.com
MongoDB Atlas me Network Access -> 0.0.0.0/0 allow karein.

**Frontend (Vercel/Netlify)** - Root: `frontend`, Build: `npm run build`, Output: `dist`
Env: VITE_API_URL=https://your-backend.com/api  (build se PEHLE set karein, Vite build time par bake karta hai)
