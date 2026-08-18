import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Search,
  Users,
  UserCheck,
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { CivicMetricCard } from '../../components/community/CivicMetricCard';
import { getCommunityMembers } from '../../services/communityApi';
import type { CommunityMember } from '../../services/communityApi';

export const CommunityMembers: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [metrics, setMetrics] = useState({ registeredMembers: 0, verifiedResidents: 0, activeContributors: 0, confirmationsThisMonth: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [selectedParticipation, setSelectedParticipation] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCommunityMembers({
        search: debouncedSearch || undefined,
        verification: selectedVerification === 'all' ? undefined : selectedVerification,
        participation: selectedParticipation === 'all' ? undefined : selectedParticipation,
        limit: 50,
      });
      setMembers(result.members);
      setMetrics(result.metrics);
      setTotal(result.pagination.total);
    } catch (e: any) {
      setError(e?.message || 'Failed to load community members.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedVerification, selectedParticipation]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.metric-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 });
      gsap.fromTo('.member-row', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, [members]);

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Unverified': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getParticipationColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Occasional': return 'bg-orange-100 text-orange-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatLastActive = (iso: string | null) => {
    if (!iso) return '—';
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Community Members
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Privacy-aware visibility into community participation
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <CivicMetricCard title="Registered Members" value={metrics.registeredMembers} icon={Users} secondaryLabel="in community" />
        </div>
        <div className="metric-card">
          <CivicMetricCard title="Verified Residents" value={metrics.verifiedResidents} icon={UserCheck} secondaryLabel="identity confirmed" />
        </div>
        <div className="metric-card">
          <CivicMetricCard title="Active Contributors" value={metrics.activeContributors} icon={Shield} secondaryLabel="last 30 days" />
        </div>
        <div className="metric-card">
          <CivicMetricCard title="Confirmations This Month" value={metrics.confirmationsThisMonth} icon={CheckCircle} secondaryLabel="community verifications" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search members by name or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="all">All Verification</option>
              <option value="Verified">Verified</option>
              <option value="Unverified">Unverified</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedParticipation}
              onChange={(e) => setSelectedParticipation(e.target.value)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="all">All Participation</option>
              <option value="Active">Active</option>
              <option value="Occasional">Occasional</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700">{error}</span>
          </div>
          <button type="button" onClick={load} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="p-4 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-[#E5E7EB]/60 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            <div className="col-span-4">Resident</div>
            <div className="col-span-2">Locality</div>
            <div className="col-span-2">Verification</div>
            <div className="col-span-2">Participation</div>
            <div className="col-span-2">Last Active</div>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {members.map((member) => (
              <div key={member.id} className="member-row grid grid-cols-12 gap-4 p-4 hover:bg-[#F9FAFB] transition-colors items-center">
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                      {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111827] truncate">{member.name}</div>
                      <div className="text-xs text-[#6B7280]">
                        {member.reportsCount} reports · {member.confirmationsCount} confirmations
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-sm text-[#4B5563]">
                    <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="truncate">{member.locality || member.ward || '—'}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getVerificationColor(member.verificationStatus)}`}>
                    {member.verificationStatus}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getParticipationColor(member.participationStatus)}`}>
                    {member.participationStatus}
                  </span>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                    <Clock className="w-3 h-3" />
                    {formatLastActive(member.lastActive)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-[#111827] mb-2">
                {total === 0 ? 'No community members found.' : 'No members match your filters.'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {total === 0 ? 'Members appear here when residents join your community.' : 'Try adjusting your search or filter criteria'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#2563EB] mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">Privacy Protection</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Member data is limited to residents in your authorized community. Contact details, exact addresses, and
              sensitive personal information are not displayed. This view provides enough information for civic
              coordination without compromising individual privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMembers;
