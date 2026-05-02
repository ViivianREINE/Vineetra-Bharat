import { Mic, MicOff, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AmbientMic = ({ isListening, onToggle }: { isListening: boolean; onToggle: () => void }) => {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Mic Button with soft glow rings */}
      <div className="relative">
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 0.12 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-accent rounded-full"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute inset-0 bg-accent-light rounded-full"
              />
            </>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
            isListening
              ? 'bg-gradient-to-br from-accent to-accent-dark text-white shadow-lg shadow-accent/30 scale-105'
              : 'bg-white/[0.05] text-text-muted hover:bg-white/[0.08] hover:text-white border border-white/[0.08] hover:border-accent/30'
          }`}
        >
          {isListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
        </button>

        {/* Live indicator dot */}
        {isListening && (
          <div className="absolute -top-1 -right-1 z-20">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-critical border-2 border-bg"></span>
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-white mb-0.5 flex items-center justify-center gap-2">
          {isListening ? (
            <>
              <Radio className="w-3.5 h-3.5 text-critical pulse-gentle" />
              <span>Ambient Listening</span>
            </>
          ) : (
            'Start Recording'
          )}
        </h3>
        <p className="text-[11px] text-text-dim max-w-[200px]">
          {isListening
            ? 'Capturing clinical conversation...'
            : 'Tap to begin secure ambient capture'}
        </p>
      </div>

      {/* Waveform visualization */}
      {isListening && (
        <div className="flex gap-[3px] h-6 items-end">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [4, 12 + Math.random() * 14, 6, 18 + Math.random() * 8, 4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.07,
                ease: 'easeInOut',
              }}
              className="w-[3px] bg-gradient-to-t from-accent/40 to-accent rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};
