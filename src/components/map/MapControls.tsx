import React, { useState } from 'react';
import {
  Layers,
  Crosshair,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { MapLayer } from '../../services/geo/geoTypes';

interface MapControlsProps {
  layers: MapLayer[];
  onToggleLayer: (layerId: string) => void;
  onLocateMe?: () => void;
  onReset?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  layers,
  onToggleLayer,
  onLocateMe,
  onReset,
  onFullscreen,
  isFullscreen = false,
  className = '',
}) => {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Layer Toggle Panel */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
            Layers
          </span>
          {showLayers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showLayers && (
          <div className="border-t border-[#F3F4F6] p-2 space-y-1">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onToggleLayer(layer.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: layer.visible ? (layer.color || '#3B82F6') : 'transparent', borderColor: layer.color || '#3B82F6' }}
                  />
                  {layer.name}
                </span>
                {layer.visible ? (
                  <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-[#D1D5DB]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-col gap-1.5">
        {onLocateMe && (
          <button
            onClick={onLocateMe}
            className="w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg shadow-md flex items-center justify-center text-[#6B7280] hover:text-[#0F1E36] hover:bg-[#F9FAFB] transition-colors"
            title="Use my location"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg shadow-md flex items-center justify-center text-[#6B7280] hover:text-[#0F1E36] hover:bg-[#F9FAFB] transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className="w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg shadow-md flex items-center justify-center text-[#6B7280] hover:text-[#0F1E36] hover:bg-[#F9FAFB] transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default MapControls;
