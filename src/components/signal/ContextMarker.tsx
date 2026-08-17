import React from 'react';
import { Lightbulb, GraduationCap, Droplets, Shield, MapPin, Check, AlertCircle } from 'lucide-react';

export interface ContextMarkerData {
  id: string;
  type: 'nearby' | 'zone' | 'infra';
  badgeLabel: string;
  title: string;
  distance: string;
  status: string;
  statusType: 'active' | 'priority' | 'normal';
  icon: 'light' | 'school' | 'water' | 'drain' | 'safety';
  position: [number, number, number];
  description?: string;
}

interface ContextMarkerProps {
  marker: ContextMarkerData;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ContextMarker: React.FC<ContextMarkerProps> = ({
  marker,
  isSelected = false,
  onClick,
}) => {
  const getIcon = () => {
    switch (marker.icon) {
      case 'light':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'school':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'water':
      case 'drain':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      default:
        return <MapPin className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-white text-[#0F1E36] border-blue-400 shadow-md ring-2 ring-blue-500/20 scale-101'
          : 'bg-white/90 backdrop-blur-md hover:bg-white text-[#111827] border-slate-200/80 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            marker.icon === 'light'
              ? 'bg-amber-50 border-amber-200'
              : marker.icon === 'school'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-cyan-50 border-cyan-200'
          }`}
        >
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            {marker.badgeLabel}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#0F1E36] truncate">
            {marker.title} ({marker.distance})
          </div>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        {marker.statusType === 'active' ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {marker.status}
          </span>
        ) : marker.statusType === 'priority' ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {marker.status}
          </span>
        ) : (
          <span className="inline-flex items-center text-[11px] font-medium text-[#4B5563] bg-gray-100 px-2 py-0.5 rounded-full">
            {marker.status}
          </span>
        )}
      </div>
    </div>
  );
};
