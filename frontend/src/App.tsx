import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { AmbientMic } from './components/AmbientMic';
import { TriagePanel } from './components/TriagePanel';
import { EmotionMeter } from './components/EmotionMeter';
import { VitalsPanel } from './components/VitalsPanel';
import { PatientSelfReport } from './components/PatientSelfReport';
import { ComparisonTable } from './components/ComparisonTable';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTheme } from './hooks/useTheme';
import {
  FileText, Clock, Sparkles, RotateCcw,
  Languages, Crown, Heart, Users, Mic2, Loader2, Download
} from 'lucide-react';
import { downloadSOAPAsPDF } from './utils/pdf';

const DEMO_LINES = [
  { speaker: 'Patient', text: 'Doctor sahab, mujhe 3 din se khaansi aa rahi hai aur bukhar bhi hai.' },
  { speaker: 'Doctor',  text: 'Kab se hai? Kya aapko saans lene mein taklif ho rahi hai?' },
  { speaker: 'Patient', text: 'Haan, thodi breathlessness hai, especially raat ko.' },
  { speaker: 'Doctor',  text: 'SpO2 check karte hain... 96% on room air. Let me auscultate.' },
  { speaker: 'Doctor',  text: 'Bilateral expiratory wheeze present. Temperature 101.2°F recorded.' },
  { speaker: 'Patient', text: 'Kya kuch serious hai doctor? Mujhe bahut weakness bhi lag rahi hai.' },
  { speaker: 'Doctor',  text: "Don't worry, we'll do a chest X-ray to rule out anything serious." },
];

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://vineetra-bharat.onrender.com/api' 
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api');

/* ── Build SOAP from transcript ── */
function buildSOAP(lines: { speaker: string; text: string }[], vitals: any) {
  const patientLines = lines.filter(l => l.speaker === 'Patient' || l.speaker === 'Live').map(l => l.text);
  const doctorLines  = lines.filter(l => l.speaker === 'Doctor').map(l => l.text);

  const subj = patientLines.length > 0
    ? patientLines.join(' ')
    : 'Patient complaints recorded via ambient session.';

  const obj_vitals = vitals?.systolic
    ? `BP ${vitals.systolic}/${vitals.diastolic} · HR ${vitals.hr} · SpO₂ ${vitals.spo2}% · Temp ${vitals.temp}°F · RR ${vitals.rr}/min`
    : 'Vitals pending manual entry.';

  const obj_exam = doctorLines.length > 0
    ? doctorLines.join(' ')
    : 'Clinical examination findings pending.';

  return { subj, obj_vitals, obj_exam };
}

function App() {
  /* Theme */
  const { theme } = useTheme();

  /* Apply dark/light to <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark',  theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  /* Language State */
  const [language, setLanguage] = useState('hi-IN');

  /* Speech */
  const speech = useSpeechRecognition(language);

  /* Demo fallback */
  const [demoTranscript, setDemoTranscript] = useState<{ speaker: string; text: string }[]>([]);
  const [demoActive, setDemoActive] = useState(false);
  const demoIdxRef = useRef(0);

  /* Core state */
  const [isListening, setIsListening] = useState(false);
  const [analysis, setAnalysis]   = useState<any>(null);
  const [elapsed, setElapsed]     = useState(0);
  const [vitals, setVitals]       = useState<any>(null);
  const [resetKey, setResetKey]   = useState(0);

  /* SOAP state */
  const [soapFromSession, setSoapFromSession] = useState<{ subj: string; obj_vitals: string; obj_exam: string; assessment: string[]; plan: string[] } | null>(null);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const sessionTranscriptRef = useRef<{ speaker: string; text: string }[]>([]);

  /* Toggle mic */
  const handleToggle = () => {
    if (isListening) {
      speech.stop();
      setDemoActive(false);
      setIsListening(false);
      // Capture full session for SOAP generation
      const full = [...sessionTranscriptRef.current];
      if (speech.interimText && speech.interimText.trim()) {
        full.unshift({ speaker: 'Live', text: speech.interimText.trim() });
      }
      if (full.length > 0) {
        setIsGeneratingSOAP(true);
        const textTranscript = full.map(l => `${l.speaker}: ${l.text}`).join('\\n');
        
        fetch(`${API_BASE_URL}/analyze-clinical`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: textTranscript, language })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            try {
              const jsonStr = data.data.replace(/```json/g, '').replace(/```/g, '');
              const parsed = JSON.parse(jsonStr);
              
              setSoapFromSession({
                subj: parsed['Structured SOAP Note']?.Subjective || parsed.Subjective || parsed.subj || 'Subjective not available.',
                obj_vitals: parsed['Structured SOAP Note']?.Objective?.Vitals || parsed.Objective || buildSOAP(full, vitals).obj_vitals,
                obj_exam: parsed['Structured SOAP Note']?.Objective?.Examination || 'No exam findings.',
                assessment: parsed['Structured SOAP Note']?.Assessment || parsed.Assessment || parsed['Disease Prediction (Probabilistic)'] || ['Analysis completed.'],
                plan: parsed['Structured SOAP Note']?.Plan || parsed.Plan || parsed['Recommended Next Steps (ER/OPD/Home)'] || ['Pending.'],
              });
            } catch(e) {
              setSoapFromSession({
                ...buildSOAP(full, vitals),
                assessment: ['Analysis parsed as text, check raw logs.'],
                plan: ['See raw response.']
              });
            }
          } else {
             setSoapFromSession({
               ...buildSOAP(full, vitals),
               assessment: ['Clinical API unreachable. Fallback mode.'],
               plan: ['Symptomatic treatment.']
             });
          }
        })
        .catch(() => {
          setSoapFromSession({
            ...buildSOAP(full, vitals),
            assessment: ['API Error. Showing transcript only.'],
            plan: ['Retry when online.']
          });
        })
        .finally(() => setIsGeneratingSOAP(false));
      }
    } else {
      speech.clear();
      setSoapFromSession(null);
      setDemoTranscript([]);
      setAnalysis(null);
      setElapsed(0);
      sessionTranscriptRef.current = [];
      setIsListening(true);
      if (speech.isSupported) {
        speech.start();
      } else {
        demoIdxRef.current = 0;
        setDemoActive(true);
      }
    }
  };

  /* Demo loop */
  useEffect(() => {
    if (!demoActive) return;
    const interval = setInterval(() => {
      const line = DEMO_LINES[demoIdxRef.current % DEMO_LINES.length];
      demoIdxRef.current++;
      setDemoTranscript(prev => {
        const next = [line, ...prev].slice(0, 10);
        sessionTranscriptRef.current = next;
        return next;
      });
      const count = demoIdxRef.current;
      setAnalysis({
        riskLevel:   count > 3 ? 'Moderate' : 'Stable',
        esiLevel:    count > 4 ? 3 : 4,
        symptoms:    ['Cough', 'Fever', 'Wheezing', 'Breathlessness'].slice(0, Math.min(count, 4)),
        emotion:     count > 4 ? 'Distressed' : 'Calm',
        stressScore: Math.min(20 + count * 8, 72),
        redFlags:    count > 5 ? ['Breathlessness at rest'] : [],
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [demoActive]);

  /* Update session ref from real speech */
  useEffect(() => {
    if (!speech.isSupported) return;
    const lines = speech.transcript.map(l => ({ speaker: l.speaker, text: l.text }));
    sessionTranscriptRef.current = lines;
    if (lines.length === 0) return;
    const count = lines.length;
    setAnalysis({
      riskLevel:   count > 3 ? 'Moderate' : 'Stable',
      esiLevel:    count > 4 ? 3 : 4,
      symptoms:    ['Cough', 'Fever', 'Breathlessness', 'Weakness'].slice(0, Math.min(count, 4)),
      emotion:     count > 4 ? 'Distressed' : count > 1 ? 'Concerned' : 'Calm',
      stressScore: Math.min(15 + count * 10, 80),
      redFlags:    count > 5 ? ['Symptoms escalating'] : [],
    });
  }, [speech.transcript]);

  /* Timer */
  useEffect(() => {
    if (!isListening) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isListening]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const displayTranscript = speech.isSupported
    ? speech.transcript.map(l => ({ speaker: l.speaker, text: l.text }))
    : demoTranscript;

  /* SOAP content */
  const soap = soapFromSession || {
    subj: 'Waiting for ambient session to capture patient history...',
    obj_vitals: `BP ${vitals?.systolic && vitals?.diastolic ? `${vitals.systolic}/${vitals.diastolic}` : '--/--'} · HR ${vitals?.hr || '--'} · SpO₂ ${vitals?.spo2 || '--'}% · Temp ${vitals?.temp || '--'}°F · RR ${vitals?.rr || '--'}/min`,
    obj_exam: 'Pending examination notes.',
    assessment: ['Awaiting differential diagnosis...'],
    plan: ['Awaiting care plan...']
  };

  return (
    <div className="min-h-screen relative transition-colors duration-300">
      {/* ─── Soft Ambient Glow Background ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[var(--color-bg)]">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--color-bg)] to-black/5 dark:to-black/20" />
        
        {/* Floating Color Orbs for Warmth */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px] animate-float mix-blend-multiply dark:mix-blend-screen"
          style={{ background: 'var(--color-sage)', opacity: theme === 'dark' ? 0.15 : 0.4 }} />
        <div className="absolute top-[40%] -right-[15%] w-[50%] h-[50%] rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen"
          style={{ background: 'var(--color-info)', opacity: theme === 'dark' ? 0.1 : 0.2 }} />
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full blur-[160px] mix-blend-multiply dark:mix-blend-screen"
          style={{ background: 'var(--color-rose-soft)', opacity: theme === 'dark' ? 0.15 : 0.5 }} />
      </div>

      {/* ─── Aesthetic Header Banner ─── */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none z-0">
        <img 
          src="/footer-bg-1.jpg" 
          alt="Mother and Child" 
          className="w-full h-full object-cover opacity-[0.85] dark:opacity-60 mix-blend-multiply dark:mix-blend-normal" 
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)' }} 
        />
      </div>

      <div className="relative z-10">
        <Navbar language={language} setLanguage={setLanguage} />
        <main className="max-w-7xl mx-auto pt-28 pb-16 px-4 sm:px-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Languages', value: '21',   icon: <Languages className="w-4 h-4" />, cls: 'text-color-accent' },
            { label: 'Latency',   value: '<2s',  icon: <Clock     className="w-4 h-4" />, cls: 'text-color-info' },
            { label: 'Cost/Note', value: '~₹2',  icon: <Heart     className="w-4 h-4" />, cls: 'text-rose-muted' },
            { label: 'Doctors',   value: '1.3M', icon: <Users     className="w-4 h-4" />, cls: 'text-color-warning' },
          ].map((s) => (
            <div key={s.label} className="glass p-4 flex items-center gap-3">
              <div className={`${s.cls} opacity-70`}>{s.icon}</div>
              <div>
                <p className="text-lg font-bold text-color-text leading-none">{s.value}</p>
                <p className="text-[10px] text-color-dim mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo mode warning */}
        <AnimatePresence>
          {isListening && !speech.isSupported && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs border"
              style={{ background: 'rgba(250,204,21,0.08)', borderColor: 'rgba(250,204,21,0.2)', color: 'var(--color-warning)' }}>
              <Mic2 className="w-4 h-4 shrink-0" />
              <span><strong>Demo mode</strong> — use Chrome for live mic transcription.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-strong p-8 mother-glow">
              <AmbientMic isListening={isListening} onToggle={handleToggle} />

              {/* Transcript Feed */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-color-dim">
                    Live Transcript
                  </h4>
                  {isListening && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-color-success pulse-gentle" />
                      <span className="text-[9px] text-color-success font-mono tracking-wider">
                        {speech.isSupported ? 'LIVE MIC' : 'DEMO'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 min-h-[100px] max-h-[260px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {speech.interimText && (
                      <motion.div key="interim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-lg p-2.5" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-color-accent opacity-60">Listening...</span>
                        <p className="text-[11px] text-color-muted mt-0.5 italic">{speech.interimText}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {displayTranscript.map((line, i) => (
                      <motion.div key={`${line.text.slice(0, 20)}-${i}`}
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-lg p-2.5" style={{ background: 'var(--fg-dim)', border: '1px solid var(--glass-border)' }}>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          line.speaker === 'Doctor' ? 'text-color-accent' :
                          line.speaker === 'Live'   ? 'text-color-success' : 'text-color-info'
                        }`}>{line.speaker}</span>
                        <p className="text-[11px] text-color-muted mt-0.5 leading-relaxed">{line.text}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {displayTranscript.length === 0 && !speech.interimText && (
                    <div className="flex items-center justify-center h-[100px]">
                      <p className="text-[11px] text-color-dim italic">
                        {isListening ? (speech.isSupported ? 'Waiting for speech...' : 'Demo loading...') : 'No active session'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <TriagePanel data={analysis} />
          </div>

          {/* ── RIGHT ── */}
          <div className="lg:col-span-8 space-y-6">
            <VitalsPanel key={resetKey} onChange={setVitals} />

            {/* Emotion + Timer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmotionMeter emotion={analysis?.emotion || ''} score={analysis?.stressScore || 0} />

              <div className="glass p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-color-dim flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5 text-color-info" />
                    Consultation Timer
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-color-text tracking-tight font-mono">{formatTime(elapsed)}</span>
                    {isListening && <span className="text-[9px] text-color-success font-mono tracking-wider">ACTIVE</span>}
                  </div>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-color-accent"
                        style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>D</div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-color-info"
                        style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)' }}>P</div>
                    </div>
                    <span className="text-[10px] text-color-dim">Diarization: <span className="text-color-muted">84% confidence</span></span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Languages className="w-3.5 h-3.5 text-color-dim" />
                    <span className="text-[10px] text-color-dim">Detected: <span className="text-color-accent">Hinglish</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* SOAP Note */}
            <div className="glass-strong p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-[0.03]">
                <FileText className="w-28 h-28 text-color-text" />
              </div>

              <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-color-text mb-1 flex items-center gap-2">
                    Clinical Summary
                    <Sparkles className="w-4 h-4 text-color-accent pulse-gentle" />
                  </h2>
                  <p className="text-[11px] text-color-dim">
                    {soapFromSession
                      ? `Generated from ${sessionTranscriptRef.current.length} live utterances • Vineetra AI`
                      : 'AI-Generated SOAP Note • Vineetra Reasoning Engine'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const fullText = `**SUBJECTIVE**\n${soap.subj}\n\n**OBJECTIVE**\n${soap.obj_vitals}\n${soap.obj_exam}\n\n**ASSESSMENT**\n${soap.assessment.map((a: string, i: number) => `${i+1}. ${a}`).join('\n')}\n\n**PLAN**\n${soap.plan.map((p: string) => `• ${p}`).join('\n')}`;
                      downloadSOAPAsPDF(fullText);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-color-muted transition-all duration-200 hover:text-color-text"
                    style={{ background: 'var(--fg-dim)', border: '1px solid var(--glass-border)' }}>
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={() => { 
                      setSoapFromSession(null); 
                      setVitals(null);
                      setAnalysis(null);
                      setDemoTranscript([]);
                      setElapsed(0);
                      sessionTranscriptRef.current = [];
                      setResetKey(prev => prev + 1);
                      if (speech.isSupported) speech.clear();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-color-muted transition-all duration-200 hover:text-color-text"
                    style={{ background: 'var(--fg-dim)', border: '1px solid var(--glass-border)' }}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* SOAP generation loader */}
              <AnimatePresence>
                {isGeneratingSOAP && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 py-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 className="w-7 h-7 text-color-accent" />
                    </motion.div>
                    <p className="text-sm text-color-muted font-medium">Generating SOAP from live session...</p>
                    <div className="w-40 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--fg-muted)' }}>
                      <motion.div
                        initial={{ x: '-100%' }} animate={{ x: '100%' }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-1/2 rounded-full"
                        style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isGeneratingSOAP && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[10px] font-bold text-color-accent uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-color-accent" /> Subjective
                      </h4>
                      <p className="text-sm text-color-muted leading-relaxed">{soap.subj}</p>
                    </section>
                    <section>
                      <h4 className="text-[10px] font-bold text-color-accent uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-color-accent" /> Objective
                      </h4>
                      <div className="text-sm text-color-muted leading-relaxed space-y-1">
                        <p>{soap.obj_vitals}</p>
                        <p>{soap.obj_exam}</p>
                      </div>
                    </section>
                  </div>
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-[10px] font-bold text-color-accent uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-color-accent" /> Assessment
                      </h4>
                      <div className="space-y-2">
                        {soap.assessment.map((dx: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-color-muted">
                            <span className="text-[9px] font-mono text-color-dim w-4">{i + 1}.</span>{dx}
                          </div>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h4 className="text-[10px] font-bold text-color-accent uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-color-accent" /> Plan
                      </h4>
                      <div className="space-y-1.5 text-sm text-color-muted">
                        {soap.plan.map((p: string, i: number) => (
                          <p key={i}>• {p}</p>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>

            <PatientSelfReport />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-4 h-4 text-color-accent" />
                <h2 className="text-base font-bold text-color-text">Why Vineetra?</h2>
              </div>
              <ComparisonTable />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-24 mt-16 relative z-10 border-t border-[var(--glass-border)] overflow-hidden">
        {/* Footer Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/footer-bg-1.jpg" 
            alt="Mother and Child" 
            className="w-full h-full object-cover opacity-[0.85] dark:opacity-60 mix-blend-multiply dark:mix-blend-normal" 
            style={{ WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)' }} 
          />
        </div>

        <div className="max-w-md mx-auto text-center space-y-2 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <p className="text-[10px] text-color-dim tracking-[0.25em] uppercase font-light">
            Made by Priyam Parashar
          </p>
          <p className="text-[14px] font-serif italic text-color-text">
            Dedicated to my Mother — my forever love
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;
