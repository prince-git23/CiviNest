import React from 'react';
import { Plus, Minus, Compass, RefreshCw, Maximize2, Minimize2, Layers } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onLocateResident: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onLocateResident,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div
      id="map-floating-controls"
      className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto"
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 hover:bg-white text-[#1E293B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 hover:bg-white text-[#1E293B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Locate Me / Resident Hub */}
      <button
        onClick={onLocateResident}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 hover:bg-white text-blue-600 hover:text-blue-700 border border-blue-200 shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        title="Locate My Residency Hub"
        aria-label="Locate My Residency Hub"
      >
        <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Reset Camera Orbit */}
      <button
        onClick={onResetCamera}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 hover:bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        title="Reset 3D Map Perspective"
        aria-label="Reset Map Perspective"
      >
        <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 hover:bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        ) : (
          <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        )}
      </button>
    </div>
  );
};
