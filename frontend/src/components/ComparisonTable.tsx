import { Check, X, Crown } from 'lucide-react';

export const ComparisonTable = () => {
  const features = [
    { name: 'Ambient Clinical Recording', dax: true, vineetra: true },
    { name: 'Real-time SOAP Generation', dax: true, vineetra: true },
    { name: 'Speaker Diarization', dax: true, vineetra: true },
    { name: 'Context-aware Summarization', dax: true, vineetra: true },
    { name: '21 Indian Languages', dax: false, vineetra: true },
    { name: 'Hinglish / Code-mixed NLP', dax: false, vineetra: true },
    { name: 'Emergency Triage (ESI/WHO)', dax: false, vineetra: true },
    { name: 'Patient Emotion Detection', dax: false, vineetra: true },
    { name: 'Disease Risk Prediction', dax: false, vineetra: true },
    { name: 'Clinical Red Flag Alerts', dax: false, vineetra: true },
    { name: 'Cost per Consultation', daxLabel: '$25–50', vineetraLabel: '~₹2' },
    { name: 'Target Market', daxLabel: 'US/EU', vineetraLabel: 'India (1.3M Doctors)' },
  ];

  return (
    <div className="glass overflow-hidden">
      {/* Header */}
      <div className="bg-accent/[0.06] px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
        <Crown className="w-4 h-4 text-accent" />
        <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.12em]">
          Vineetra vs Nuance DAX
        </h3>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.04]">
            <th className="px-5 py-3 text-[10px] font-semibold text-text-dim uppercase tracking-wider">Feature</th>
            <th className="px-5 py-3 text-[10px] font-semibold text-text-dim uppercase tracking-wider text-center">Nuance DAX</th>
            <th className="px-5 py-3 text-[10px] font-semibold text-accent uppercase tracking-wider text-center">Vineetra</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200">
              <td className="px-5 py-3 text-xs text-text-muted font-medium">{f.name}</td>
              <td className="px-5 py-3 text-center">
                {'dax' in f && typeof f.dax === 'boolean' ? (
                  f.dax
                    ? <Check className="w-4 h-4 text-text-dim/50 mx-auto" />
                    : <X className="w-4 h-4 text-critical/40 mx-auto" />
                ) : (
                  <span className="text-[10px] text-text-dim font-mono">{f.daxLabel}</span>
                )}
              </td>
              <td className="px-5 py-3 text-center">
                {'vineetra' in f && typeof f.vineetra === 'boolean' ? (
                  f.vineetra
                    ? <Check className="w-4 h-4 text-accent mx-auto" />
                    : <X className="w-4 h-4 text-critical mx-auto" />
                ) : (
                  <span className="text-[10px] text-accent font-semibold font-mono">{f.vineetraLabel}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
