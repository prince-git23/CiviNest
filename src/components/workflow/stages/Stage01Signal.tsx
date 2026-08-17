import React, { useState } from 'react';
import { Mic, Image as ImageIcon, MapPin, Sparkles, Send, Check } from 'lucide-react';

interface Stage01SignalProps {
  onSignalTrigger?: (text: string) => void;
}

export const Stage01Signal: React.FC<Stage01SignalProps> = ({ onSignalTrigger }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'photo' | 'location'>('voice');
  const [inputText, setInputText] = useState(
    "There's a massive pothole on 5th avenue just past the intersection. Looks dangerous."
  );
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      if (onSignalTrigger) {
        onSignalTrigger(inputText);
      }
      setTimeout(() => setSentSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left: Stage 01 Narrative & Interactive Report Card */}
        <div className="lg:col-span-6 flex justify-start lg:justify-end order-2 lg:order-1">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_8px_28px_rgba(15,30,54,0.04)] p-6 sm:p-7 relative transition-all duration-300 hover:shadow-[0_12px_36px_rgba(15,30,54,0.07)]">
            
            {/* Input Modality Chips */}
            <div className="flex items-center gap-2 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'voice'
                    ? 'bg-[#EBF2FE] text-[#2563EB] border border-[#BFDBFE]'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] border border-transparent'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'photo'
                    ? 'bg-[#EBF2FE] text-[#2563EB] border border-[#BFDBFE]'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] border border-transparent'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('location')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'location'
                    ? 'bg-[#EBF2FE] text-[#2563EB] border border-[#BFDBFE]'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] border border-transparent'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Location</span>
              </button>
            </div>

            {/* Modality Context Header */}
            {activeTab === 'voice' && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="font-mono text-[11px]">Audio memo transcribed via Voice NLP</span>
              </div>
            )}
            {activeTab === 'photo' && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800">
                <span className="font-mono text-[11px]">EXIF Geotag: 40.7128° N, 74.0060° W</span>
              </div>
            )}
            {activeTab === 'location' && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800">
                <span className="font-mono text-[11px]">Precise GPS Lock: Sector 14, 5th Ave</span>
              </div>
            )}

            {/* Resident Statement Container */}
            <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB] mb-4">
              <p className="text-sm sm:text-[14.5px] text-[#1F2937] italic font-serif leading-relaxed">
                "{inputText}"
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span className="font-mono text-[11px]">Signal Ingested • 0.2s</span>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1E36] hover:bg-slate-800 text-white font-medium text-xs transition-colors"
              >
                {sentSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Transmitted</span>
                  </>
                ) : isSending ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Routing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Test Ingest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Stage 01 Copy */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] mb-3 block">
              SIGNAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#0F1E36] tracking-tight mb-3">
              Capture the concern effortlessly.
            </h3>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-sans">
              Residents report issues using natural language, voice memos, or photos.
              We strip away the friction of complex municipal forms.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage01Signal;
