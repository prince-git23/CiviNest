import React, { useState } from 'react';
import { MapPin, Navigation, X, Check, Search, Compass, Loader2 } from 'lucide-react';
import { LocationData } from './LocationSelector';

interface LocationAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationData;
  onSaveLocation: (newLocation: LocationData) => void;
}

export const LocationAdjustModal: React.FC<LocationAdjustModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSaveLocation,
}) => {
  const [selectedWard, setSelectedWard] = useState(currentLocation.ward);
  const [addressInput, setAddressInput] = useState(currentLocation.address);
  const [accuracyLevel, setAccuracyLevel] = useState(currentLocation.accuracy);
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const wardPresets = [
    { name: 'Dharampeth', city: 'Nagpur', coords: { lat: 21.1458, lng: 79.0882 } },
    { name: 'Ramdaspeth', city: 'Nagpur', coords: { lat: 21.1398, lng: 79.0765 } },
    { name: 'Civil Lines', city: 'Nagpur', coords: { lat: 21.1592, lng: 79.0758 } },
    { name: 'Sitabuldi', city: 'Nagpur', coords: { lat: 21.1466, lng: 79.0832 } },
    { name: 'Laxmi Nagar', city: 'Nagpur', coords: { lat: 21.1215, lng: 79.0684 } },
  ];

  const handleGeolocate = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setAccuracyLevel('Approx. 5m accuracy (GPS lock)');
      setAddressInput('Near Shivaji Nagar Junction, Dharampeth, Nagpur');
      setSelectedWard('Dharampeth');
    }, 800);
  };

  const handleSave = () => {
    const matched = wardPresets.find((w) => w.name === selectedWard) || wardPresets[0];
    onSaveLocation({
      address: addressInput.trim() || `${selectedWard}, Nagpur`,
      ward: selectedWard,
      city: 'Nagpur',
      accuracy: accuracyLevel,
      coordinates: matched.coords,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden text-left relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F1E36]">Adjust Signal Location</h3>
              <p className="text-xs text-[#6B7280]">Select ward cell or pinpoint GPS coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-200 text-[#6B7280] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick Auto-Detect GPS */}
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Locking satellite mesh telemetry...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Use Current Device GPS Geolocation</span>
              </>
            )}
          </button>

          {/* Address Line input */}
          <div>
            <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
              Specific Street or Landmark Address
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="e.g. Near Primary School Gate, West Park Avenue"
              className="w-full text-sm px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F1E36]"
            />
          </div>

          {/* Ward Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-1.5">
              Municipal Ward Sector
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {wardPresets.map((w) => (
                <button
                  key={w.name}
                  type="button"
                  onClick={() => setSelectedWard(w.name)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                    selectedWard === w.name
                      ? 'bg-[#0F1E36] text-white border-[#0F1E36] shadow-xs'
                      : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="truncate">{w.name}</div>
                  <div className={`text-[10px] ${selectedWard === w.name ? 'text-blue-200' : 'text-[#6B7280]'}`}>
                    {w.city}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Accuracy status */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs text-[#4B5563]">
            <span>Precision Index:</span>
            <span className="font-mono font-medium text-[#0F1E36]">{accuracyLevel}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#4B5563] hover:text-[#111827] rounded-xl hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0F1E36] hover:bg-[#1E293B] rounded-xl shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
