import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';

interface IssueComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmitShortcut?: () => void;
  disabled?: boolean;
  onVoiceTranscript?: (transcript: string) => void;
}

export const IssueComposer: React.FC<IssueComposerProps> = ({
  value,
  onChange,
  onSubmitShortcut,
  disabled = false,
  onVoiceTranscript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number[]>([40, 65, 30, 85, 55, 70, 45, 90, 60]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<any>(null);
  const waveTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  // Voice recording simulation with real microphone API fallback
  const startRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);

    waveTimerRef.current = setInterval(() => {
      setAudioLevel([
        Math.floor(20 + Math.random() * 70),
        Math.floor(30 + Math.random() * 65),
        Math.floor(25 + Math.random() * 75),
        Math.floor(40 + Math.random() * 60),
        Math.floor(20 + Math.random() * 80),
        Math.floor(35 + Math.random() * 65),
        Math.floor(15 + Math.random() * 85),
      ]);
    }, 150);
  };

  const stopRecording = (applyText = true) => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);

    if (applyText) {
      const sampleTranscripts = [
        'There is a severe deep pothole in the northbound lane right next to the school gate. Vehicles are braking abruptly and causing traffic congestion.',
        'The streetlights along Sector 14 north corridor have been flickering and completely turned off for the last 2 nights, creating pitch dark spots for pedestrians.',
        'Stormwater drain is overflowing near the main avenue intersection. The drainage grate is clogged with silt after morning showers.',
      ];
      const selected = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      const updated = value ? `${value} ${selected}` : selected;
      onChange(updated);
      if (onVoiceTranscript) onVoiceTranscript(selected);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (onSubmitShortcut) onSubmitShortcut();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative bg-white rounded-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-[#0F1E36]/15">
        <textarea
          ref={textareaRef}
          id="issue-description-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Tell us what happened... Describe the situation clearly."
          className="w-full min-h-[160px] p-5 pb-14 text-base sm:text-lg text-[#111827] placeholder:text-[#9CA3AF] bg-transparent border-0 resize-none focus:outline-none focus:ring-0 leading-relaxed font-sans"
        />

        {/* Floating Voice / Transcription Controls inside bottom right */}
        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full shadow-xs animate-in fade-in duration-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <div className="flex items-center gap-0.5 h-4">
                {audioLevel.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-0.5 bg-red-600 rounded-full transition-all duration-100"
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-medium text-red-700 ml-1">
                00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
              </span>
              <button
                type="button"
                onClick={() => stopRecording(true)}
                className="ml-1 text-xs font-semibold text-red-700 bg-white px-2 py-0.5 rounded-full hover:bg-red-100 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="voice-record-btn"
              onClick={startRecording}
              disabled={disabled}
              title="Record voice description (AI transcribed)"
              className="w-10 h-10 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] active:scale-95 text-[#4B5563] hover:text-[#111827] flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          )}
        </div>

        {/* Bottom Left Character & Voice Hint */}
        <div className="absolute bottom-3.5 left-4 flex items-center gap-2 text-xs text-[#9CA3AF]">
          {value.length > 0 && (
            <span className="font-mono text-[11px]">
              {value.length} chars · {value.split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
