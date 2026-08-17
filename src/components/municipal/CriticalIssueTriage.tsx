import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { MunicipalIssueItem, MunicipalDepartment } from '../../types';
import { IssueCard } from './IssueCard';

interface CriticalIssueTriageProps {
  issues: MunicipalIssueItem[];
  activeFlagFilter?: 'all' | 'critical' | 'lowConfidence' | 'overSla' | 'reopened';
  onClearFlagFilter?: () => void;
  onAssignTeam: (issue: MunicipalIssueItem) => void;
  onViewTelemetry: (issue: MunicipalIssueItem) => void;
}

export const CriticalIssueTriage: React.FC<CriticalIssueTriageProps> = ({
  issues,
  activeFlagFilter = 'all',
  onClearFlagFilter,
  onAssignTeam,
  onViewTelemetry,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | MunicipalDepartment>('all');
  const [selectedSort, setSelectedSort] = useState<'priority' | 'slaUrgency' | 'confidence' | 'reports'>('priority');
  const [searchFilter, setSearchFilter] = useState('');
  const [viewAllQueues, setViewAllQueues] = useState(false);

  const departments: ('all' | MunicipalDepartment)[] = [
    'all',
    'Electricity',
    'Water',
    'Roads',
    'Sanitation',
    'Public Safety',
  ];

  // Filter issues based on department, search, and active flags
  const filteredIssues = useMemo(() => {
    let list = [...issues];

    // Flag filter from metrics cards
    if (activeFlagFilter === 'critical') {
      list = list.filter((i) => i.priorityScore >= 90);
    } else if (activeFlagFilter === 'overSla') {
      list = list.filter((i) => i.isOverSla);
    } else if (activeFlagFilter === 'lowConfidence') {
      list = list.filter((i) => i.isLowConfidence);
    } else if (activeFlagFilter === 'reopened') {
      list = list.filter((i) => i.isReopened);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      list = list.filter((i) => i.department === selectedDepartment);
    }

    // Local Search
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.issueCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.ward.toLowerCase().includes(q)
      );
    }

    // If not "view all queues", focus primarily on high-priority unresolved items
    if (!viewAllQueues && activeFlagFilter === 'all') {
      list = list.filter((i) => i.priorityScore >= 70 || i.isOverSla || i.isReopened);
    }

    // Sort
    list.sort((a, b) => {
      if (selectedSort === 'priority') return b.priorityScore - a.priorityScore;
      if (selectedSort === 'slaUrgency') return a.slaRemainingHours - b.slaRemainingHours;
      if (selectedSort === 'confidence') return b.aiConfidence - a.aiConfidence;
      if (selectedSort === 'reports') return b.reportCount - a.reportCount;
      return 0;
    });

    return list;
  }, [issues, activeFlagFilter, selectedDepartment, searchFilter, viewAllQueues, selectedSort]);

  return (
    <section className="space-y-4" aria-label="Critical Issue Triage">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-sans">
            Critical Issue Triage
          </h2>
          {activeFlagFilter !== 'all' && (
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <span>Filtered: {activeFlagFilter}</span>
              {onClearFlagFilter && (
                <button
                  onClick={onClearFlagFilter}
                  className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  title="Clear filter"
                >
                  ×
                </button>
              )}
            </span>
          )}
        </div>

        {/* View All Queues Toggle */}
        <button
          onClick={() => setViewAllQueues(!viewAllQueues)}
          className="text-xs font-mono font-bold tracking-wider uppercase text-[#0F1E36] hover:text-[#2563EB] transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100"
        >
          <span>{viewAllQueues ? 'FOCUS CRITICAL ONLY' : 'VIEW ALL QUEUES'}</span>
          <span className="text-[11px] font-sans text-slate-400">({issues.length})</span>
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E5E7EB] shadow-2xs">
        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {departments.map((dept) => {
            const isSelected = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F1E36] text-white font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-100'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            );
          })}
        </div>

        {/* Sort and Quick Search */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              aria-label="Sort issues by"
              className="bg-transparent text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
            >
              <option value="priority">Priority (High to Low)</option>
              <option value="slaUrgency">SLA Urgency</option>
              <option value="confidence">AI Confidence</option>
              <option value="reports">Report Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issue Feed Queue */}
      <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onAssignTeam={onAssignTeam}
              onViewTelemetry={onViewTelemetry}
            />
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB] space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-[#111827]">
              No critical civic issues matching filter criteria
            </h4>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              All high-priority operational items in this category are either resolved or within acceptable SLA margins.
            </p>
            {activeFlagFilter !== 'all' && onClearFlagFilter && (
              <button
                onClick={onClearFlagFilter}
                className="mt-2 px-3 py-1.5 text-xs font-semibold text-[#0F1E36] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CriticalIssueTriage;
