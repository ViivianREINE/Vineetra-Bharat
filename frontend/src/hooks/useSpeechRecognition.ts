import { useState, useRef, useCallback, useEffect } from 'react';

export interface TranscriptLine {
  speaker: string;
  text: string;
  final: boolean;
  id: string;
}

interface UseSpeechReturn {
  transcript: TranscriptLine[];
  interimText: string;
  isSupported: boolean;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

export const useSpeechRecognition = (language = 'hi-IN'): UseSpeechReturn => {
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognition.onerror = (e: any) => {
      // Restart on non-fatal errors
      if (e.error === 'no-speech' || e.error === 'audio-capture') {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (result.isFinal && text.length > 0) {
          const line: TranscriptLine = {
            id: `${Date.now()}-${i}`,
            speaker: 'Live',
            text,
            final: true,
          };
          setTranscript(prev => [line, ...prev].slice(0, 12));
          setInterimText('');
        } else {
          interim += text;
        }
      }

      if (interim) setInterimText(interim);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [isSupported, language]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const clear = useCallback(() => {
    setTranscript([]);
    setInterimText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { transcript, interimText, isSupported, isListening, start, stop, clear };
};
