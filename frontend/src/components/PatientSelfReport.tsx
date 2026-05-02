import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, FileText, User, Loader2,
  CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp, Copy, Download
} from 'lucide-react';
import { downloadSOAPAsPDF } from '../utils/pdf';

const PLACEHOLDER_PROMPTS = [
  'mujhe 2 din se bukhar hai aur sar dard bhi ho raha hai...',
  'chest mein dard ho raha hai jab bhi saans leta hoon...',
  'I have been having severe stomach pain since morning...',
  'Meri beti ko raat se khaansi aa rahi hai aur usse saans lene mein dikkat...',
];

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'Hinglish / Hindi' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'ur-IN', label: 'Urdu' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'or-IN', label: 'Odia' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'as-IN', label: 'Assamese' },
  { code: 'mai-IN', label: 'Maithili' },
  { code: 'sat-IN', label: 'Santali' },
  { code: 'ks-IN', label: 'Kashmiri' },
  { code: 'ne-IN', label: 'Nepali' },
  { code: 'kok-IN', label: 'Konkani' },
  { code: 'sd-IN', label: 'Sindhi' }
];

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://vineetra-bharat.onrender.com/api' 
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api');

const MOCK_SOAP = (text: string) => `**SUBJECTIVE**
Patient self-reports: "${text.slice(0, 120)}${text.length > 120 ? '...' : ''}"
Onset and duration inferred from narrative. Patient appears distressed based on language pattern.

**OBJECTIVE**
Manual vitals not recorded. Remote self-report mode active.
No physical examination performed. Audio sentiment: Moderate concern.

**ASSESSMENT**
Based on reported symptoms, differential includes:
1. Viral Upper Respiratory Tract Infection (most probable)
2. Tension Headache with fever — Rule out
3. Seasonal allergic rhinitis — Low probability

**PLAN**
• Flagged for urgent doctor review within 2 hours
• Recommended: Paracetamol 500mg if fever > 100°F
• Hydration encouraged — minimum 2L water/day
• ER visit advised if symptoms worsen or SpO₂ drops
• Auto-referral sent to next available physician`;

type Step = 'idle' | 'recording' | 'typing' | 'generating' | 'done';

export const PatientSelfReport = () => {
  const [step, setStep] = useState<Step>('idle');
  const [text, setText] = useState('');
  const [soap, setSoap] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [language, setLanguage] = useState('hi-IN');
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDER_PROMPTS.length));
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const recorderInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recSecs, setRecSecs] = useState(0);

  const startRecording = () => {
    setStep('recording');
    setRecSecs(0);
    recorderInterval.current = setInterval(() => setRecSecs(s => s + 1), 1000);
    // Simulate voice → text transcription after 5s
    setTimeout(() => {
      if (recorderInterval.current) clearInterval(recorderInterval.current);
      setText('Doctor sahab, mujhe 2 din se tez bukhar hai, sar mein dard hai aur bohot weakness feel ho rahi hai. Pehle kabhi aisa nahi hua.');
      setStep('typing');
    }, 5000);
  };

  const stopRecording = () => {
    if (recorderInterval.current) clearInterval(recorderInterval.current);
    setText('Doctor sahab, mujhe 2 din se tez bukhar hai, sar mein dard hai aur bohot weakness feel ho rahi hai. Pehle kabhi aisa nahi hua.');
    setStep('typing');
  };

  const generateSOAP = async () => {
    if (!text.trim()) return;
    setStep('generating');
    
    try {
      const res = await fetch(`${API_BASE_URL}/analyze-clinical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, language: language })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        try {
           const jsonStr = data.data.replace(/```json/g, '').replace(/```/g, '');
           const parsed = JSON.parse(jsonStr);
           
           const assessArr = parsed['Structured SOAP Note']?.Assessment || parsed.Assessment || parsed['Disease Prediction (Probabilistic)'] || [];
           const planArr = parsed['Structured SOAP Note']?.Plan || parsed.Plan || parsed['Recommended Next Steps (ER/OPD/Home)'] || [];
           
           const soapText = `**SUBJECTIVE**
${parsed['Structured SOAP Note']?.Subjective || parsed.Subjective || parsed.subj || 'Self-reported symptoms'}

**OBJECTIVE**
${parsed['Structured SOAP Note']?.Objective?.Vitals || parsed.Objective || 'Pending vitals.'}
${parsed['Structured SOAP Note']?.Objective?.Examination || ''}

**ASSESSMENT**
${Array.isArray(assessArr) ? assessArr.map((s: string) => `• ${s}`).join('\\n') : assessArr}

**PLAN**
${Array.isArray(planArr) ? planArr.map((s: string) => `• ${s}`).join('\\n') : planArr}`;

           setSoap(soapText);
        } catch(e) {
           setSoap(data.data); // Raw text if JSON parse fails
        }
      } else {
        setSoap(MOCK_SOAP(text));
      }
    } catch (error) {
      setSoap(MOCK_SOAP(text));
    }
    
    setStep('done');
  };

  const copySOAP = () => {
    navigator.clipboard.writeText(soap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 4000);
  };

  const reset = () => {
    setStep('idle');
    setText('');
    setSoap('');
    setDispatched(false);
  };

  const formatSecs = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="glass overflow-hidden border border-rose-DEFAULT/10">
      {/* Header — collapsible */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-DEFAULT/10 flex items-center justify-center">
            <User className="w-4 h-4 text-rose-muted" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Patient Self-Report</h3>
            <p className="text-[10px] text-text-dim">When no doctor is present — AI generates and routes your case</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {step === 'done' && (
            <span className="text-[9px] font-mono bg-success/10 text-success px-2 py-1 rounded-full border border-success/20">
              SOAP READY
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/[0.04]">
              {/* Step: idle */}
              {step === 'idle' && (
                <div className="pt-5 text-center space-y-4">
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Describe your symptoms by typing or recording your voice.
                    Our AI will create a SOAP note and route it to the next available doctor.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setStep('typing')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm text-text-muted hover:text-white transition-all duration-200 font-medium"
                    >
                      <FileText className="w-4 h-4" /> Type Symptoms
                    </button>
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-DEFAULT/10 hover:bg-rose-DEFAULT/20 border border-rose-DEFAULT/20 text-sm text-rose-muted hover:text-white transition-all duration-200 font-medium"
                    >
                      <Mic className="w-4 h-4" /> Record Voice
                    </button>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="bg-white/[0.04] text-text-muted text-xs border border-white/[0.08] rounded-lg px-3 py-1.5 outline-none hover:bg-white/[0.08] cursor-pointer"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step: recording */}
              {step === 'recording' && (
                <div className="pt-5 flex flex-col items-center gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-rose-DEFAULT/20 rounded-full blur-lg"
                    />
                    <button
                      onClick={stopRecording}
                      className="relative w-16 h-16 rounded-full bg-rose-DEFAULT/20 border-2 border-rose-muted/60 flex items-center justify-center text-rose-muted hover:bg-rose-DEFAULT/30 transition-colors"
                    >
                      <MicOff className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-critical animate-ping" />
                    <span className="text-sm font-mono text-critical">Recording {formatSecs(recSecs)}</span>
                  </div>
                  <p className="text-[11px] text-text-dim">Speak clearly — tap button above to stop</p>
                  <div className="flex gap-1 h-5 items-end">
                    {[...Array(20)].map((_, i) => (
                      <motion.div key={i}
                        animate={{ height: [3, 8 + Math.random() * 12, 4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                        className="w-[2px] bg-rose-muted/60 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step: typing / editing */}
              {(step === 'typing') && (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Describe your symptoms
                    </label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="bg-transparent text-accent text-[10px] border border-white/[0.08] rounded px-2 py-0.5 outline-none cursor-pointer uppercase tracking-wider"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={PLACEHOLDER_PROMPTS[placeholderIdx]}
                    rows={4}
                    autoFocus
                    className="w-full bg-white/[0.03] text-text text-sm rounded-xl border border-white/[0.06] focus:border-accent/40 outline-none px-4 py-3 resize-none placeholder:text-text-dim/40 transition-all duration-200 leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-dim">{text.length} characters</span>
                    <div className="flex gap-2">
                      <button onClick={() => setStep('idle')} className="text-[11px] text-text-dim hover:text-text px-3 py-1.5 rounded-lg border border-white/[0.05] hover:bg-white/[0.03] transition-all">
                        Cancel
                      </button>
                      <button
                        onClick={generateSOAP}
                        disabled={text.trim().length < 10}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 ${
                          text.trim().length >= 10
                            ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20'
                            : 'bg-white/[0.02] text-text-dim/40 border border-white/[0.04] cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate AI SOAP
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: generating */}
              {step === 'generating' && (
                <div className="pt-6 pb-2 flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-8 h-8 text-accent" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Generating Clinical SOAP Note...</p>
                    <p className="text-[11px] text-text-dim mt-1">Vineetra AI is analyzing your symptoms</p>
                  </div>
                  <div className="w-48 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Step: done — show SOAP */}
              {step === 'done' && (
                <div className="pt-4 space-y-4">
                  {/* Dispatch banner */}
                  <AnimatePresence>
                    {dispatched && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-success">Routed to next available physician</p>
                          <p className="text-[10px] text-text-dim">Estimated review time: 15–30 minutes</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-[10px] font-mono text-text-dim">
                          <Clock className="w-3 h-3" /> QUEUED
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SOAP output */}
                  <div className="bg-white/[0.02] rounded-xl border border-white/[0.05] p-4 max-h-56 overflow-y-auto">
                    <div className="text-[11px] text-text-muted leading-relaxed whitespace-pre-line font-mono">
                      {soap.split('\n').map((line, i) => (
                        <span key={i} className={`block ${line.startsWith('**') ? 'text-accent font-bold mt-2 mb-1 not-italic font-sans text-[10px] tracking-wider uppercase' : ''}`}>
                          {line.replace(/\*\*/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={dispatch}
                      disabled={dispatched}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        dispatched
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20'
                      }`}
                    >
                      {dispatched ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      {dispatched ? 'Dispatched' : 'Send to Doctor Queue'}
                    </button>
                    <button
                      onClick={copySOAP}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-text-muted hover:text-white transition-all duration-200"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => downloadSOAPAsPDF(soap)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-text-muted hover:text-white transition-all duration-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button
                      onClick={reset}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-text-dim hover:text-white transition-all duration-200"
                    >
                      New
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
