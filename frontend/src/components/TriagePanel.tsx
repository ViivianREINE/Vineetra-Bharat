import { AlertTriangle, Activity, Brain, ArrowRight } from 'lucide-react';

export const TriagePanel = ({ data, onViewFullReport }: { data: any; onViewFullReport?: () => void }) => {
  const getESIStyle = (level: number) => {
    if (level <= 2) return 'bg-critical/10 text-critical border-critical/20';
    if (level === 3) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const esiLevel = data?.esiLevel || 4;
  const riskLevel = data?.riskLevel || 'Stable';
  const symptoms = data?.symptoms || [];
  const redFlags = data?.redFlags || [];

  return (
    <div className="glass p-5 mother-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-dim flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-accent" />
          Emergency Triage
        </h3>
        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${getESIStyle(esiLevel)}`}>
          ESI {esiLevel}
        </span>
      </div>

      {/* Severity + Red Flags Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
          <p className="text-[9px] text-text-dim uppercase tracking-wider mb-1 font-semibold">Severity</p>
          <p className="text-lg font-bold text-white">{riskLevel}</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
          <p className="text-[9px] text-text-dim uppercase tracking-wider mb-1 font-semibold">Red Flags</p>
          <p className={`text-lg font-bold ${redFlags.length > 0 ? 'text-critical' : 'text-success'}`}>
            {redFlags.length}
          </p>
        </div>
      </div>

      {/* Symptoms */}
      {symptoms.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Symptoms</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s: string) => (
              <span key={s} className="text-[10px] bg-white/[0.04] text-text-muted px-2.5 py-1 rounded-lg border border-white/[0.06]">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Diagnosis Prediction */}
      <div className="bg-accent/[0.04] rounded-xl p-3 border border-accent/10">
        <div className="flex items-center gap-2 mb-1.5">
          <Brain className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">AI Prediction</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Lower Respiratory Infection — <span className="text-accent font-semibold">84.2% confidence</span>
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => onViewFullReport?.()}
        className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-medium text-accent bg-accent/[0.06] hover:bg-accent/[0.12] border border-accent/15 rounded-xl py-2.5 transition-all duration-200"
      >
        View Full Triage Report
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
