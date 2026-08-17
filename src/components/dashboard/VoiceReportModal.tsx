import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Check, Play, Square, Loader2 } from 'lucide-react';

interface VoiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVoice: (transcript: string) => void;
}

export const VoiceReportModal: React.FC<VoiceReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitVoice,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const startRecording = () => {
    setIsRecording(true);
    setSeconds(0);
    setTranscript('');

    // Simulate real-time speech-to-text progression
    setTimeout(() => {
      setTranscript('The streetlights along Gate 2 are completely shut off tonight...');
    }, 1500);

    setTimeout(() => {
      setTranscript(
        'The streetlights along Gate 2 are completely shut off tonight. Multiple residents are walking in the dark, and there seems to be a circuit tripped near transformer box 4.'
      );
    }, 3500);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleProcessAndSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSubmitVoice(transcript);
      onClose();
    }, 800);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E5E7EB] p-6 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#0F1E36]">Voice Civic Reporter</h3>
        </div>

        <p className="text-xs text-[#4B5563] leading-relaxed mb-6">
          Describe the problem in your natural voice. CiviNest AI will extract the issue category, severity, and location automatically.
        </p>

        {/* Audio Waveform / Recording Orb */}
        <div className="flex flex-col items-center justify-center py-6 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-5">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-100 scale-105'
                : 'bg-[#0F1E36] hover:bg-[#1E293B] text-white'
            }`}
          >
            {isRecording ? <Square className="w-6 h-6 fill-white" /> : <Mic className="w-8 h-8" />}
          </button>

          <div className="mt-4 text-center">
            <span className="font-mono text-sm font-bold text-[#111827]">
              {isRecording ? formatTime(seconds) : 'Click to start recording'}
            </span>
            {isRecording && (
              <p className="text-[11px] text-red-500 font-mono animate-pulse mt-0.5">
                ● Listening & transcribing...
              </p>
            )}
          </div>
        </div>

        {/* Live Transcript Box */}
        {transcript && (
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 mb-5">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono font-semibold text-[#2563EB]">
              <Sparkles className="w-3 h-3" />
              <span>AI Live Transcription</span>
            </div>
            <p className="text-xs text-[#1F2937] leading-relaxed font-sans">{transcript}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={!transcript || isProcessing}
            onClick={handleProcessAndSubmit}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              transcript && !isProcessing
                ? 'bg-[#0F1E36] hover:bg-[#1E293B] text-white shadow-sm'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Ingest Voice Signal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceReportModal;
