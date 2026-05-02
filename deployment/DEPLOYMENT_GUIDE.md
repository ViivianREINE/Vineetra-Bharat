# 🚀 Vineetra Elite: Deployment & Production Guide

This guide ensures **Vineetra — India’s AI Clinical Copilot** is production-ready and globally accessible.

---

## 1. Backend Deployment (Render)

Render is ideal for the Node.js API and ML services.

### Steps:
1.  **New Web Service**: Connect your GitHub repository `https://github.com/ViivianREINE/Vineetra-Bharat`.
2.  **Root Directory**: `vineetra-elite/backend`
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    *   `PORT`: `3001`
    *   `GEMINI_API_KEY`: `your_key_here`
    *   `NODE_ENV`: `production`

---

## 2. Frontend Deployment (Vercel)

Vercel provides lightning-fast edge delivery for the React frontend.

### Steps:
1.  **New Project**: Connect the same GitHub repository.
2.  **Framework Preset**: `Vite`
3.  **Root Directory**: `vineetra-elite/frontend`
4.  **Build Command**: `npm run build`
5.  **Output Directory**: `dist`
6.  **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com/api`

---

## 3. GitHub Action (Optional Auto-Deploy)

Add a `.github/workflows/deploy.yml` to automate the process on every push.

---

## 4. Production Benchmarks

*   **Uptime Goal**: 99.9%
*   **API Latency**: < 150ms
*   **Security**: SSL/TLS enabled, Helmet.js active, Rate-limiting configured.

---

> [!TIP]
> For India-wide impact, consider deploying the ML models to **Google Cloud (Mumbai Region)** for lower latency in South Asia.
