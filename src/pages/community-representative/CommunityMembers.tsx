import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  MessageSquare,
  Eye,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { CivicMetricCard } from '../../components/community/CivicMetricCard';

interface CommunityMember {
  id: string;
  identity: string; // Privacy-safe identity like "Resident #A184"
  verificationStatus: 'Verified' | 'Pending' | 'Unverified';
  sector: string;
  participationStatus: 'Active' | 'Occasional' | 'Inactive';
  recentParticipation: string;
  confirmationsCount: number;
  reportsCount: number;
  lastActive: string;
}

const mockMembers: CommunityMember[] = [
  {
    id: 'member-1',
    identity: 'Resident #A184',
    verificationStatus: 'Verified',
    sector: 'Sector 14',
    participationStatus: 'Active',
    recentParticipation: 'Confirmed 3 issues this week',
    confirmationsCount: 24,
    reportsCount: 8,
    lastActive: '2 hours ago',
  },
  {
    id: 'member-2',
    identity: 'Resident #B207',
    verificationStatus: 'Verified',
    sector: 'Sector 14',
    participationStatus: 'Active',
    recentParticipation: 'Submitted 2 reports',
    confirmationsCount: 18,
    reportsCount: 5,
    lastActive: '5 hours ago',
  },
  {
    id: 'member-3',
    identity: 'Resident #C312',
    verificationStatus: 'Verified',
    sector: 'Sector 12',
    participationStatus: 'Occasional',
    recentParticipation: 'Confirmed 1 issue last week',
    confirmationsCount: 12,
    reportsCount: 3,
    lastActive: '2 days ago',
  },
  {
    id: 'member-4',
    identity: 'Resident #D419',
    verificationStatus: 'Pending',
    sector: 'Sector 14',
    participationStatus: 'Active',
    recentParticipation: 'Submitted 4 reports',
    confirmationsCount: 15,
    reportsCount: 4,
    lastActive: '1 day ago',
  },
  {
    id: 'member-5',
    identity: 'Resident #E523',
    verificationStatus: 'Verified',
    sector: 'Sector 16',
    participationStatus: 'Inactive',
    recentParticipation: 'No recent activity',
    confirmationsCount: 6,
    reportsCount: 2,
    lastActive: '2 weeks ago',
  },
  {
    id: 'member-6',
    identity: 'Resident #F631',
    verificationStatus: 'Unverified',
    sector: 'Sector 14',
    participationStatus: 'Occasional',
    recentParticipation: 'Confirmed 2 issues',
    confirmationsCount: 8,
    reportsCount: 1,
    lastActive: '4 days ago',
  },
];

const mockMetrics = {
  registeredMembers: 428,
  verifiedResidents: 391,
  activeContributors: 74,
  confirmationsThisMonth: 126,
};

export const CommunityMembers: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [selectedParticipation, setSelectedParticipation] = useState<string>('all');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for metric cards
      gsap.fromTo(
        '.metric-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );

      // Staggered entrance for member rows
      gsap.fromTo(
        '.member-row',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch = member.identity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'all' || member.sector === selectedSector;
    const matchesVerification = selectedVerification === 'all' || member.verificationStatus === selectedVerification;
    const matchesParticipation = selectedParticipation === 'all' || member.participationStatus === selectedParticipation;
    return matchesSearch && matchesSector && matchesVerification && matchesParticipation;
  });

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

  const sectors = ['all', 'Sector 12', 'Sector 14', 'Sector 16'];
  const verificationStatuses = ['all', 'Verified', 'Pending', 'Unverified'];
  const participationStatuses = ['all', 'Active', 'Occasional', 'Inactive'];

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
          <CivicMetricCard
            title="Registered Members"
            value={mockMetrics.registeredMembers}
            icon={Users}
            secondaryLabel="in community"
          />
        </div>
        <div className="metric-card">
          <CivicMetricCard
            title="Verified Residents"
            value={mockMetrics.verifiedResidents}
            icon={UserCheck}
            secondaryLabel="identity confirmed"
          />
        </div>
        <div className="metric-card">
          <CivicMetricCard
            title="Active Contributors"
            value={mockMetrics.activeContributors}
            icon={Shield}
            secondaryLabel="this month"
          />
        </div>
        <div className="metric-card">
          <CivicMetricCard
            title="Confirmations This Month"
            value={mockMetrics.confirmationsThisMonth}
            icon={CheckCircle}
            secondaryLabel="community verifications"
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search members by identity or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          {/* Sector Filter */}
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector === 'all' ? 'All Sectors' : sector}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          {/* Verification Filter */}
          <div className="relative">
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              {verificationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Verification' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          {/* Participation Filter */}
          <div className="relative">
            <select
              value={selectedParticipation}
              onChange={(e) => setSelectedParticipation(e.target.value)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              {participationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Participation' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          <div className="col-span-3">Resident</div>
          <div className="col-span-2">Sector</div>
          <div className="col-span-2">Verification</div>
          <div className="col-span-2">Participation</div>
          <div className="col-span-2">Recent Activity</div>
          <div className="col-span-1">Last Active</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#F3F4F6]">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="member-row grid grid-cols-12 gap-4 p-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer items-center"
            >
              {/* Resident Identity */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111827]">{member.identity}</div>
                    <div className="text-xs text-[#6B7280]">
                      {member.reportsCount} reports · {member.confirmationsCount} confirmations
                    </div>
                  </div>
                </div>
              </div>

              {/* Sector */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5 text-sm text-[#4B5563]">
                  <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                  {member.sector}
                </div>
              </div>

              {/* Verification Status */}
              <div className="col-span-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getVerificationColor(member.verificationStatus)}`}>
                  {member.verificationStatus}
                </span>
              </div>

              {/* Participation Status */}
              <div className="col-span-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getParticipationColor(member.participationStatus)}`}>
                  {member.participationStatus}
                </span>
              </div>

              {/* Recent Activity */}
              <div className="col-span-2">
                <div className="text-xs text-[#4B5563] line-clamp-2">{member.recentParticipation}</div>
              </div>

              {/* Last Active */}
              <div className="col-span-1">
                <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                  <Clock className="w-3 h-3" />
                  {member.lastActive}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-[#111827] mb-2">No members found</h3>
            <p className="text-xs text-[#6B7280]">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#2563EB] mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">Privacy Protection</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Member identities are anonymized to protect resident privacy. Contact details, exact addresses, 
              and sensitive personal information are not displayed. This view provides enough information for 
              civic coordination without compromising individual privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMembers;
