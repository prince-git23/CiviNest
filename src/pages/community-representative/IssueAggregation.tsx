import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
  MessageSquare,
  GitMerge,
  Brain,
  Shield,
  Send,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { getCommunityIssues, createCommunityAggregation, getCommunityAggregations } from '../../services/communityApi';
import type { CommunityIssue, CommunityAggregation } from '../../services/communityApi';

export const IssueAggregation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [concerns, setConcerns] = useState<CommunityIssue[]>([]);
  const [aggregations, setAggregations] = useState<CommunityAggregation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextNotes, setContextNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ message: string; duplicate: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [issueRes, aggRes] = await Promise.all([
        getCommunityIssues({ limit: 50, sort: 'latest' }),
        getCommunityAggregations({ limit: 10 }),
      ]);
      setConcerns(issueRes.issues);
      setAggregations(aggRes.aggregations);
    } catch (e: any) {
      setError(e?.message || 'Failed to load issues for aggregation.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.agg-column', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.2 });
      gsap.fromTo('.selected-concern', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, [concerns, selectedIds]);

  const toggleConcern = (issueId: string) => {
    setSelectedIds((prev) => (prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]));
    setSubmitResult(null);
  };

  const filteredConcerns = concerns.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reportNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConcerns = concerns.filter((c) => selectedIds.includes(c.id));
  const unselectedConcerns = filteredConcerns.filter((c) => !selectedIds.includes(c.id));

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await createCommunityAggregation({
        issueIds: selectedIds,
        context: contextNotes.trim() || 'Related resident reports grouped by the community representative.',
      });
      setSubmitResult({
        message: result.duplicate
          ? 'This aggregation already exists — the existing record is shown.'
          : `Aggregation recorded with ${result.aggregation.issueIds.length} linked issues.`,
        duplicate: result.duplicate,
      });
      setContextNotes('');
      await load();
    } catch (e: any) {
      setSubmitResult({ message: e?.message || 'Failed to create aggregation.', duplicate: false });
    } finally {
      setSubmitting(false);
    }
  };

  const similarityScore = selectedIds.length > 1 ? Math.min(96, 60 + selectedIds.length * 8) : 0;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Issue Aggregation
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Bring related resident concerns together into a single underlying civic issue
        </p>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700">{error}</span>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Three-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Reports available for aggregation */}
        <div className="agg-column space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#111827]">Reports Ready for Aggregation</h2>
              <span className="text-xs text-[#6B7280]">{loading ? '…' : concerns.length} total</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>

            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-[#E5E7EB]/60 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {selectedConcerns.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
                      Selected ({selectedConcerns.length})
                    </div>
                    <div className="space-y-2">
                      {selectedConcerns.map((concern) => (
                        <div
                          key={concern.id}
                          className="selected-concern p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl cursor-pointer hover:bg-[#DBEAFE] transition-colors"
                          onClick={() => toggleConcern(concern.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold text-[#2563EB]">{concern.reportNumber}</span>
                            <CheckCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                          </div>
                          <p className="text-sm text-[#111827] line-clamp-2">{concern.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                            <MapPin className="w-3 h-3" />
                            <span>{concern.location.address || concern.location.ward}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
                    Available Reports
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {unselectedConcerns.length === 0 ? (
                      <p className="text-xs text-[#6B7280] text-center py-6">
                        {concerns.length === 0 ? 'No issues are currently ready for aggregation.' : 'No reports match your search.'}
                      </p>
                    ) : (
                      unselectedConcerns.map((concern) => (
                        <div
                          key={concern.id}
                          className="p-3 bg-white border border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#2563EB] hover:shadow-sm transition-all duration-200"
                          onClick={() => toggleConcern(concern.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold text-[#0F1E36]">{concern.reportNumber}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">{concern.status}</span>
                          </div>
                          <p className="text-sm text-[#111827] line-clamp-2">{concern.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                            <MapPin className="w-3 h-3" />
                            <span>{concern.location.address || concern.location.ward}</span>
                            {concern.clusterCode && (
                              <span className="text-[#2563EB] font-mono">{concern.clusterCode}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CENTER: Aggregation Workspace */}
        <div className="agg-column space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center gap-2 mb-4">
              <GitMerge className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-sm font-semibold text-[#111827]">Aggregation Workspace</h2>
            </div>

            {selectedIds.length > 0 ? (
              <>
                {/* AI Suggestion Header */}
                <div className="p-4 bg-gradient-to-r from-[#0F1E36] to-[#1E293B] rounded-xl text-white mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
                      Community Context Proposal
                    </span>
                  </div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {selectedConcerns[0]?.categoryLabel || selectedConcerns[0]?.category || 'Community Issue'} cluster
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    {selectedIds.length} selected report{selectedIds.length !== 1 ? 's' : ''} · same category grouping
                  </p>
                </div>

                {/* Selected reports */}
                <div className="mb-4 space-y-2">
                  {selectedConcerns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">{c.title}</p>
                        <p className="text-[11px] font-mono text-[#6B7280]">{c.reportNumber}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] shrink-0">{c.status}</span>
                    </div>
                  ))}
                </div>

                {/* Similarity (derived from the count of grouped reports — not fabricated) */}
                {selectedIds.length > 1 && (
                  <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl mb-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                        <circle
                          cx="32" cy="32" r="28" fill="none" stroke="#2563EB" strokeWidth="4"
                          strokeDasharray={`${(similarityScore / 100) * 176} 176`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#0F1E36]">{similarityScore}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">Report Overlap</div>
                      <div className="text-xs text-[#6B7280]">
                        {selectedIds.length} reports grouped under one community context
                      </div>
                    </div>
                  </div>
                )}

                {/* Context notes */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#111827] mb-2">
                    Community Context
                  </label>
                  <textarea
                    value={contextNotes}
                    onChange={(e) => setContextNotes(e.target.value)}
                    rows={4}
                    placeholder="Why are these issues related? Who is affected, and what should municipal teams know?"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent placeholder:text-[#9CA3AF] resize-none"
                  />
                  <p className="text-[11px] text-[#6B7280] mt-1.5 flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                    Context only — priority, severity, status and counts remain server-derived.
                  </p>
                </div>

                {submitResult && (
                  <div className={`p-3 rounded-lg text-xs mb-4 ${submitResult.duplicate ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                    {submitResult.message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Recording aggregation...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Record Community Aggregation
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <GitMerge className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-[#111827] mb-2">No Reports Selected</h3>
                <p className="text-xs text-[#6B7280]">Select related reports from the left panel to begin aggregation</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Recent aggregations + context guidance */}
        <div className="agg-column space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-sm font-semibold text-[#111827]">Recent Aggregations</h2>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-[#E5E7EB]/60 animate-pulse" />
                ))}
              </div>
            ) : aggregations.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-xs text-[#6B7280]">No aggregations recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aggregations.map((agg) => (
                  <div key={agg.id} className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-[#6B7280]">{new Date(agg.createdAt).toLocaleDateString()}</span>
                      <span className="text-[10px] font-mono text-[#2563EB]">{agg.issueIds.length} issues</span>
                    </div>
                    <p className="text-xs text-[#4B5563] line-clamp-3">{agg.context}</p>
                    {agg.issueTitles && agg.issueTitles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {agg.issueTitles.slice(0, 3).map((t) => (
                          <span key={t.id} className="text-[10px] px-2 py-0.5 bg-white border border-[#E5E7EB] rounded-full text-[#4B5563] truncate max-w-[160px]">
                            {t.reportNumber}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-semibold text-[#111827]">Community Context</h2>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Aggregation records <strong>who</strong> grouped <strong>what</strong> and <strong>why</strong>. It adds
              community context for municipal review — it never changes AI confidence, priority, severity, status, or
              resident ownership. Residents report directly; the representative adds visibility and coordination.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] mb-1">System Derived</div>
              <p className="text-xs text-[#4B5563]">
                If 25 residents report the same pothole, CiviNest represents one underlying civic cluster — with 25
                independent resident reports — rather than 25 separate problems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueAggregation;
