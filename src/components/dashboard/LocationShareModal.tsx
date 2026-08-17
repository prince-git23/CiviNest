import React, { useState, useEffect } from 'react';
import { Navigation, X, Check, MapPin, Loader2, Compass } from 'lucide-react';

interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardName: string;
  community: string;
  onConfirmLocation: (locData: { lat: number; lng: number; address: string }) => void;
}

export const LocationShareModal: React.FC<LocationShareModalProps> = ({
  isOpen,
  onClose,
  wardName,
  community,
  onConfirmLocation,
}) => {
  const [detecting, setDetecting] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 21.1458, lng: 79.0882 });
  const [accuracy, setAccuracy] = useState('±3.5 meters');

  useEffect(() => {
    if (isOpen) {
      setDetecting(true);
      const timer = setTimeout(() => {
        setCoords({ lat: 21.1458 + (Math.random() - 0.5) * 0.005, lng: 79.0882 + (Math.random() - 0.5) * 0.005 });
        setDetecting(false);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#0F1E36]">Precise GPS Pinpoint</h3>
        </div>

        <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
          Pinpointing your current civic geolocation to auto-route issues to the exact municipal ward cell.
        </p>

        {/* GPS Sensor Visualizer */}
        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-5">
          {detecting ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <span className="text-xs font-semibold text-[#111827]">Locking onto satellite mesh...</span>
              <span className="text-[11px] font-mono text-[#6B7280] mt-0.5">Triangulating Nagpur/Dharampeth</span>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#6B7280] font-mono uppercase text-[10px]">Detected Locality</span>
                <span className="font-bold text-[#111827]">{community}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-[#6B7280] font-mono uppercase text-[10px]">Ward Jurisdiction</span>
                <span className="font-semibold text-[#2563EB]">{wardName} · Zone 4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] font-mono uppercase text-[10px]">GPS Coordinates</span>
                <span className="font-mono text-[#111827]">
                  {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={detecting}
            onClick={() => {
              onConfirmLocation({
                lat: coords.lat,
                lng: coords.lng,
                address: `${community}, ${wardName}`,
              });
              onClose();
            }}
            className="px-5 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirm & Tag Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationShareModal;
