import React from 'react';
import { Search, Filter, Lightbulb, Droplet, SlidersHorizontal, Trash2 } from 'lucide-react';
import { DashboardReportItem } from '../../types';

interface ReportFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  reports: DashboardReportItem[];
  className?: string;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  reports = [],
  className = '',
}) => {
  // Compute counts for each status filter
  const allCount = reports.length;

  const activeCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('in progress') || s.includes('assigned') || s.includes('active');
  }).length;

  const awaitingCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('awaiting') || s.includes('under review') || s.includes('verification');
  }).length;

  const inProgressCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('in progress') || s.includes('assigned');
  }).length;

  const resolvedCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('resolved') || s.includes('closed');
  }).length;

  const reopenedCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('reopened');
  }).length;

  const filterTabs = [
    { id: 'all', label: 'All', count: allCount },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'awaiting', label: 'Awaiting Review', count: awaitingCount },
    { id: 'in_progress', label: 'In Progress', count: inProgressCount },
    { id: 'resolved', label: 'Resolved', count: resolvedCount },
    { id: 'reopened', label: 'Reopened', count: reopenedCount },
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'water', label: 'Water' },
    { id: 'roads', label: 'Roads' },
    { id: 'sanitation', label: 'Sanitation' },
  ];

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Top Search & Category Selection Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports by ID (#CV-...), title, landmark..."
            className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all placeholder:text-[#94A3B8]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isCatActive
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E2E8F0]">
        {filterTabs.map((tab) => {
          const isActive = currentFilter.toLowerCase() === tab.id.toLowerCase();
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#2563EB] text-[#2563EB] font-bold'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-blue-100 text-[#1E40AF]'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportFilters;
