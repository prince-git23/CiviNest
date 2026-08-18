import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Download,
  Sparkles,
  Filter,
  X,
  Eye,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import {
  getMunicipalIssues,
  getMunicipalIssue,
  getMunicipalDepartments,
  getMunicipalTeams,
  assignMunicipalIssue,
  startMunicipalWork,
  completeMunicipalWork,
  submitMunicipalResolution,
  reopenMunicipalIssue,
  type MunicipalIssue,
  type MunicipalIssueDetail,
  type MunicipalDepartment,
  type FieldTeam,
} from '../../services/municipalApi';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport, CivicIssue } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';

type FilterPriority = 'all' | 'critical' | 'high' | 'medium' | 'low';

const formatTs = (v?: string | null) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString();
};

export const IssueTriage: React.FC = () => {
  const [issues, setIssues] = useState<MunicipalIssue[]>([]);
  const [departments, setDepartments] = useState<MunicipalDepartment[]>([]);
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [slaViolatedOnly, setSlaViolatedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedIssue, setSelectedIssue] = useState<MunicipalIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);

  // Assignment form state
  const [assignDept, setAssignDept] = useState('');
  const [assignTeam, setAssignTeam] = useState('');
  const [assignPriority, setAssignPriority] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [mapViewport] = useState<MapViewport>({ ...DEFAULT_VIEWPORT, zoom: 12 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [issueRes, deptRes, teamRes] = await Promise.all([
        getMunicipalIssues({ limit: 100, sort: 'priority' }),
        getMunicipalDepartments(),
        getMunicipalTeams(),
      ]);
      setIssues(issueRes.issues);
      setDepartments(deptRes);
      setTeams(teamRes);
    } catch (e: any) {
      setError(e?.message || 'Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setActionMessage(null);
    setShowAssignment(false);
    try {
      const detail = await getMunicipalIssue(id);
      setSelectedIssue(detail);
    } catch (e: any) {
      setActionMessage(e?.message || 'Failed to load issue details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const mapIssues: CivicIssue[] = issues.map((i) => ({
    id: i.id,
    title: i.title,
    category: (i.category || 'infrastructure') as CivicIssue['category'],
    latitude: i.location.latitude,
    longitude: i.location.longitude,
    ward: i.location.ward,
    locality: i.location.locality,
    priority: i.priorityScore,
    confidence: 0,
    reportCount: i.reportCount,
    confirmationCount: i.confirmationCount,
    status: (i.status.toLowerCase().replace(/\s+/g, '-')) as CivicIssue['status'],
    department: i.department,
  }));

  const filteredIssues = issues.filter((issue) => {
    if (priorityFilter !== 'all') {
      if (priorityFilter === 'critical' && issue.priorityScore < 90) return false;
      if (priorityFilter === 'high' && (issue.priorityScore < 75 || issue.priorityScore >= 90)) return false;
      if (priorityFilter === 'medium' && (issue.priorityScore < 50 || issue.priorityScore >= 75)) return false;
      if (priorityFilter === 'low' && issue.priorityScore >= 50) return false;
    }
    if (deptFilter !== 'all' && issue.department !== deptFilter) return false;
    if (wardFilter !== 'all' && issue.location.ward !== wardFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (slaViolatedOnly && !issue.sla.breached && !issue.sla.atRisk) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.reportNumber.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.location.ward.toLowerCase().includes(q) ||
        issue.location.locality.toLowerCase().includes(q)
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
    if (issue.priorityScore >= 90) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (issue.priorityScore >= 75) return <span className="text-orange-500 font-bold text-sm">!</span>;
    return <span className="text-[#9CA3AF]">—</span>;
  };

  const getDeptBadge = (dept: string) => {
    const colors: Record<string, string> = {
      'Water Supply': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Roads & Transport': 'bg-slate-100 text-slate-700 border border-slate-200',
      'Electrical Operations': 'bg-amber-50 text-amber-700 border border-amber-200',
      'Sanitation & Waste': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      Drainage: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      'Street Lighting': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'Parks & Recreation': 'bg-green-50 text-green-700 border border-green-200',
    };
    return colors[dept] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getSlaColor = (issue: MunicipalIssue) => {
    if (issue.sla.breached) return 'text-red-600 font-semibold';
    if (issue.sla.atRisk) return 'text-orange-600 font-semibold';
    return 'text-[#6B7280]';
  };

  const runAction = async (action: string, fn: () => Promise<any>, success: string) => {
    setActionBusy(action);
    setActionMessage(null);
    try {
      await fn();
      setActionMessage(success);
      if (selectedIssue) {
        const fresh = await getMunicipalIssue(selectedIssue.id);
        setSelectedIssue(fresh);
      }
      await load();
    } catch (e: any) {
      setActionMessage(e?.message || 'Action failed.');
    } finally {
      setActionBusy(null);
    }
  };

  const doAssign = async () => {
    if (!selectedIssue) return;
    setActionBusy('assign');
    setActionMessage(null);
    try {
      await assignMunicipalIssue(selectedIssue.id, {
        departmentId: assignDept || undefined,
        teamId: assignTeam || undefined,
        priorityOverride: assignPriority || undefined,
        reason: assignReason || undefined,
        notes: assignNotes || undefined,
      });
      setShowAssignment(false);
      setActionMessage('Issue assigned successfully.');
      const fresh = await getMunicipalIssue(selectedIssue.id);
      setSelectedIssue(fresh);
      await load();
    } catch (e: any) {
      setActionMessage(e?.message || 'Assignment failed.');
    } finally {
      setActionBusy(null);
    }
  };

  const wards = [...new Set(issues.map((i) => i.location.ward).filter(Boolean))];
  const deptOptions = [...new Set(issues.map((i) => i.department).filter(Boolean))];

  const [filteredMapIssues] = useState(mapIssues);

  // GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -15, opacity: 0, duration: 0.4, ease: 'power2.out' });
      gsap.from(filtersRef.current, { y: 10, opacity: 0, duration: 0.3, delay: 0.1, ease: 'power2.out' });
      if (tableRef.current) gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, [loading]);

  const statusIs = (s: string) => selectedIssue?.status === s;

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
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              if (filteredIssues.length) openDetail(filteredIssues[0].id);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Review Top Issue
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

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, report ID, ward..."
            className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] w-56"
          />

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)} className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer">
            <option value="all">Priority: All</option>
            <option value="critical">Priority: Critical</option>
            <option value="high">Priority: High</option>
            <option value="medium">Priority: Medium</option>
            <option value="low">Priority: Low</option>
          </select>

          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer">
            <option value="all">Dept: All</option>
            {deptOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer">
            <option value="all">Ward: All Wards</option>
            {wards.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 text-sm bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none focus:border-[#94A3B8] cursor-pointer">
            <option value="all">Status: All</option>
            <option value="Under Review">Status: Under Review</option>
            <option value="Assigned">Status: Assigned</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Verification">Status: Verification</option>
            <option value="Resolved">Status: Resolved</option>
            <option value="Reopened">Status: Reopened</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#6B7280]">SLA At Risk / Breached Only</span>
            <button
              onClick={() => setSlaViolatedOnly(!slaViolatedOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${slaViolatedOnly ? 'bg-[#1E293B]' : 'bg-[#D1D5DB]'}`}
              aria-label="Toggle SLA filter"
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${slaViolatedOnly ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Geographic Context Map ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Issue Geography — {filteredIssues.length} issues in view
          </span>
          <span className="text-[10px] text-[#9CA3AF] font-mono">Live backend data</span>
        </div>
        <div className="h-48 relative">
          <CivicMap
            viewport={mapViewport}
            issues={filteredMapIssues.filter((m) => filteredIssues.some((f) => f.id === m.id))}
            className="w-full h-full"
            style={{ height: 192 }}
            compact={true}
          />
        </div>
      </div>

      {/* ── Issues Table ── */}
      <div ref={tableRef} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
          <div className="col-span-1">Priority</div>
          <div className="col-span-3">Issue</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1 text-center">Impact</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-1 text-right">SLA</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors items-center cursor-pointer"
              onClick={() => openDetail(issue.id)}
            >
              <div className="col-span-1">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${getPriorityColor(issue.priorityScore)}`}>
                  {issue.priorityScore}
                </span>
              </div>
              <div className="col-span-3 min-w-0">
                <h4 className="text-sm font-semibold text-[#111827] truncate">{issue.title}</h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {issue.reportNumber} • {issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : ''}
                  {issue.clusterCode ? ` • ${issue.clusterCode}` : ''}
                </p>
              </div>
              <div className="col-span-2 min-w-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#6B7280]" />
                <p className="text-sm text-[#374151] truncate">
                  {issue.location.ward}, {issue.location.locality}
                </p>
              </div>
              <div className="col-span-1 flex justify-center">{getImpactIcon(issue)}</div>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getDeptBadge(issue.department)}`}>
                  {issue.department || 'Unassigned'}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <span className={`text-xs ${getSlaColor(issue)}`}>
                  {issue.sla.breached ? 'Breached' : issue.sla.atRisk ? 'At Risk' : issue.sla.remainingHours.toFixed(0) + 'h'}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openDetail(issue.id); }}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                  aria-label="View issue"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="p-12 text-center text-sm text-[#6B7280]">Loading issues...</div>}
        {!loading && error && <div className="p-12 text-center text-sm text-red-600">{error}</div>}
        {!loading && !error && filteredIssues.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-[#6B7280]">No issues match the current filters.</p>
          </div>
        )}
      </div>

      {/* ── Issue Detail Drawer ── */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-[11px] font-mono text-[#9CA3AF]">
                  {selectedIssue.reportNumber}
                  {selectedIssue.clusterCode ? ` · ${selectedIssue.clusterCode}` : ''}
                </p>
                <h2 className="text-lg font-bold text-[#111827]">{selectedIssue.title}</h2>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                aria-label="Close issue details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {actionMessage && (
                <div className={`p-3 rounded-lg text-xs ${actionMessage.startsWith('Failed') || actionMessage.includes('failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {actionMessage}
                </div>
              )}
              {detailLoading && <p className="text-xs text-[#6B7280]">Loading issue details...</p>}

              {/* Status + priority */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Status</p>
                  <p className="text-lg font-bold text-[#111827]">{selectedIssue.status}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Priority</p>
                  <p className="text-lg font-bold text-[#111827]">{selectedIssue.priorityScore}/100</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Reports</p>
                  <p className="text-lg font-bold text-[#111827]">{selectedIssue.reportCount}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Confirmations</p>
                  <p className="text-lg font-bold text-[#111827]">{selectedIssue.confirmationCount}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-[#374151] leading-relaxed">{selectedIssue.description}</p>
              </div>

              {/* AI analysis */}
              {selectedIssue.analysis && (
                <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#6B7280]" />
                    <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">AI Analysis</h3>
                  </div>
                  <p className="text-xs text-[#4B5563]">
                    Category: <strong>{selectedIssue.analysis.categoryLabel || selectedIssue.analysis.category}</strong> · Severity:{' '}
                    <strong>{selectedIssue.analysis.severity}</strong> · Confidence:{' '}
                    <strong>{selectedIssue.analysis.confidence != null ? `${(selectedIssue.analysis.confidence <= 1 ? selectedIssue.analysis.confidence * 100 : selectedIssue.analysis.confidence).toFixed(0)}%` : '—'}</strong>
                    {selectedIssue.analysis.suggestedDepartment && <> · Suggested dept: <strong>{selectedIssue.analysis.suggestedDepartment}</strong></>}
                  </p>
                  {selectedIssue.analysis.keywords?.length > 0 && (
                    <p className="text-[11px] text-[#9CA3AF] mt-2">
                      Keywords: {selectedIssue.analysis.keywords.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                <p className="text-sm text-[#374151]">
                  {selectedIssue.location.address || '—'}
                  <span className="text-[#9CA3AF]"> · {selectedIssue.location.ward}{selectedIssue.location.city ? ', ' + selectedIssue.location.city : ''}</span>
                </p>
              </div>

              {/* Assignment state */}
              <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Assignment</h3>
                </div>
                <p className="text-sm text-[#374151]">
                  Department: <strong>{selectedIssue.municipal?.department || 'Unassigned'}</strong>
                  {selectedIssue.municipal?.team && <> · Team: <strong>{selectedIssue.municipal.team}</strong></>}
                  {selectedIssue.municipal?.assignedAt && (
                    <span className="text-xs text-[#9CA3AF] block mt-1">Assigned {new Date(selectedIssue.municipal.assignedAt).toLocaleString()}</span>
                  )}
                </p>
                {selectedIssue.municipal?.priorityOverrides?.length > 0 && (
                  <p className="text-[11px] text-[#9CA3AF] mt-2">
                    Priority override: {selectedIssue.municipal.priorityOverrides[0].previous} →{' '}
                    {selectedIssue.municipal.priorityOverrides[0].new} by {selectedIssue.municipal.priorityOverrides[0].officer}
                  </p>
                )}
                {selectedIssue.municipal?.notes?.length > 0 && (
                  <p className="text-[11px] text-[#9CA3AF] mt-2">Notes: {selectedIssue.municipal.notes[0].text}</p>
                )}
              </div>

              {/* Workflow actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAssignment(!showAssignment)}
                  className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors"
                >
                  {selectedIssue.municipal?.department ? 'Update Assignment' : 'Assign Department & Team'}
                </button>
                {statusIs('Assigned') || statusIs('Under Review') || statusIs('Reopened') ? (
                  <button
                    disabled={actionBusy !== null}
                    onClick={() => runAction('start', () => startMunicipalWork(selectedIssue.id), 'Work started.')}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actionBusy === 'start' ? 'Starting...' : 'Start Work'}
                  </button>
                ) : null}
                {statusIs('In Progress') ? (
                  <>
                    <button
                      disabled={actionBusy !== null}
                      onClick={() => runAction('complete', () => completeMunicipalWork(selectedIssue.id), 'Work completed. Submit resolution to begin verification.')}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionBusy === 'complete' ? 'Completing...' : 'Complete Work'}
                    </button>
                    <button
                      disabled={actionBusy !== null}
                      onClick={async () => {
                        const desc = window.prompt('Resolution description (what was done?):');
                        if (!desc) return;
                        await runAction('resolve', () => submitMunicipalResolution(selectedIssue.id, { description: desc }), 'Resolution submitted for resident verification.');
                      }}
                      className="px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-lg hover:bg-[#115E59] transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 inline mr-1" />
                      Submit Resolution
                    </button>
                  </>
                ) : null}
                {statusIs('Resolved') || statusIs('Verification') ? (
                  <button
                    disabled={actionBusy !== null}
                    onClick={async () => {
                      const reason = window.prompt('Reason for reopening:');
                      if (reason === null) return;
                      await runAction('reopen', () => reopenMunicipalIssue(selectedIssue.id, reason || ''), 'Issue reopened.');
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionBusy === 'reopen' ? 'Reopening...' : 'Reopen Issue'}
                  </button>
                ) : null}
              </div>

              {/* Assignment form */}
              {showAssignment && (
                <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB] space-y-3">
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Assign Issue</h3>
                  <select value={assignDept} onChange={(e) => { setAssignDept(e.target.value); setAssignTeam(''); }} className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#374151] outline-none">
                    <option value="">Select department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select value={assignTeam} onChange={(e) => setAssignTeam(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#374151] outline-none">
                    <option value="">Select team...</option>
                    {teams
                      .filter((t) => !assignDept || t.departmentId === assignDept)
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.ward})</option>
                      ))}
                  </select>
                  <select value={assignPriority} onChange={(e) => setAssignPriority(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#374151] outline-none">
                    <option value="">Priority override (optional)</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    type="text"
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="Reason (required for priority override)"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#374151] outline-none"
                  />
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Internal notes"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#374151] outline-none"
                  />
                  <button
                    disabled={actionBusy !== null || (!assignDept && !assignTeam && !assignPriority)}
                    onClick={doAssign}
                    className="w-full px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors disabled:opacity-50"
                  >
                    {actionBusy === 'assign' ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Timeline</h3>
                <div className="space-y-3">
                  {(selectedIssue.timeline || []).slice().reverse().map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-[#1E293B] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{t.status}</p>
                        <p className="text-xs text-[#6B7280]">{t.note}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                          {formatTs(t.timestamp)} · {t.actor || 'System'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(selectedIssue.timeline || []).length === 0 && (
                    <p className="text-xs text-[#9CA3AF]">No timeline events yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTriage;
