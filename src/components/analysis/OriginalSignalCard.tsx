import React, { useState } from 'react';
import { MapPin, Clock, Plus, Eye, X, Image as ImageIcon } from 'lucide-react';
import { LocationData } from '../signal/LocationSelector';
import { EvidenceItem } from '../signal/EvidenceUploader';

interface OriginalSignalCardProps {
  description: string;
  location: LocationData;
  timestamp: string;
  evidenceList: EvidenceItem[];
  onAddEvidence?: () => void;
  onEditSignal?: () => void;
}

export const OriginalSignalCard: React.FC<OriginalSignalCardProps> = ({
  description,
  location,
  timestamp,
  evidenceList,
  onAddEvidence,
  onEditSignal,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs text-left space-y-4">
      {/* Header with Title and Raw Input Pill */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4B5563]">
          YOUR ORIGINAL SIGNAL
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
          Raw Input
        </span>
      </div>

      {/* Raw Description Quote Block */}
      <div
        onClick={onEditSignal}
        className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] group relative hover:border-blue-300 transition-colors cursor-pointer"
        title="Click to edit raw description"
      >
        <p className="text-sm font-serif italic text-[#1E293B] leading-relaxed">
          "{description || 'The streetlight outside Gate 2 has been off for three nights. It gets very dark near the school.'}"
        </p>
      </div>

      {/* Location and Timestamp details */}
      <div className="space-y-2 pt-1 border-t border-[#F1F5F9] text-xs text-[#4B5563]">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-medium text-[#1E293B]">
            {location.address || 'Dharampeth, Nagpur'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
          <span className="text-[#64748B]">{timestamp || 'Oct 24, 2023 • 19:42 IST'}</span>
        </div>
      </div>

      {/* Attached Evidence Section */}
      <div className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          ATTACHED EVIDENCE ({evidenceList.length})
        </span>

        <div className="flex items-center gap-2.5 flex-wrap">
          {evidenceList.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedPhoto(item.url)}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#CBD5E1] group cursor-pointer shadow-2xs hover:ring-2 hover:ring-blue-500 transition-all shrink-0 bg-slate-900"
            >
              <img
                src={item.url}
                alt={item.name || `Evidence ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}

          {/* Add more evidence button */}
          {onAddEvidence && (
            <button
              type="button"
              onClick={onAddEvidence}
              className="w-14 h-14 rounded-xl border border-dashed border-[#94A3B8] hover:border-[#0F1E36] hover:bg-gray-50 flex items-center justify-center text-[#64748B] hover:text-[#0F1E36] transition-all cursor-pointer shrink-0"
              title="Add more evidence images"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Lightbox / Image Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Evidence Inspector</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-[70vh] flex items-center justify-center">
              <img
                src={selectedPhoto}
                alt="Evidence Full View"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
