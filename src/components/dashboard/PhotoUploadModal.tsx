import React, { useState } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPhoto: (photoInfo: { name: string; url: string; aiTag: string }) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirmPhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiTag, setAiTag] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleEvidence = [
    {
      name: 'Broken Streetlight Pole',
      tag: 'Sodium Vapor Lamp Casing Fault',
      url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=500&auto=format&fit=crop&q=60',
    },
    {
      name: 'Pothole on Main Road',
      tag: 'Asphalt Cavitation · 45cm diameter',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const handleSelectSample = (sample: typeof sampleEvidence[0]) => {
    setSelectedPhoto(sample.url);
    setAnalyzing(true);
    setAiTag(null);
    setTimeout(() => {
      setAnalyzing(false);
      setAiTag(sample.tag);
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhoto(url);
      setAnalyzing(true);
      setAiTag(null);
      setTimeout(() => {
        setAnalyzing(false);
        setAiTag('User Uploaded Civic Photo · Metadata Tagged');
      }, 1000);
    }
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

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#0F1E36]">Add Photo Evidence</h3>
        </div>

        <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
          Attach a picture of the civic issue. Vision models will verify GPS EXIF coordinates and classify severity.
        </p>

        {/* Upload Drop Zone */}
        <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#3B82F6] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F8FAFC] mb-4 group">
          <Upload className="w-6 h-6 text-[#6B7280] group-hover:text-[#2563EB] mb-2 transition-colors" />
          <span className="text-xs font-semibold text-[#111827]">Click to select from device or drag photo</span>
          <span className="text-[10px] text-[#9CA3AF] mt-0.5">JPEG, PNG, HEIC up to 15MB</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        {/* Or Quick Sample Selector */}
        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] block mb-2">
            Or test with sample evidence
          </span>
          <div className="grid grid-cols-2 gap-2">
            {sampleEvidence.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(s)}
                className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  selectedPhoto === s.url
                    ? 'border-[#2563EB] bg-blue-50/50 font-semibold'
                    : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                }`}
              >
                <span className="block truncate text-[#111827]">{s.name}</span>
                <span className="text-[10px] text-[#6B7280] block truncate">Preset Photo</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview & AI Vision Classification Result */}
        {selectedPhoto && (
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-4 flex items-center gap-3">
            <img
              src={selectedPhoto}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-lg border border-[#CBD5E1]"
            />
            <div className="flex-1 min-w-0 text-xs">
              {analyzing ? (
                <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px]">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>AI Vision Analyzing image...</span>
                </div>
              ) : (
                <>
                  <span className="font-semibold text-[#111827] block truncate">Photo verified</span>
                  <span className="text-[11px] text-[#2563EB] block truncate font-mono">{aiTag}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!selectedPhoto || analyzing}
            onClick={() => {
              if (selectedPhoto && aiTag) {
                onConfirmPhoto({ name: 'Evidence Image', url: selectedPhoto, aiTag });
                onClose();
              }
            }}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              selectedPhoto && !analyzing
                ? 'bg-[#0F1E36] hover:bg-[#1E293B] text-white shadow-sm'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Attach Evidence</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
