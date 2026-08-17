import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CATEGORY_COLORS, PRIORITY_COLORS } from '../../services/geo/geoTypes';

interface MapLegendProps {
  showCategories?: boolean;
  showPriorities?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'street-lighting': 'Street Lighting',
  'water-supply': 'Water Supply',
  'road-maintenance': 'Road Maintenance',
  'sanitation': 'Sanitation',
  'drainage': 'Drainage',
  'electricity': 'Electricity',
  'traffic-signal': 'Traffic Signal',
  'parks': 'Parks',
  'public-transport': 'Public Transport',
  'infrastructure': 'Infrastructure',
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const MapLegend: React.FC<MapLegendProps> = ({
  showCategories = true,
  showPriorities = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#6B7280]" />
          Legend
        </span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isExpanded && (
        <div className="border-t border-[#F3F4F6] p-3 space-y-3">
          {showCategories && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">Categories</p>
              <div className="space-y-1">
                {Object.entries(CATEGORY_COLORS)
                  .filter(([key]) => CATEGORY_LABELS[key])
                  .map(([key, color]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[11px] text-[#4B5563]">{CATEGORY_LABELS[key]}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {showPriorities && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">Priority</p>
              <div className="space-y-1">
                {Object.entries(PRIORITY_COLORS).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[11px] text-[#4B5563]">{PRIORITY_LABELS[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapLegend;
