import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Search,
  Filter,
  AlertTriangle,
  FileText,
  CheckCircle,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  Users,
  Building2,
  Calendar,
} from 'lucide-react';

interface CommunityIssue {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: number;
  impact: 'High' | 'Medium' | 'Low';
  confidence: number;
  reports: number;
  confirmations: number;
  affectedProperties: number;
  status: string;
  lastUpdate: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const mockIssues: CommunityIssue[] = [
  {
    id: 'CIV-2026-014',
    title: 'Street Lighting Failure',
    category: 'Infrastructure',
    location: 'Sector 14 — Elm Street',
    priority: 92,
    impact: 'High',
    confidence: 91,
    reports: 25,
    confirmations: 8,
    affectedProperties: 14,
    status: 'Under Municipal Review',
    lastUpdate: '2 hours ago',
    description: 'Multiple streetlights non-functional along Elm Street corridor affecting pedestrian safety.',
    severity: 'high',
  },
  {
    id: 'CIV-2026-019',
    title: 'Drainage Overflow',
    category: 'Sanitation',
    location: 'Central Market Square',
    priority: 78,
    impact: 'Medium',
    confidence: 85,
    reports: 14,
    confirmations: 6,
    affectedProperties: 8,
    status: 'Assigned',
    lastUpdate: '5 hours ago',
    description: 'Stormwater drainage backing up after recent rainfall causing localized flooding.',
    severity: 'medium',
  },
  {
    id: 'CIV-2026-023',
    title: 'Road Damage',
    category: 'Infrastructure',
    location: 'West Access Road',
    priority: 85,
    impact: 'High',
    confidence: 94,
    reports: 18,
    confirmations: 12,
    affectedProperties: 12,
    status: 'In Progress',
    lastUpdate: '1 day ago',
    description: 'Deep pothole and road surface collapse blocking emergency vehicle transit lane.',
    severity: 'high',
  },
  {
    id: 'CIV-2026-028',
    title: 'Water Pressure Drop',
    category: 'Water',
    location: 'Block B Apartments',
    priority: 62,
    impact: 'Low',
    confidence: 78,
    reports: 6,
    confirmations: 4,
    affectedProperties: 6,
    status: 'Awaiting Review',
    lastUpdate: '2 days ago',
    description: 'Low water pressure during morning hours affecting multiple apartments.',
    severity: 'low',
  },
  {
    id: 'CIV-2026-031',
    title: 'Waste Collection Delay',
    category: 'Sanitation',
    location: 'Lane 4 Residential',
    priority: 55,
    impact: 'Low',
    confidence: 82,
    reports: 8,
    confirmations: 3,
    affectedProperties: 10,
    status: 'Resolved',
    lastUpdate: '3 days ago',
    description: 'Missed waste collection for two consecutive days in Lane 4 area.',
    severity: 'low',
  },
];

export const CommunityIssues: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssue | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'reports' | 'confirmations'>('priority');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for issue cards
      gsap.fromTo(
        '.issue-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'priority') return b.priority - a.priority;
    if (sortBy === 'reports') return b.reports - a.reports;
    return b.confirmations - a.confirmations;
  });

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
      case 'Under Municipal Review': return 'bg-purple-100 text-purple-700';
      case 'Awaiting Review': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = ['all', 'Infrastructure', 'Sanitation', 'Water', 'Safety'];
  const statuses = ['all', 'Under Municipal Review', 'Assigned', 'In Progress', 'Awaiting Review', 'Resolved'];

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
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search issues by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full md:w-48 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none w-full md:w-48 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full md:w-40 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white pr-10"
            >
              <option value="priority">Sort by Priority</option>
              <option value="reports">Sort by Reports</option>
              <option value="confirmations">Sort by Confirmations</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="issue-card bg-white rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedIssue(issue)}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-[#111827]">{issue.title}</h3>
                  <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {issue.location}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">Priority</div>
                  <div className="text-lg font-bold text-[#0F1E36]">{issue.priority}<span className="text-xs font-normal text-[#9CA3AF]">/100</span></div>
                </div>
                <div className="p-2 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">Impact</div>
                  <div className="text-lg font-bold text-[#0F1E36]">{issue.impact}</div>
                </div>
                <div className="p-2 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">Confidence</div>
                  <div className="text-lg font-bold text-[#0F1E36]">{issue.confidence}%</div>
                </div>
                <div className="p-2 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">Affected Properties</div>
                  <div className="text-lg font-bold text-[#0F1E36]">{issue.affectedProperties}</div>
                </div>
              </div>

              {/* Reports & Confirmations */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                  <FileText className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span className="font-medium">{issue.reports}</span> reports
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="font-medium">{issue.confirmations}</span> confirmations
                </div>
              </div>

              {/* Status & Last Update */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {issue.lastUpdate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Issue Detail Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {selectedIssue.title}
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-1">{selectedIssue.id}</p>
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

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-2">Description</h3>
                <p className="text-sm text-[#4B5563]">{selectedIssue.description}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                  <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.priority}</div>
                  <div className="text-xs text-[#6B7280]">Priority Score</div>
                </div>
                <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                  <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.impact}</div>
                  <div className="text-xs text-[#6B7280]">Impact Level</div>
                </div>
                <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                  <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.confidence}%</div>
                  <div className="text-xs text-[#6B7280]">AI Confidence</div>
                </div>
                <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                  <div className="text-2xl font-bold text-[#0F1E36]">{selectedIssue.affectedProperties}</div>
                  <div className="text-xs text-[#6B7280]">Affected Properties</div>
                </div>
              </div>

              {/* Reports & Confirmations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-sm font-semibold text-[#111827]">Supporting Reports</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0F1E36]">{selectedIssue.reports}</div>
                  <p className="text-xs text-[#6B7280] mt-1">Resident submissions</p>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    <span className="text-sm font-semibold text-[#111827]">Independent Confirmations</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0F1E36]">{selectedIssue.confirmations}</div>
                  <p className="text-xs text-[#6B7280] mt-1">Verified by community</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#F3F4F6]">
                <button className="flex-1 px-4 py-2.5 bg-[#0F1E36] text-white text-sm font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Full Details
                </button>
                <button className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Add Context
                </button>
                <button className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Confirm Community Impact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityIssues;
