import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  X,
  ChevronDown,
  RefreshCw,
  Droplet,
  Car,
  Lightbulb,
  Trash2,
  Shield,
  TreePine,
  Users,
  Loader2,
} from 'lucide-react';
import {
  getResidentDiscussions,
  type DiscussionData,
  type DiscussionFacetsData,
} from '../services/api';
import {
  DISCUSSION_CATEGORIES,
  DISCUSSION_STATUSES,
  discussionCategoryLabel,
  facetCount,
  formatRelativeTime,
  initialsOf,
} from '../services/discussionsService';

interface DiscussionsPageProps {
  userContext?: {
    name: string;
    city: string;
    ward: string;
    community: string;
  };
  onNavigateToIssue?: (issueId: string) => void;
  onOpenReportModal?: () => void;
}

const getCategoryIcon = (categoryId: string) => {
  const icons: Record<string, React.ReactNode> = {
    all: <MessageSquare className="w-4 h-4" />,
    water_supply: <Droplet className="w-4 h-4" />,
    roads: <Car className="w-4 h-4" />,
    street_lighting: <Lightbulb className="w-4 h-4" />,
    sanitation: <Trash2 className="w-4 h-4" />,
    public_safety: <Shield className="w-4 h-4" />,
    environment: <TreePine className="w-4 h-4" />,
    community: <Users className="w-4 h-4" />,
  };
  return icons[categoryId] || <MessageSquare className="w-4 h-4" />;
};

const getStatusPill = (status: DiscussionData['status']) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

interface FilterState {
  search: string;
  status: string;
  ward: string;
  category: string;
  sort: 'latest' | 'supported';
}

const EMPTY_FILTERS: FilterState = { search: '', status: 'all', ward: 'all', category: 'all', sort: 'latest' };

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({
  userContext,
  onNavigateToIssue,
}) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
  const [facets, setFacets] = useState<DiscussionFacetsData | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search box so typing doesn't spam the backend.
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search.trim()), 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [filters.search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResidentDiscussions({
        search: debouncedSearch || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        ward: filters.ward !== 'all' ? filters.ward : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        sort: filters.sort,
        limit: 30,
      });
      setDiscussions(data.discussions);
      setFacets(data.facets);
      setTotal(data.pagination.total);
    } catch {
      setDiscussions([]);
      setFacets(null);
      setError('Unable to load discussions.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.ward, filters.category, filters.sort]);

  useEffect(() => {
    load();
  }, [load]);

  const hasActiveFilters =
    debouncedSearch !== '' ||
    filters.status !== 'all' ||
    filters.ward !== 'all' ||
    filters.category !== 'all';

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setDebouncedSearch('');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Community Voice</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight font-serif">
                Community Discussions
              </h1>
              <p className="text-xs text-[#6B7280] mt-1 max-w-xl">
                Discuss local civic issues with your neighbours, share context, and support ideas worth acting on.
              </p>
            </div>
            <button
              onClick={() => navigate('/resident/community/new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Start Discussion</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search discussions, issues, or #IDs..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as FilterState['sort'] }))}
                className="px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827] cursor-pointer"
              >
                <option value="latest">Latest activity</option>
                <option value="supported">Most supported</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827] cursor-pointer"
              >
                {DISCUSSION_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <select
                value={filters.ward}
                onChange={(e) => setFilters((f) => ({ ...f, ward: e.target.value }))}
                className="px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827] cursor-pointer"
              >
                <option value="all">All Wards</option>
                {(facets?.wards || []).filter((w) => w.name).map((w) => (
                  <option key={w.name} value={w.name}>{w.name} ({w.count})</option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Category pills — live counts from backend facets */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F3F4F6]">
            {DISCUSSION_CATEGORIES.map((category) => {
              const count = facetCount(facets, category.id);
              const selected = filters.category === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setFilters((f) => ({ ...f, category: f.category === category.id ? 'all' : category.id }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#0F1E36] text-white'
                      : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  <span>{category.label}</span>
                  <span className={`text-[10px] font-mono ${selected ? 'text-white/70' : 'text-[#9CA3AF]'}`}>
                    {loading ? '…' : `(${count})`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Results ── */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-pulse">
                <div className="h-3 w-24 bg-[#F3F4F6] rounded-full mb-3" />
                <div className="h-4 w-2/3 bg-[#F3F4F6] rounded-full mb-2" />
                <div className="h-3 w-full bg-[#F9FAFB] rounded-full mb-1" />
                <div className="h-3 w-1/2 bg-[#F9FAFB] rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0F1E36]">{error}</h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Check your connection and try again.
            </p>
            <button
              onClick={load}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : discussions.length === 0 ? (
          hasActiveFilters ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
              <MessageSquare className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-sm font-bold text-[#0F1E36]">No discussions match your filters</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Try a different search term or clear the filters to see everything.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
              <MessageSquare className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-sm font-bold text-[#0F1E36]">No discussions yet</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Be the first to start a community conversation about your neighbourhood.
              </p>
              <button
                onClick={() => navigate('/resident/community/new')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Start a Discussion
              </button>
            </div>
          )
        ) : (
          <>
            <p className="text-[11px] text-[#6B7280] mb-3 px-1">
              {total} discussion{total === 1 ? '' : 's'}
              {debouncedSearch && <> matching “{debouncedSearch}”</>}
            </p>
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  onClick={() => navigate(`/resident/community/${discussion.id}`)}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusPill(discussion.status)}`}>
                          {discussion.status === 'CLOSED' ? 'CLOSED' : discussion.status === 'ACTIVE' ? 'ACTIVE' : 'OPEN'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] text-[#4B5563]">
                          {discussion.categoryLabel}
                        </span>
                        {(discussion.location.ward || discussion.location.locality) && (
                          <span className="text-xs text-[#6B7280] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {discussion.location.locality || discussion.location.ward}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#0F1E36] group-hover:text-blue-600 transition-colors mb-1">
                        {discussion.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">
                        {discussion.preview || discussion.body}
                      </p>

                      {discussion.issueId && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 mb-3">
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            #{discussion.issueId.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-blue-700 truncate max-w-[200px]">
                            {discussion.issueTitle || 'Linked civic issue'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToIssue?.(discussion.issueId!);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="View linked issue"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-[9px] font-bold">
                            {initialsOf(discussion.author.displayName)}
                          </span>
                          <span className="font-medium text-[#374151]">{discussion.author.displayName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {discussion.replyCount} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {discussion.confirmationCount} support
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(discussion.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <ChevronDown className="w-5 h-5 text-[#9CA3AF] group-hover:text-blue-600 transition-colors shrink-0 rotate-[-90deg]" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscussionsPage;
