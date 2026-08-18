import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Search,
  AlertTriangle,
  FileText,
  CheckCircle,
  MapPin,
  Clock,
  ChevronDown,
  Eye,
  MessageSquare,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { getCommunityIssues, getCommunityIssue } from '../../services/communityApi';
import type { CommunityIssue, CommunityIssueDetail } from '../../services/communityApi';

interface CommunityIssuesProps {
  onNavigateToAggregation?: () => void;
}

export const CommunityIssues: React.FC<CommunityIssuesProps> = ({ onNavigateToAggregation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [facets, setFacets] = useState<{ categories: { category: string; count: number }[]; statuses: { status: string; count: number }[] }>({ categories: [], statuses: [] });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [sortBy, setSortBy] = useState<'priority' | 'latest' | 'reports'>('priority');
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCommunityIssues({
        search: debouncedSearch || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        severity: selectedSeverity === 'all' ? undefined : selectedSeverity,
        sort: sortBy,
        limit: 50,
      });
      setIssues(result.issues);
      setTotal(result.pagination.total);
      setFacets({ categories: result.facets.categories, statuses: result.facets.statuses });
    } catch (e: any) {
      setError(e?.message || 'Failed to load community issues.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedStatus, selectedSeverity, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.issue-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, [issues]);

  const openIssue = async (issue: CommunityIssue) => {
    setSelectedIssue(issue as CommunityIssueDetail);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const { issue: detail } = await getCommunityIssue(issue.id);
      setSelectedIssue(detail);
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to load issue details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Assigned': return 'bg-yellow-100 text-yellow-700';
      case 'Reopened': return 'bg-red-100 text-red-700';
      case 'Under Review': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Community Issues
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Review and act on aggregated civic issues affecting the community
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search issues by title, description or report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full md:w-44 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="all">All Categories</option>
              {facets.categories.map((cat) => (
                <option key={cat.category} value={cat.category}>{cat.category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none w-full md:w-44 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="all">All Statuses</option>
              {facets.statuses.map((st) => (
                <option key={st.status} value={st.status}>{st.status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="priority">Sort by Priority</option>
              <option value="latest">Sort by Latest</option>
              <option value="reports">Sort by Reports</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
          <span className="text-[11px] font-mono text-[#6B7280]">{total} issue{total !== 1 ? 's' : ''} in scope</span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
          <p className="text-sm font-semibold text-[#111827] mb-1">Unable to load issues</p>
          <p className="text-xs text-[#6B7280] mb-4">{error}</p>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F1E36] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Issues Grid */}
      {!loading && !error && (
        issues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs py-16 text-center">
            <Layers className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#111827] mb-1">
              {total === 0 ? 'No civic issues have been recorded in your community.' : 'No civic issues match your current filters.'}
            </p>
            {total > 0 && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); setSelectedSeverity('all'); }}
                className="mt-2 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="issue-card bg-white rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => openIssue(issue)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#111827]">{issue.title}</h3>
                      <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {issue.location.address || issue.location.ward}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-[#F9FAFB] rounded-lg">
                      <div className="text-xs text-[#6B7280] mb-1">Priority</div>
                      <div className="text-lg font-bold text-[#0F1E36]">{issue.priorityScore}<span className="text-xs font-normal text-[#9CA3AF]">/100</span></div>
                    </div>
                    <div className="p-2 bg-[#F9FAFB] rounded-lg">
                      <div className="text-xs text-[#6B7280] mb-1">Category</div>
                      <div className="text-sm font-bold text-[#0F1E36] truncate">{issue.categoryLabel || issue.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                      <FileText className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span className="font-medium">{issue.reportCount}</span> reports
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="font-medium">{issue.confirmationCount}</span> confirmations
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                      {issue.clusterCode ? `${issue.clusterCode} · ` : ''}
                      <Clock className="w-3 h-3" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Issue Detail Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {selectedIssue.title}
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {selectedIssue.reportNumber}
                    {selectedIssue.clusterCode ? ` · ${selectedIssue.clusterCode}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
                  aria-label="Close issue details"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedIssue.severity)}`}>
                  {selectedIssue.severity}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                  {selectedIssue.status}
                </span>
              </div>
            </div>

            {detailLoading ? (
              <div className="p-10 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#0F1E36] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-[#6B7280]">Loading issue details...</p>
              </div>
            ) : detailError ? (
              <div className="p-10 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-[#4B5563]">{detailError}</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-2">Description</h3>
                  <p className="text-sm text-[#4B5563]">{selectedIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.priorityScore}</div>
                    <div className="text-xs text-[#6B7280]">Priority Score</div>
                  </div>
                  <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="text-2xl font-bold text-[#0F1E36]">
                      {selectedIssue.confidence != null
                        ? `${(selectedIssue.confidence <= 1 ? selectedIssue.confidence * 100 : selectedIssue.confidence).toFixed(0)}%`
                        : '—'}
                    </div>
                    <div className="text-xs text-[#6B7280]">AI Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.reportCount}</div>
                    <div className="text-xs text-[#6B7280]">Reports</div>
                  </div>
                  <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.confirmationCount}</div>
                    <div className="text-xs text-[#6B7280]">Confirmations</div>
                  </div>
                </div>

                {/* Timeline */}
                {selectedIssue.timeline && selectedIssue.timeline.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] mb-3">Timeline</h3>
                    <div className="space-y-2.5">
                      {selectedIssue.timeline.map((t, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-[#111827]">{t.status}</p>
                            <p className="text-[11px] text-[#6B7280]">{t.note} · {t.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related issues */}
                {selectedIssue.relatedIssues && selectedIssue.relatedIssues.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] mb-3">Related Issues</h3>
                    <div className="space-y-2">
                      {selectedIssue.relatedIssues.slice(0, 4).map((rel) => (
                        <div key={rel.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F9FAFB]">
                          <div>
                            <p className="text-xs font-semibold text-[#111827]">{rel.title}</p>
                            <p className="text-[11px] text-[#6B7280]">{rel.reportNumber}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(rel.status)}`}>
                            {rel.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence summary */}
                <div className="flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-xl text-xs text-[#4B5563]">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  {selectedIssue.evidenceSummary.count} evidence items
                  ({selectedIssue.evidenceSummary.images} images, {selectedIssue.evidenceSummary.videos} videos)
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#F3F4F6]">
                  <button
                    type="button"
                    onClick={onNavigateToAggregation}
                    className="flex-1 px-4 py-2.5 bg-[#0F1E36] text-white text-sm font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Add to Aggregation
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(null)}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityIssues;
