import React, { useState } from 'react';
import { X, AlertTriangle, UploadCloud, RotateCcw, Image, Check } from 'lucide-react';

interface StillNotFixedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  onSubmitReopen: (reportId: string, reason: string, photoUrl?: string) => void;
}

export const StillNotFixedModal: React.FC<StillNotFixedModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  onSubmitReopen,
}) => {
  const [reason, setReason] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReopen(reportId, reason, selectedPhoto || undefined);
      setIsSubmitting(false);
      setReason('');
      setSelectedPhoto(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#CBD5E1] overflow-hidden text-left flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-start justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 block">
                Flag Incomplete Resolution
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] line-clamp-1">
                {reportTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#475569] mb-1.5">
              Why is this issue still unresolved? <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., The surface was patched, but the underlying drain is still choked and water began pooling again today..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden bg-[#F8FAFC]"
            />
          </div>

          {/* Optional Ground Photo Upload */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#475569] mb-1.5">
              Attach Ground Verification Photo (Optional)
            </label>
            <div
              onClick={() => {
                // Simulate quick photo selection
                setSelectedPhoto(
                  'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80'
                );
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                selectedPhoto
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-[#CBD5E1] hover:border-slate-400 bg-[#F8FAFC]'
              }`}
            >
              {selectedPhoto ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Ground evidence photo attached (Click to swap)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-xs text-[#64748B]">
                  <UploadCloud className="w-6 h-6 text-[#94A3B8]" />
                  <span className="font-semibold text-[#0F172A]">
                    Click to attach camera photo
                  </span>
                  <span className="text-[11px]">Supports JPG, PNG up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Notice banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11.5px] text-amber-900 leading-relaxed">
            Reopening will escalate this signal with <strong>High Priority</strong> to the municipal ward officer and pause the contractor's closure milestone.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Escalating...' : 'Reopen Civic Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StillNotFixedModal;
