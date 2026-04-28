# Deployment Guide

This project is structured to be deployed with the **Frontend on Vercel** and the **Backend on Render**, using a single GitHub repository.

## Project Structure
- `/frontend`: React (Vite) application.
- `/courier_backend`: Node.js (Express + Puppeteer) application.

---

## 1. Backend Deployment (Render)

1.  **Create a New Web Service** on Render.
2.  **Connect your GitHub Repository**.
3.  **Configure Settings**:
    - **Name**: `courier-tracking-backend` (or your choice)
    - **Environment**: `Node`
    - **Root Directory**: `courier_backend`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
4.  **Plan**: Ensure you use a plan that supports Puppeteer (Standard or higher is recommended, but Starter might work for low volume).
5.  **Environment Variables**:
    - `PORT`: 3001 (Render sets this automatically, but ensure your code uses `process.env.PORT`)

---

## 2. Frontend Deployment (Vercel)

1.  **Create a New Project** on Vercel.
2.  **Connect your GitHub Repository**.
3.  **Configure Settings**:
    - **Root Directory**: `frontend`
    - **Framework Preset**: `Vite`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`
4.  **Environment Variables**:
    - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://your-backend.onrender.com`). **Do not include a trailing slash.**

---

## Troubleshooting

### CORS Errors
The backend is configured with `cors()` to allow all origins. If you want to restrict it, update `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend.vercel.app'
}));
```

### Puppeteer on Render
Render's Node environment supports Puppeteer out of the box. Ensure the launch arguments include `--no-sandbox` and `--disable-setuid-sandbox` (already configured in `utils/browserPool.js`).

### Tracking Failures
Puppeteer may be blocked by some couriers if too many requests are made. The current implementation uses a shared browser pool and user-agent rotation to minimize detection.
