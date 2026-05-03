# 🚀 Vineetra Elite: Deployment & Production Guide

This guide ensures **Vineetra — India's AI Clinical Copilot** is production-ready and globally accessible.

---

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to `https://github.com/ViivianREINE/Vineetra-Bharat`
2. **API Keys**: Obtain Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

---

## 1. Backend Deployment (Render)

Render is ideal for the Node.js API and ML services.

### Steps:
1. **New Web Service**: Connect your GitHub repository `https://github.com/ViivianREINE/Vineetra-Bharat`
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   * `GEMINI_API_KEY`: Your Google Gemini API key
   * `NODE_ENV`: `production`
6. **Health Check Path**: `/health`

### Manual Deploy Hook (Optional):
- Get your deploy hook URL from Render dashboard
- Add it as `RENDER_DEPLOY_HOOK` secret in GitHub

---

## 2. Frontend Deployment (Vercel)

Vercel provides lightning-fast edge delivery for the React frontend.

### Steps:
1. **New Project**: Connect the same GitHub repository
2. **Framework Preset**: `Vite`
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   * `VITE_API_URL`: `https://your-backend-url.onrender.com/api`

### Vercel CLI Setup:
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 3. GitHub Actions (Automated Deploy)

The repository includes automated deployment via GitHub Actions.

### Required Secrets in GitHub:
1. **RENDER_DEPLOY_HOOK**: Your Render deploy webhook URL
2. **RENDER_SERVICE_ID**: Your Render service ID
3. **VERCEL_TOKEN**: Your Vercel authentication token

### Getting the Secrets:
- **Render Deploy Hook**: In Render dashboard → Service → Settings → Deploy Hook
- **Render Service ID**: In Render dashboard → Service → Settings (in URL)
- **Vercel Token**: `vercel auth token` or from Vercel dashboard → Account → Tokens

---

## 4. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/ViivianREINE/Vineetra-Bharat
cd vineetra-elite

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your API keys
npm install
npm start

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

---

## 5. Troubleshooting

### 403 GitHub Access Error:
- Ensure repository is public or Render has access
- Check if repository name/owner is correct
- Verify GitHub token permissions

### Port Issues:
- Render automatically assigns ports
- Backend uses `process.env.PORT` or defaults to 10000
- Frontend proxies to `/api` path

### API Key Issues:
- Ensure `GEMINI_API_KEY` is set in Render environment
- Check API key validity and quotas
- Backend falls back to local analysis if API fails

---

## 6. Production Benchmarks

* **Uptime Goal**: 99.9%
* **API Latency**: < 150ms
* **Security**: SSL/TLS enabled, Helmet.js active, Rate-limiting configured
* **Scalability**: Auto-scaling enabled on Render

---

> [!TIP]
> For India-wide impact, consider deploying the ML models to **Google Cloud (Mumbai Region)** for lower latency in South Asia.
