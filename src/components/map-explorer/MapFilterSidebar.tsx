import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Check,
  X,
  Droplets,
  Zap,
  Hammer,
  Trash2,
  Shield,
  Layers,
  School,
  Hospital,
  Bus,
  Activity,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MapFilterState } from '../../services/mapExplorerService';

interface MapFilterSidebarProps {
  filters: MapFilterState;
  onFilterChange: (filters: MapFilterState) => void;
  totalClustersCount: number;
  filteredClustersCount: number;
  userLocation: {
    city: string;
    ward: string;
    community: string;
  };
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const MapFilterSidebar: React.FC<MapFilterSidebarProps> = ({
  filters,
  onFilterChange,
  totalClustersCount,
  filteredClustersCount,
  userLocation,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = [
    { id: 'water', label: 'Water Supply Grid', icon: Droplets, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'roads', label: 'Roads & Pavement', icon: Hammer, color: 'text-amber-600 bg-amber-50' },
    { id: 'lighting', label: 'Street Lighting Grid', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
    { id: 'sanitation', label: 'Drainage & Waste', icon: Trash2, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'safety', label: 'Public Safety', icon: Shield, color: 'text-rose-600 bg-rose-50' },
  ];

  const handleToggleCategory = (catId: string) => {
    let nextCats: string[];
    if (filters.categories.includes(catId)) {
      nextCats = filters.categories.filter((c) => c !== catId);
    } else {
      nextCats = [...filters.categories, catId];
    }
    onFilterChange({ ...filters, categories: nextCats });
  };

  const handleSelectAllCategories = () => {
    onFilterChange({
      ...filters,
      categories: ['water', 'roads', 'lighting', 'sanitation', 'safety'],
    });
  };

  const handleClearCategories = () => {
    onFilterChange({ ...filters, categories: [] });
  };

  const handleToggleInfra = (key: keyof MapFilterState['infrastructure']) => {
    onFilterChange({
      ...filters,
      infrastructure: {
        ...filters.infrastructure,
        [key]: !filters.infrastructure[key],
      },
    });
  };

  const content = (
    <div className="p-4 sm:p-5 space-y-5 text-left text-[#0F172A]">
      {/* 1. Civic Location Context Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
            CIVIC JURISDICTION
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Live Telemetry
          </span>
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <div className="w-7 h-7 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] leading-snug">
              {userLocation.ward}
            </h3>
            <p className="text-xs text-[#64748B]">
              {userLocation.community} · {userLocation.city}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
          <span className="text-[#64748B]">Showing Clusters:</span>
          <span className="font-bold text-[#0F172A]">
            {filteredClustersCount} of {totalClustersCount} Active
          </span>
        </div>
      </div>

      {/* 2. Real-time Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search issues, streets, landmarks..."
          className="w-full pl-9.5 pr-8 py-2.5 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Issue Categories Multi-Select */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
            Issue Domains
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <button
              onClick={handleSelectAllCategories}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleClearCategories}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {categories.map((cat) => {
            const isChecked = filters.categories.includes(cat.id);
            const Icon = cat.icon;
            return (
              <label
                key={cat.id}
                onClick={() => handleToggleCategory(cat.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-white border-blue-300 shadow-2xs text-[#0F172A]'
                    : 'bg-white/60 border-slate-200 text-[#64748B] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{cat.label}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Severity Filter Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
          Severity Filter
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
          ].map((sev) => {
            const isSelected = filters.severity === sev.id;
            return (
              <button
                key={sev.id}
                onClick={() => onFilterChange({ ...filters, severity: sev.id as any })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-[#475569] hover:bg-slate-50'
                }`}
              >
                {sev.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Status Filter */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
          Resolution Lifecycle
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'active', label: 'Active Issues' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((st) => {
            const isSelected = filters.status === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onFilterChange({ ...filters, status: st.id as any })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-[#475569] hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Infrastructure Overlays */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
          Civic Infrastructure Layers
        </span>
        <div className="space-y-1.5">
          {[
            { id: 'schools', label: 'Schools & Education', icon: School, color: 'text-teal-600' },
            { id: 'hospitals', label: 'Hospitals & Healthcare', icon: Hospital, color: 'text-pink-600' },
            { id: 'transit', label: 'Transit & Metro Hubs', icon: Bus, color: 'text-indigo-600' },
            { id: 'utilities', label: 'Power & Water Utilities', icon: Zap, color: 'text-cyan-600' },
          ].map((layer) => {
            const key = layer.id as keyof MapFilterState['infrastructure'];
            const isEnabled = filters.infrastructure[key];
            const Icon = layer.icon;
            return (
              <div
                key={layer.id}
                onClick={() => handleToggleInfra(key)}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${layer.color}`} />
                  <span className="text-[#334155] font-medium">{layer.label}</span>
                </div>
                <div
                  className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                    isEnabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        id="map-filter-sidebar"
        className="hidden md:flex flex-col w-80 lg:w-88 bg-[#FBFBFA] border-r border-[#E2E8F0] h-[calc(100vh-4.5rem)] overflow-y-auto shrink-0 z-20 shadow-xs"
      >
        <div className="p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
              Civic Map Explorer
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
            v2.4 Live
          </span>
        </div>

        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative bg-[#FBFBFA] rounded-t-3xl border-t border-[#E2E8F0] max-h-[85vh] overflow-y-auto z-10 shadow-2xl">
            <div className="p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">Filter Civic Intelligence</h3>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
