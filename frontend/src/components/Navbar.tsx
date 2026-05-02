import { Moon, Sun, Globe, ShieldCheck, Heart, ChevronDown } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useState, useRef, useEffect } from 'react';

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

export const Navbar = ({ language, setLanguage }: { language: string, setLanguage: (lang: string) => void }) => {
  const { theme, toggle } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
      <div className="glass flex items-center justify-between px-5 py-3 rounded-2xl">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-color-accent flex items-center justify-center shadow-sm">
            <Heart className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-color-text tracking-tight">Vineetra</span>
              <span className="text-[9px] font-bold tracking-[0.15em] bg-color-accent/10 text-color-accent border border-color-accent/20 px-2 py-0.5 rounded-full">
                ELITE
              </span>
            </div>
            <p className="text-[10px] text-color-dim">India's AI Clinical Copilot</p>
          </div>
        </div>

        {/* Right: badges + toggle */}
        <div className="flex items-center gap-2">
          {/* Custom Language Dropdown */}
          <div 
            className="relative hidden sm:flex items-center gap-1.5 text-[10px] text-color-dim bg-fg-dim px-3 py-1.5 rounded-full border border-fg-muted cursor-pointer hover:bg-fg-muted transition-colors z-50"
            onClick={() => setIsLangOpen(!isLangOpen)}
            ref={langRef}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="min-w-[70px]">{LANGUAGES.find(l => l.code === language)?.label || 'Language'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
            
            {/* Animated Dropdown Menu */}
            <div className={`absolute top-full mt-2 right-0 w-44 glass rounded-xl border border-[var(--glass-border)] py-1.5 shadow-card transition-all duration-300 origin-top overflow-y-auto max-h-64 scrollbar-hide ${isLangOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
              {LANGUAGES.map(lang => (
                <div 
                  key={lang.code}
                  className={`px-4 py-2 text-[11px] hover:bg-color-accent/10 hover:text-color-accent transition-colors ${language === lang.code ? 'text-color-accent bg-color-accent/5 font-bold' : 'text-color-text'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                >
                  {lang.label}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-color-accent bg-color-accent/[0.08] px-3 py-1.5 rounded-full border border-color-accent/15">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure · HIPAA Ready
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 w-9 h-9 rounded-xl border border-fg-muted bg-fg-dim hover:bg-fg-muted flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {theme === 'dark'
              ? <Sun  className="w-4 h-4 text-color-warning" />
              : <Moon className="w-4 h-4 text-color-info" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
