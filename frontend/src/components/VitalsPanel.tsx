import { useState } from 'react';
import { Activity, Thermometer, Heart, Wind, Gauge, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Vitals {
  systolic: string;
  diastolic: string;
  hr: string;
  spo2: string;
  temp: string;
  rr: string;
}

const DEFAULT: Vitals = { systolic: '', diastolic: '', hr: '', spo2: '', temp: '', rr: '' };

const getFlagColor = (key: string, val: string): 'normal' | 'warn' | 'critical' => {
  const n = parseFloat(val);
  if (isNaN(n)) return 'normal';
  switch (key) {
    case 'systolic':   return n > 180 || n < 80 ? 'critical' : n > 140 || n < 90 ? 'warn' : 'normal';
    case 'diastolic':  return n > 120 || n < 50 ? 'critical' : n > 90  ? 'warn' : 'normal';
    case 'hr':         return n > 130 || n < 40  ? 'critical' : n > 100 || n < 55 ? 'warn' : 'normal';
    case 'spo2':       return n < 90  ? 'critical' : n < 94  ? 'warn' : 'normal';
    case 'temp':       return n > 104 || n < 95   ? 'critical' : n > 100.4 ? 'warn' : 'normal';
    case 'rr':         return n > 30  || n < 8    ? 'critical' : n > 20 || n < 12  ? 'warn' : 'normal';
    default:           return 'normal';
  }
};

const flagRing: Record<string, string> = {
  normal:   'border-white/[0.06] focus:border-accent/60',
  warn:     'border-warning/40 focus:border-warning/80',
  critical: 'border-critical/50 focus:border-critical/80',
};

const flagDot: Record<string, string> = {
  normal:   'bg-success',
  warn:     'bg-warning',
  critical: 'bg-critical',
};

interface VitalsField {
  key: keyof Vitals;
  label: string;
  unit: string;
  placeholder: string;
  icon: React.ReactNode;
  span?: boolean;
}

export const VitalsPanel = ({ onChange }: { onChange?: (v: Vitals) => void }) => {
  const [vitals, setVitals] = useState<Vitals>(DEFAULT);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof Vitals, value: string) => {
    const next = { ...vitals, [key]: value };
    setVitals(next);
    setSaved(false);
    onChange?.(next);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fields: VitalsField[] = [
    { key: 'hr',        label: 'Heart Rate',    unit: 'bpm',  placeholder: '72',    icon: <Heart       className="w-3.5 h-3.5" /> },
    { key: 'spo2',      label: 'SpO₂',          unit: '%',    placeholder: '98',    icon: <Activity    className="w-3.5 h-3.5" /> },
    { key: 'temp',      label: 'Temperature',   unit: '°F',   placeholder: '98.6',  icon: <Thermometer className="w-3.5 h-3.5" /> },
    { key: 'rr',        label: 'Resp. Rate',    unit: '/min', placeholder: '16',    icon: <Wind        className="w-3.5 h-3.5" /> },
  ];

  const bpFlag = [getFlagColor('systolic', vitals.systolic), getFlagColor('diastolic', vitals.diastolic)]
    .sort((a, b) => ['critical','warn','normal'].indexOf(a) - ['critical','warn','normal'].indexOf(b))[0];

  const allFilled = Object.values(vitals).every(v => v.trim() !== '');

  return (
    <div className="glass p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-dim flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-accent" />
          Patient Vitals
        </h3>
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 text-[10px] text-success font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </motion.div>
          ) : (
            <motion.div key="tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[9px] font-mono text-text-dim bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]">
              MANUAL ENTRY
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Blood Pressure — double input */}
      <div className="mb-3">
        <label className="flex items-center gap-1.5 text-[10px] text-text-dim mb-1.5 font-medium">
          <Heart className="w-3 h-3 text-rose-muted" />
          Blood Pressure
          <span className="text-[9px] text-text-dim/60 font-mono ml-1">mmHg</span>
          {(vitals.systolic || vitals.diastolic) && (
            <span className={`ml-auto w-1.5 h-1.5 rounded-full ${flagDot[bpFlag]} pulse-gentle`} />
          )}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={vitals.systolic}
            onChange={e => set('systolic', e.target.value)}
            placeholder="120"
            className={`w-full bg-white/[0.03] text-white text-sm font-mono px-3 py-2.5 rounded-xl border outline-none transition-all duration-200 placeholder:text-text-dim/40 ${flagRing[getFlagColor('systolic', vitals.systolic)]}`}
          />
          <span className="text-text-dim text-sm font-light shrink-0">/</span>
          <input
            type="number"
            value={vitals.diastolic}
            onChange={e => set('diastolic', e.target.value)}
            placeholder="80"
            className={`w-full bg-white/[0.03] text-white text-sm font-mono px-3 py-2.5 rounded-xl border outline-none transition-all duration-200 placeholder:text-text-dim/40 ${flagRing[getFlagColor('diastolic', vitals.diastolic)]}`}
          />
        </div>
      </div>

      {/* Other vitals grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {fields.map(({ key, label, unit, placeholder, icon }) => {
          const flag = getFlagColor(key, vitals[key]);
          return (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-[10px] text-text-dim mb-1.5 font-medium">
                <span className="text-text-dim/60">{icon}</span>
                {label}
                <span className="text-[9px] text-text-dim/50 font-mono ml-1">{unit}</span>
                {vitals[key] && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${flagDot[flag]} pulse-gentle`} />
                )}
              </label>
              <input
                type="number"
                value={vitals[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white/[0.03] text-white text-sm font-mono px-3 py-2.5 rounded-xl border outline-none transition-all duration-200 placeholder:text-text-dim/40 ${flagRing[flag]}`}
              />
            </div>
          );
        })}
      </div>

      {/* Flag Legend */}
      {Object.values(vitals).some(v => v !== '') && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] mb-4"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-text-dim mt-0.5 shrink-0" />
          <div className="space-y-1">
            {vitals.spo2 && parseFloat(vitals.spo2) < 94 && (
              <p className="text-[10px] text-critical font-medium">
                SpO₂ {vitals.spo2}% — {parseFloat(vitals.spo2) < 90 ? '⚠ Critical: Consider supplemental O₂ immediately' : 'Below normal range'}
              </p>
            )}
            {vitals.temp && parseFloat(vitals.temp) > 100.4 && (
              <p className="text-[10px] text-warning font-medium">
                Temp {vitals.temp}°F — {parseFloat(vitals.temp) > 104 ? '⚠ Critical hyperpyrexia' : 'Febrile'}
              </p>
            )}
            {vitals.systolic && (parseFloat(vitals.systolic) > 140 || parseFloat(vitals.systolic) < 90) && (
              <p className="text-[10px] text-warning font-medium">
                BP {vitals.systolic}/{vitals.diastolic} — {parseFloat(vitals.systolic) > 180 ? '⚠ Hypertensive crisis' : parseFloat(vitals.systolic) < 90 ? '⚠ Hypotensive' : 'Elevated'}
              </p>
            )}
            {vitals.hr && (parseFloat(vitals.hr) > 100 || parseFloat(vitals.hr) < 55) && (
              <p className="text-[10px] text-warning font-medium">
                HR {vitals.hr} bpm — {parseFloat(vitals.hr) > 130 ? '⚠ Tachycardia' : parseFloat(vitals.hr) < 40 ? '⚠ Bradycardia' : 'Borderline'}
              </p>
            )}
            {!Object.values(vitals).some(() => {
              return false; // show a neutral message when all normal
            }) && (
              <p className="text-[10px] text-text-dim">All entered vitals within review threshold</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!allFilled}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          allFilled
            ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/40 hover:scale-[1.01]'
            : 'bg-white/[0.02] text-text-dim/40 border border-white/[0.04] cursor-not-allowed'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {allFilled ? 'Confirm & Attach to SOAP Note' : 'Fill all vitals to confirm'}
      </button>
    </div>
  );
};
