import { Smile, Frown, Meh, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmotionMeter = ({ emotion, score }: { emotion: string; score: number }) => {
  const getConfig = () => {
    switch (emotion?.toLowerCase()) {
      case 'calm':
        return { icon: <Smile className="w-5 h-5" />, color: 'text-success', barColor: 'bg-success', ringColor: 'shadow-success/20' };
      case 'distressed':
        return { icon: <Meh className="w-5 h-5" />, color: 'text-warning', barColor: 'bg-warning', ringColor: 'shadow-warning/20' };
      case 'panic':
      case 'critical':
        return { icon: <Frown className="w-5 h-5" />, color: 'text-critical', barColor: 'bg-critical', ringColor: 'shadow-critical/20' };
      default:
        return { icon: <Smile className="w-5 h-5" />, color: 'text-text-dim', barColor: 'bg-text-dim', ringColor: '' };
    }
  };

  const config = getConfig();

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-dim flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-info" />
          Patient Sentiment
        </h3>
        <div className={`w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center ${config.color} ${config.ringColor} shadow-lg`}>
          {config.icon}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-white tracking-tight">
            {emotion || 'Waiting...'}
          </span>
          <span className="text-xs font-mono text-text-dim">
            {score || 0}%
          </span>
        </div>
        <p className="text-[10px] text-text-dim mt-1">Vocal Stress Index</p>
      </div>

      {/* Progress bar — soft, not aggressive */}
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score || 0}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${config.barColor}`}
          style={{ opacity: 0.8 }}
        />
      </div>

      <p className="text-[9px] text-text-dim mt-3 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${config.barColor} pulse-gentle`} />
        Live vocal biomarker analysis active
      </p>
    </div>
  );
};
