import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

dotenv.config();

const app = express();
const DEFAULT_PORT = 10001;
const PORT = parseInt(process.env.PORT || '', 10) || DEFAULT_PORT;
const MAX_PORT_RETRIES = 10;

// Middleware — Allow all origins (covers Vercel frontend on any domain)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

const openAIKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '';
const isOpenAIKey = openAIKey.startsWith('sk-');

let model;
if (isOpenAIKey) {
  console.warn('OpenAI API key detected; using OpenAI Chat Completions instead of Google Gemini.');
} else {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is missing from environment variables!');
  }

  const genAI = new GoogleGenerativeAI(apiKey || '');
  // Use gemini-1.5-flash for better reliability/speed
  model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
    ]
  });
}

function buildFallbackAnalysis(transcript, language) {
  const text = transcript.toLowerCase();
  const symptoms = [];
  const redFlags = [];

  const symptomKeywords = ['fever', 'bukhar', 'cough', 'sleeppy', 'sleep', 'headache', 'weak', 'dizziness', 'dizzy', 'breathless', 'breathlessness', 'chest pain', 'pain', 'nausea', 'vomiting', 'diarrhea', 'rash', 'swelling'];
  symptomKeywords.forEach((keyword) => {
    if (text.includes(keyword) && !symptoms.includes(keyword)) symptoms.push(keyword);
  });

  if (text.includes('chest') || text.includes('breathless') || text.includes('dizziness') || text.includes('headache') || text.includes('severe')) {
    redFlags.push('Possible serious cardiorespiratory symptom');
  }

  if (symptoms.length === 0) symptoms.push('General discomfort');

  let assessment = [];
  if (symptoms.includes('fever') && symptoms.includes('cough')) {
    assessment.push('Suspected upper respiratory tract infection - 70% probability');
  } else if (symptoms.includes('headache') && symptoms.includes('dizziness')) {
    assessment.push('Possible migraine or vestibular disorder - 60% probability');
  } else if (symptoms.includes('chest pain')) {
    assessment.push('Cardiac evaluation recommended - rule out acute coronary syndrome');
  } else {
    assessment.push('Differential diagnosis pending further clinical evaluation');
  }

  let plan = [];
  if (redFlags.length > 0) {
    plan.push('Immediate medical attention recommended');
    plan.push('Vital signs monitoring');
    plan.push('Further diagnostic workup');
  } else {
    plan.push('Symptomatic treatment');
    plan.push('Follow-up in 24-48 hours if symptoms persist');
    plan.push('Hydration and rest');
  }

  return JSON.stringify({
    'Emergency Triage': {
      'ESI Level': redFlags.length > 0 ? 2 : 4,
      'Risk Level': redFlags.length > 0 ? 'Moderate' : 'Stable'
    },
    'Symptom Extraction': symptoms,
    'Red Flags': redFlags.length > 0 ? redFlags : ['No immediate red flags identified'],
    'Structured SOAP Note': {
      'Subjective': transcript,
      'Objective': {
        'Vitals': 'Vitals pending manual entry.',
        'Examination': 'Clinical examination findings pending.'
      },
      'Assessment': assessment,
      'Plan': plan
    },
    'Disease Prediction (Probabilistic)': assessment,
    'Recommended Next Steps (ER/OPD/Home)': redFlags.length > 0 ? ['Seek emergency care', 'Call ambulance if symptoms worsen'] : ['Home care with monitoring', 'Primary care follow-up']
  });
}

async function runClinicalPrompt(prompt, transcript, language) {
  if (isOpenAIKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const err = new Error(`OpenAI error ${response.status}: ${errorText}`);
      err.code = response.status;
      throw err;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// --- ROUTES ---

// 1. Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'active', 
    version: '2.0.1-elite', 
    engine: isOpenAIKey ? 'openai-chat' : 'gemini-1.5-flash',
    provider: isOpenAIKey ? 'openai' : 'google-gemini',
    apiKeyConfigured: !!openAIKey 
  });
});

// 2. Clinical Reasoning & Triage
app.post('/api/analyze-clinical', async (req, res) => {
  const { transcript, language } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'No transcript provided.' });
  }

  const prompt = `
You are Vineetra, India's Elite AI Clinical Copilot. 
Analyze the following clinical conversation transcript (Language: ${language || 'hi-IN'}):

"${transcript.replace(/"/g, "'")}"

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
    const responseText = await runClinicalPrompt(prompt, transcript, language);

    res.json({
      success: true,
      data: responseText,
      analysisId: uuidv4()
    });
  } catch (error) {
    console.error('Clinical reasoning engine error:', error);
    const fallback = buildFallbackAnalysis(transcript, language);
    return res.status(200).json({
      success: true,
      data: fallback,
      analysisId: uuidv4(),
      fallback: true,
      note: 'External clinical API failed; using local fallback analysis.'
    });
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

function onServerListening(port) {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  VINEETRA ELITE — India's AI Clinical Copilot║
  ║  Engine : ${isOpenAIKey ? 'OpenAI Chat' : 'Gemini 1.5 Flash'}${isOpenAIKey ? ' '.repeat(20) : ' '.repeat(9)}║
  ║  Status : OPERATIONAL  |  Port: ${port}          ║
  ╚══════════════════════════════════════════════╝
  `);
}

function onServerError(error, port, retryCount) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges. Please set a different PORT or run with proper permissions.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      if (retryCount >= MAX_PORT_RETRIES) {
        console.error(`${bind} is already in use and no free port was found after ${MAX_PORT_RETRIES} retries.`);
        process.exit(1);
      }
      const nextPort = port + 1;
      console.warn(`${bind} is already in use. Retrying on port ${nextPort}...`);
      startServer(nextPort, retryCount + 1);
      break;
    default:
      throw error;
  }
}

function startServer(port, retryCount = 0) {
  const server = app.listen(port, () => onServerListening(port));
  server.on('error', (error) => onServerError(error, port, retryCount));
}

startServer(PORT);
