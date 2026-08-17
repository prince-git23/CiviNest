import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Download,
  Sparkles,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { municipalIssues, type MunicipalIssue, type IssueCategory, type DepartmentType } from '../../data/municipalMockData';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT, CATEGORY_COLORS } from '../../services/geo/geoTypes';
import { getIssuesForViewport } from '../../services/geo/mapDataService';

type FilterPriority = 'all' | 'critical' | 'high' | 'medium' | 'low';
type FilterDept = 'all' | DepartmentType;
type FilterWard = 'all' | string;
type FilterStatus = 'all' | string;

export const IssueTriage: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -15, opacity: 0, duration: 0.4, ease: 'power2.out' });
      gsap.from(filtersRef.current, { y: 10, opacity: 0, duration: 0.3, delay: 0.1, ease: 'power2.out' });
      if (mapRef.current) {
        gsap.from(mapRef.current, { y: 20, opacity: 0, duration: 0.4, delay: 0.15, ease: 'power2.out' });
      }
      if (tableRef.current) {
        gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' });
      }
    });

    return () => ctx.revert();
  }, []);

  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [deptFilter, setDeptFilter] = useState<FilterDept>('all');
  const [wardFilter, setWardFilter] = useState<FilterWard>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [slaViolatedOnly, setSlaViolatedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [mapViewport] = useState<MapViewport>({ ...DEFAULT_VIEWPORT, zoom: 12 });
  const mapIssues = getIssuesForViewport(mapViewport);

  const filteredIssues = municipalIssues.filter((issue) => {
    if (priorityFilter !== 'all') {
      if (priorityFilter === 'critical' && issue.priority < 90) return false;
      if (priorityFilter === 'high' && (issue.priority < 75 || issue.priority >= 90)) return false;
      if (priorityFilter === 'medium' && (issue.priority < 50 || issue.priority >= 75)) return false;
      if (priorityFilter === 'low' && issue.priority >= 50) return false;
    }
    if (deptFilter !== 'all' && issue.department !== deptFilter) return false;
    if (wardFilter !== 'all' && issue.ward !== wardFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (slaViolatedOnly && !issue.isOverSla) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.issueCode.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.ward.toLowerCase().includes(q) ||
        issue.locality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'bg-red-50 text-red-700 border border-red-200';
    if (priority >= 75) return 'bg-orange-50 text-orange-700 border border-orange-200';
    if (priority >= 50) return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getImpactIcon = (issue: MunicipalIssue) => {
    if (issue.priority >= 90) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (issue.priority >= 75) return <span className="text-orange-500 font-bold text-sm">!</span>;
    return <span className="text-[#9CA3AF]">—</span>;
  };

  const getDeptBadge = (dept: DepartmentType) => {
    const colors: Record<string, string> = {
      'Water Supply': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Public Transport': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      'Roads & Transport': 'bg-slate-100 text-slate-700 border border-slate-200',
      'Electrical Operations': 'bg-amber-50 text-amber-700 border border-amber-200',
      'Sanitation & Waste': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'Drainage': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    };
    return colors[dept] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getSlaColor = (issue: MunicipalIssue) => {
    if (issue.isOverSla) return 'text-red-600 font-semibold';
    if (issue.slaRemaining.includes('left') && parseInt(issue.slaRemaining) < 30) return 'text-orange-600 font-semibold';
    return 'text-[#6B7280]';
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Civic Issue Triage</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Real-time prioritization and assignment of incoming civic reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors">
            <Sparkles className="w-4 h-4" />
            AI Auto-Assign
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div ref={filtersRef} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
            className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer"
          >
            <option value="all">Priority: All</option>
            <option value="critical">Priority: Critical</option>
            <option value="high">Priority: High</option>
            <option value="medium">Priority: Medium</option>
            <option value="low">Priority: Low</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as FilterDept)}
            className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer"
          >
            <option value="all">Dept: All</option>
            <option value="Water Supply">Dept: Water Supply</option>
            <option value="Public Transport">Dept: Transport</option>
            <option value="Roads & Transport">Dept: Roads</option>
            <option value="Electrical Operations">Dept: Electrical</option>
            <option value="Sanitation & Waste">Dept: Sanitation</option>
            <option value="Drainage">Dept: Drainage</option>
          </select>

          {/* Ward Filter */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value as FilterWard)}
            className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer"
          >
            <option value="all">Ward: All Wards</option>
            <option value="Ward 14">Ward 14</option>
            <option value="Ward 08">Ward 08</option>
            <option value="Ward 22">Ward 22</option>
            <option value="Ward 12">Ward 12</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="Unassigned">Status: Unassigned</option>
            <option value="Assigned">Status: Assigned</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Department Resolved">Status: Resolved</option>
            <option value="Reopened">Status: Reopened</option>
          </select>

          {/* SLA Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#6B7280]">SLA Violated Only</span>
            <button
              onClick={() => setSlaViolatedOnly(!slaViolatedOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                slaViolatedOnly ? 'bg-[#1E293B]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  slaViolatedOnly ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Geographic Context Map ── */}
      <div ref={mapRef} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Issue Geography — {filteredIssues.length} issues in view
          </span>
          <span className="text-[10px] text-[#9CA3AF] font-mono">Demo Data</span>
        </div>
        <div className="h-48 relative">
          <CivicMap
            viewport={mapViewport}
            issues={mapIssues}
            className="w-full h-full"
            style={{ height: 192 }}
            compact={true}
          />
        </div>
      </div>

      {/* ── Issues Table ── */}
      <div ref={tableRef} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
          <div className="col-span-1">Priority</div>
          <div className="col-span-3">Issue</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1 text-center">Impact</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-1 text-right">SLA</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#F3F4F6]">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors items-center cursor-pointer"
            >
              {/* Priority Score */}
              <div className="col-span-1">
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${getPriorityColor(
                    issue.priority
                  )}`}
                >
                  {issue.priority}
                </span>
              </div>

              {/* Issue Info */}
              <div className="col-span-3 min-w-0">
                <h4 className="text-sm font-semibold text-[#111827] truncate">{issue.title}</h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {issue.issueCode} • {issue.reportedAgo}
                </p>
              </div>

              {/* Location with map dot */}
              <div className="col-span-2 min-w-0 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[issue.category] || '#6B7280' }}
                />
                <p className="text-sm text-[#374151] truncate">
                  {issue.ward}, {issue.locality}
                </p>
              </div>

              {/* Impact */}
              <div className="col-span-1 flex justify-center">
                {getImpactIcon(issue)}
              </div>

              {/* Department */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getDeptBadge(issue.department)}`}>
                  {issue.department}
                </span>
              </div>

              {/* SLA */}
              <div className="col-span-1 text-right">
                <span className={`text-xs ${getSlaColor(issue)}`}>
                  {issue.slaRemaining}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-[#6B7280]">No issues match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueTriage;
