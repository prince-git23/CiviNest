import React from 'react';
import { PlusCircle, Camera, Mic, Navigation, ShieldAlert } from 'lucide-react';

interface QuickActionBarProps {
  onReportIssue: () => void;
  onAddPhoto: () => void;
  onUseVoice: () => void;
  onShareLocation: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onReportIssue,
  onAddPhoto,
  onUseVoice,
  onShareLocation,
}) => {
  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Primary CTA - Report a Civic Issue */}
        <button
          id="btn-report-civic-issue"
          onClick={onReportIssue}
          className="w-full flex items-center justify-center gap-2.5 bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-sm hover:shadow cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
          <span>Report a Civic Issue</span>
        </button>

        {/* Secondary CTA - Add Photo */}
        <button
          id="btn-quick-photo"
          onClick={onAddPhoto}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F9FAFB] active:scale-[0.99] text-[#1F2937] border border-[#E5E7EB] px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-150 shadow-xs hover:border-[#D1D5DB] cursor-pointer group"
        >
          <Camera className="w-4 h-4 text-[#6B7280] group-hover:text-[#0F1E36] transition-colors" />
          <span>Add Photo</span>
        </button>

        {/* Secondary CTA - Use Voice */}
        <button
          id="btn-quick-voice"
          onClick={onUseVoice}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F9FAFB] active:scale-[0.99] text-[#1F2937] border border-[#E5E7EB] px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-150 shadow-xs hover:border-[#D1D5DB] cursor-pointer group"
        >
          <Mic className="w-4 h-4 text-[#6B7280] group-hover:text-[#2563EB] transition-colors" />
          <span>Use Voice</span>
        </button>

        {/* Secondary CTA - Share Location */}
        <button
          id="btn-quick-location"
          onClick={onShareLocation}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F9FAFB] active:scale-[0.99] text-[#1F2937] border border-[#E5E7EB] px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-150 shadow-xs hover:border-[#D1D5DB] cursor-pointer group"
        >
          <Navigation className="w-4 h-4 text-[#6B7280] group-hover:text-[#10B981] transition-colors" />
          <span>Share Location</span>
        </button>
      </div>
    </section>
  );
};

export default QuickActionBar;
