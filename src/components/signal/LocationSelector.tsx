import React, { useState } from 'react';
import { MapPin, Navigation, Edit3, ShieldCheck, Loader2, Crosshair } from 'lucide-react';

export interface LocationData {
  address: string;
  ward: string;
  city: string;
  accuracy: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface LocationSelectorProps {
  location: LocationData;
  onLocationUpdate?: (location: LocationData) => void;
  onOpenAdjustModal: () => void;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onLocationUpdate,
  onOpenAdjustModal,
  disabled = false,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const accuracyText = `Approx. ${Math.round(accuracy)}m accuracy`;

        if (onLocationUpdate) {
          onLocationUpdate({
            address: location.address || 'Current Location',
            ward: location.ward,
            city: location.city,
            accuracy: accuracyText,
            coordinates: { lat: latitude, lng: longitude },
          });
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Unable to get your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
          Location
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={disabled || isLocating}
            className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
          <button
            type="button"
            id="btn-adjust-location"
            disabled={disabled}
            onClick={onOpenAdjustModal}
            className="flex items-center gap-1 text-xs font-semibold text-[#111827] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Adjust</span>
          </button>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
          {locationError}
        </div>
      )}

      {/* Selected Location Card */}
      <div
        onClick={!disabled ? onOpenAdjustModal : undefined}
        className="flex items-center justify-between p-3.5 sm:p-4 bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-all duration-150 cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <MapPin className="w-5 h-5 text-[#0F1E36]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-semibold text-[#111827] truncate">
              {location.address}
            </h4>
            <p className="text-xs text-[#6B7280] font-sans flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{location.accuracy}</span>
              <span className="text-[#9CA3AF]">·</span>
              <span className="font-mono text-[11px] text-[#4B5563]">
                {location.coordinates.lat.toFixed(4)}° N, {location.coordinates.lng.toFixed(4)}° E
              </span>
            </p>
          </div>
        </div>

        {/* Mini Map Preview */}
        <div className="hidden sm:block w-28 h-12 rounded-lg border border-[#D1D5DB] overflow-hidden shrink-0 relative bg-[#E5E7EB]">
          <div className="w-full h-full bg-[#EBF3FC] relative">
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-[#CBD5E1] -translate-y-1/2" />
            <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-[#CBD5E1]" />
            <div className="absolute top-0 bottom-0 right-1/3 w-1 bg-[#CBD5E1]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-red-600 relative z-10 border border-white" />
            </div>
            <div className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#475569] uppercase tracking-tighter opacity-80">
              {location.ward}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
