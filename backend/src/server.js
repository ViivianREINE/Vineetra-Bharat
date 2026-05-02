import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware — Allow all origins (covers Vercel frontend on any domain)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- ROUTES ---

// 1. Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'active', version: '2.0.0-elite', engine: 'gemini-1.5-flash' });
});

// 2. Clinical Reasoning & Triage (Gemini Flash - Free)
app.post('/api/analyze-clinical', async (req, res) => {
  const { transcript, language } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'No transcript provided.' });
  }

  const prompt = `
You are Vineetra, India's Elite AI Clinical Copilot. 
Analyze the following clinical conversation transcript (Language: ${language || 'hi-IN'}):

"${transcript}"

Provide a structured clinical analysis in strict JSON format with these exact keys:
{
  "Emergency Triage": {
    "ESI Level": <number 1-5>,
    "Risk Level": "<Stable|Moderate|High|Critical>"
  },
  "Symptom Extraction": ["<symptom1>", "<symptom2>"],
  "Red Flags": ["<red flag1>"],
  "Structured SOAP Note": {
    "Subjective": "<patient complaints in one paragraph>",
    "Objective": {
      "Vitals": "<vitals string or 'Not recorded'>",
      "Examination": "<clinical findings>"
    },
    "Assessment": ["<diagnosis 1 with probability>", "<diagnosis 2>"],
    "Plan": ["<action 1>", "<action 2>", "<action 3>"]
  },
  "Disease Prediction (Probabilistic)": ["<condition - XX% probability>"],
  "Recommended Next Steps (ER/OPD/Home)": ["<step 1>", "<step 2>"]
}

Return ONLY the raw JSON object. No markdown. No explanation. No code fences.
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      success: true,
      data: responseText,
      analysisId: uuidv4()
    });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ success: false, error: 'Clinical reasoning engine failed.' });
  }
});

// 3. Stream Analysis (SSE fallback for real-time)
app.get('/api/stream-analysis', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let counter = 0;
  const interval = setInterval(() => {
    counter++;
    sendEvent({
      type: 'TRANSCRIPT_UPDATE',
      content: `Processing ambient snippet ${counter}...`,
      stressScore: Math.floor(Math.random() * 60),
      emotion: counter > 3 ? 'Concerned' : 'Calm'
    });
    if (counter >= 10) {
      clearInterval(interval);
      res.end();
    }
  }, 3000);

  req.on('close', () => clearInterval(interval));
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  VINEETRA ELITE — India's AI Clinical Copilot║
  ║  Engine : Gemini 1.5 Flash (Free)            ║
  ║  Status : OPERATIONAL  |  Port: ${PORT}          ║
  ╚══════════════════════════════════════════════╝
  `);
});
