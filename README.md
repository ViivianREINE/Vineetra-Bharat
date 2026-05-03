# Vineetra — India’s AI Clinical Copilot (v2.0 Elite)

![Status: Elite](https://img.shields.io/badge/Status-Elite-blueviolet?style=for-the-badge)
![Impact: India Wide](https://img.shields.io/badge/Impact-India_Wide-orange?style=for-the-badge)
![Tech: Claude Sonnet 3](https://img.shields.io/badge/Tech-Claude_Sonnet_3-green?style=for-the-badge)

> **"A doctor’s hands save lives; Vineetra ensures those hands never tire."**

Vineetra is an elite-level, ambient clinical intelligence platform designed to revolutionize healthcare in India. Inspired by a mother's touch, it provides a warm, calming, and ultra-fast AI interface for emergency triage and clinical documentation.

---

## 🏆 The Hackathon Edge

Vineetra doesn't just match world-class systems like **Nuance DAX**; it exceeds them for the Indian context:

| Feature | Nuance DAX | Vineetra Elite |
| :--- | :--- | :--- |
| **Ambient Audio** | ✅ Yes | ✅ Yes (Continuous) |
| **21 Indian Languages** | ❌ No | ✅ Yes (Hinglish + Regional) |
| **Emergency Triage** | ❌ No | ✅ Yes (ESI/WHO Compliant) |
| **Emotion Analysis** | ❌ No | ✅ Yes (Sentiment + Risk) |
| **Cost** | 💰 High | 💎 Ultra-Low (~₹2/Consult) |

---

## 🚀 Key Capabilities

### 1. Ambient Clinical Intelligence
- **Continuous Listening**: Hands-free background recording.
- **Speaker Diarization**: Intelligently separates Doctor vs. Patient.
- **Noise Filtering**: Clinical-grade audio normalization.

### 2. Multi-Modal Triage (MMT)
- **Vocal Biomarkers**: Detects distress, panic, and clinical urgency.
- **ESI Scoring**: Automatically assigns Emergency Severity Index.
- **Red Flag Alerts**: Real-time identification of life-threatening symptoms.

### 3. Bharat-First NLP
- Supports 21 Indian languages.
- **Code-mixed (Hinglish) Awareness**: Understands how India speaks.
- **Local Context**: Aware of regional health trends and dialects.

---

## 🧠 Model Architecture

- **Reasoning**: Claude 3.5 Sonnet
- **Clinical Context**: BioClinicalBERT
- **Linguistic Core**: IndicBERT / MuRIL
- **Acoustics**: wav2vec2 (Acoustics-to-Emotion)

---

## 📁 Project Structure

```text
/vineetra-elite
├── frontend/        # React 18 + Vite + Tailwind + Framer Motion
├── backend/         # Node.js Express + SSE + AI Pipeline
├── ml-models/       # Inference engines and model weights
├── scripts/         # Training and preprocessing pipelines
├── deployment/      # Production deployment guides
└── configs/         # System and security configurations
```

---

## 🚀 Quick Deploy

Get Vineetra running in production in under 5 minutes:

### Prerequisites
- GitHub account
- [Render](https://render.com) account (Backend)
- [Vercel](https://vercel.com) account (Frontend)
- Google Gemini API key

### One-Click Deploy
```bash
# Clone and setup
git clone https://github.com/ViivianREINE/Vineetra-Bharat
cd vineetra-elite

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your GEMINI_API_KEY

# Deploy (Linux/Mac)
./deploy.sh

# Or deploy manually:
git add .
git commit -m "Deploy Vineetra Elite"
git push origin main
```

### Services
- **Frontend**: Vercel (Auto-deploys on git push)
- **Backend**: Render (Auto-deploys on git push)
- **Database**: MongoDB Atlas (Optional)

📖 **Full Deployment Guide**: [deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)

---
This system is more than code. It is a tribute to the warmth, safety, and care that only a mother can provide. Built for the 1.3 million doctors in India who serve as the backbone of our nation.

**Made with love by Priyam Parashar**

---

## 🛠️ Getting Started

```bash
# Start Backend
cd backend
npm install
npm run dev

# Start Frontend
cd frontend
npm install
npm run dev
```
