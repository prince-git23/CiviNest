import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, UploadCloud, CheckCircle2, Plus, Sparkles } from 'lucide-react';

export interface EvidenceItem {
  id: string;
  url: string;
  name: string;
  size: string;
  type: 'image' | 'video';
  uploading?: boolean;
  progress?: number;
}

interface EvidenceUploaderProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  onRemoveEvidence: (id: string) => void;
  disabled?: boolean;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  evidenceList,
  onAddEvidence,
  onRemoveEvidence,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sample quick images to enhance preview testing
  const samplePresets = [
    {
      name: 'Pothole Surface Cavity',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      size: '1.4 MB',
    },
    {
      name: 'Streetlight Pole Dark',
      url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
      size: '2.1 MB',
    },
    {
      name: 'Stormwater Drain Grate',
      url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80',
      size: '1.8 MB',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `ev-${Date.now()}-${i}`;
      const url = URL.createObjectURL(file);
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // Simulate rapid progressive upload
      const newItem: EvidenceItem = {
        id,
        url,
        name: file.name,
        size: sizeStr,
        type: file.type.startsWith('video') ? 'video' : 'image',
        uploading: true,
        progress: 15,
      };

      onAddEvidence(newItem);

      // Complete progress in 400ms
      setTimeout(() => {
        newItem.uploading = false;
        newItem.progress = 100;
      }, 500);
    }
  };

  const handleAddPreset = (preset: (typeof samplePresets)[0]) => {
    const id = `ev-${Date.now()}`;
    const newItem: EvidenceItem = {
      id,
      url: preset.url,
      name: preset.name,
      size: preset.size,
      type: 'image',
      uploading: false,
      progress: 100,
    };
    onAddEvidence(newItem);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const id = `ev-${Date.now()}`;
      const url = URL.createObjectURL(file);
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      onAddEvidence({
        id,
        url,
        name: file.name,
        size: sizeStr,
        type: 'image',
        uploading: false,
        progress: 100,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
          Evidence
        </label>
        {evidenceList.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <span>Quick sample:</span>
            <button
              type="button"
              onClick={() => handleAddPreset(samplePresets[0])}
              className="text-[#0F1E36] font-medium hover:underline text-[11px] bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer"
            >
              + Road Damage
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Upload Trigger Dropzone Card */}
        <button
          type="button"
          id="evidence-upload-dropzone"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-28 h-28 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group select-none ${
            isDragging
              ? 'border-[#0F1E36] bg-blue-50/50 scale-102'
              : 'border-[#D1D5DB] bg-[#F9FAFB] hover:bg-[#F3F4F6] hover:border-[#9CA3AF]'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#4B5563] group-hover:text-[#0F1E36] transition-colors shadow-2xs">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-[#374151] group-hover:text-[#111827]">
            Photo/Video
          </span>
        </button>

        {/* Uploaded Evidence Cards */}
        {evidenceList.map((item) => (
          <div
            key={item.id}
            className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#E5E7EB] bg-white group shadow-2xs"
          >
            {item.uploading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#F3F4F6] p-2 text-center">
                <UploadCloud className="w-6 h-6 text-[#4B5563] animate-bounce mb-1" />
                <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-[#0F1E36] transition-all duration-300"
                    style={{ width: `${item.progress || 60}%` }}
                  />
                </div>
                <span className="text-[9px] text-[#6B7280] mt-1">Uploading...</span>
              </div>
            ) : (
              <>
                <img
                  src={item.url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover Delete Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onRemoveEvidence(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-red-600 flex items-center justify-center shadow transition-transform active:scale-90 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Small indicator tag */}
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                  {item.size}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
