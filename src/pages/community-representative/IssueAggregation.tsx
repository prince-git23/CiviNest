import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Clock,
  MessageSquare,
  Users,
  Upload,
  Send,
  GitMerge,
  Brain,
  Target,
  Shield,
} from 'lucide-react';

interface UnclusteredConcern {
  id: string;
  reportId: string;
  description: string;
  location: string;
  time: string;
  category: string;
  hasEvidence: boolean;
  selected: boolean;
}

interface AggregatedCluster {
  id: string;
  title: string;
  category: string;
  similarityScore: number;
  affectedProperties: number;
  confirmations: number;
  confidence: number;
  priority: number;
  status: string;
  derivedContext: string;
  reports: string[];
}

const mockConcerns: UnclusteredConcern[] = [
  {
    id: 'concern-1',
    reportId: 'REP-942',
    description: 'The streetlights on Elm and 5th have been flickering for three nights...',
    location: 'Elm St & 5th Ave',
    time: '1h ago',
    category: 'Infrastructure',
    hasEvidence: true,
    selected: true,
  },
  {
    id: 'concern-2',
    reportId: 'REP-938',
    description: 'Dark intersection at 5th and Elm. Three street lamps are completely off...',
    location: '5th Ave / Elm',
    time: '4h ago',
    category: 'Infrastructure',
    hasEvidence: true,
    selected: true,
  },
  {
    id: 'concern-3',
    reportId: 'REP-921',
    description: 'Lighting on 5th avenue block near Elm street is non-functional...',
    location: '5th Ave Sector 14',
    time: 'Yesterday',
    category: 'Infrastructure',
    hasEvidence: false,
    selected: true,
  },
  {
    id: 'concern-4',
    reportId: 'REP-945',
    description: 'Pothole getting larger on Maple drive near the park entrance...',
    location: 'Maple Dr',
    time: '10m ago',
    category: 'Roads',
    hasEvidence: true,
    selected: false,
  },
  {
    id: 'concern-5',
    reportId: 'REP-930',
    description: 'Graffiti on the side of the library building facing the main road...',
    location: 'Civic Library',
    time: '8h ago',
    category: 'Vandalism',
    hasEvidence: false,
    selected: false,
  },
  {
    id: 'concern-6',
    reportId: 'REP-918',
    description: 'Water leak from fire hydrant on Oak Street creating puddle...',
    location: 'Oak Street',
    time: '2 days ago',
    category: 'Water',
    hasEvidence: true,
    selected: false,
  },
];

const mockCluster: AggregatedCluster = {
  id: 'cluster-1',
  title: 'Street Lighting Failure',
  category: 'Sector 14',
  similarityScore: 94,
  affectedProperties: 14,
  confirmations: 8,
  confidence: 91,
  priority: 92,
  status: 'Suggested Cluster',
  derivedContext: 'Analysis indicates a localized grid failure affecting 3+ lamps at the Elm St & 5th Ave intersection. Pattern consistent with feeder circuit breaker trip.',
  reports: ['REP-942', 'REP-938', 'REP-921'],
};

export const IssueAggregation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [concerns, setConcerns] = useState<UnclusteredConcern[]>(mockConcerns);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(['concern-1', 'concern-2', 'concern-3']);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for columns
      gsap.fromTo(
        '.agg-column',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.2 }
      );

      // Selected concerns animation
      gsap.fromTo(
        '.selected-concern',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concernId)
        ? prev.filter((id) => id !== concernId)
        : [...prev, concernId]
    );
  };

  const filteredConcerns = concerns.filter((concern) =>
    concern.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concern.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConcernsList = concerns.filter((c) => selectedConcerns.includes(c.id));
  const unselectedConcerns = filteredConcerns.filter((c) => !selectedConcerns.includes(c.id));

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Issue Aggregation
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Bring related resident concerns together into a single underlying Civic Issue
        </p>
      </div>

      {/* Three-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Unclustered Concerns */}
        <div className="agg-column space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#111827]">Unclustered Concerns</h2>
              <span className="text-xs text-[#6B7280]">{concerns.length} total</span>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search unclustered..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>

            {/* Selected Concerns */}
            {selectedConcernsList.length > 0 && (
              <div className="mb-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
                  Selected ({selectedConcernsList.length})
                </div>
                <div className="space-y-2">
                  {selectedConcernsList.map((concern) => (
                    <div
                      key={concern.id}
                      className="selected-concern p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl cursor-pointer hover:bg-[#DBEAFE] transition-colors"
                      onClick={() => toggleConcern(concern.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-[#2563EB]">{concern.reportId}</span>
                        <span className="text-xs text-[#6B7280]">{concern.time}</span>
                      </div>
                      <p className="text-sm text-[#111827] line-clamp-2">{concern.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                        <MapPin className="w-3 h-3" />
                        <span>{concern.location}</span>
                        {concern.hasEvidence && (
                          <span className="flex items-center gap-1 text-[#10B981]">
                            <FileText className="w-3 h-3" />
                            Evidence
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unselected Concerns */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
                Available Concerns
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {unselectedConcerns.map((concern) => (
                  <div
                    key={concern.id}
                    className="p-3 bg-white border border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#2563EB] hover:shadow-sm transition-all duration-200"
                    onClick={() => toggleConcern(concern.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold text-[#0F1E36]">{concern.reportId}</span>
                      <span className="text-xs text-[#6B7280]">{concern.time}</span>
                    </div>
                    <p className="text-sm text-[#111827] line-clamp-2">{concern.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
                      <MapPin className="w-3 h-3" />
                      <span>{concern.location}</span>
                      {concern.hasEvidence && (
                        <span className="flex items-center gap-1 text-[#10B981]">
                          <FileText className="w-3 h-3" />
                          Evidence
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Aggregation Workspace */}
        <div className="agg-column space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center gap-2 mb-4">
              <GitMerge className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-sm font-semibold text-[#111827]">Aggregation Workspace</h2>
            </div>

            {selectedConcerns.length > 0 ? (
              <>
                {/* AI Suggestion Header */}
                <div className="p-4 bg-gradient-to-r from-[#0F1E36] to-[#1E293B] rounded-xl text-white mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
                      AI Aggregation Suggestion
                    </span>
                  </div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {mockCluster.title}
                  </h3>
                  <p className="text-sm text-white/70 mt-1">{mockCluster.category}</p>
                </div>

                {/* Similarity Score */}
                <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl mb-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="4"
                        strokeDasharray={`${(mockCluster.similarityScore / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#0F1E36]">{mockCluster.similarityScore}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111827]">Similarity Score</div>
                    <div className="text-xs text-[#6B7280]">Based on {selectedConcerns.length} reports</div>
                  </div>
                </div>

                {/* Cluster Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{mockCluster.affectedProperties}</div>
                    <div className="text-xs text-[#6B7280]">Affected Properties</div>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{mockCluster.confirmations}</div>
                    <div className="text-xs text-[#6B7280]">Confirmations</div>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{mockCluster.confidence}%</div>
                    <div className="text-xs text-[#6B7280]">Confidence</div>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{mockCluster.priority}</div>
                    <div className="text-xs text-[#6B7280]">Priority Score</div>
                  </div>
                </div>

                {/* Derived Context */}
                <div className="p-4 bg-[#F9FAFB] rounded-xl mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-sm font-semibold text-[#111827]">Derived Context</span>
                  </div>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{mockCluster.derivedContext}</p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-[#0F1E36] text-white text-sm font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <GitMerge className="w-4 h-4" />
                    Review Cluster
                  </button>
                  <button className="w-full px-4 py-3 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Add Context
                  </button>
                  <button className="w-full px-4 py-3 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Confirm Community Impact
                  </button>
                  <button className="w-full px-4 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit Community-Level Issue
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <GitMerge className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-[#111827] mb-2">No Reports Selected</h3>
                <p className="text-xs text-[#6B7280]">Select similar reports from the left panel to begin aggregation</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Community Context */}
        <div className="agg-column space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-sm font-semibold text-[#111827]">Community Context</h2>
            </div>

            <div className="p-4 bg-[#F9FAFB] rounded-xl mb-4">
              <p className="text-xs text-[#6B7280] mb-3">
                Finalize details before escalating to city services
              </p>

              {/* System Derived Priority */}
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                      System Derived Priority
                    </div>
                    <div className="text-sm font-semibold text-[#111827] mt-1">High Priority</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Context Questions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-2">
                    What is the core issue?
                  </label>
                  <input
                    type="text"
                    defaultValue="Street Lighting Failure"
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-2">
                    Where specifically?
                  </label>
                  <input
                    type="text"
                    defaultValue="Intersection of Elm St & 5th Ave"
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-2">
                    How long has it been occurring?
                  </label>
                  <input
                    type="text"
                    defaultValue="1 - 3 Days"
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-2">
                    Who is most affected?
                  </label>
                  <textarea
                    defaultValue="Pedestrians and residents in Sector 14, specifically those walking during evening hours."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Upload Evidence */}
            <div className="p-4 border-2 border-dashed border-[#E5E7EB] rounded-xl text-center">
              <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
              <p className="text-xs text-[#6B7280] mb-2">Upload supporting evidence</p>
              <button className="px-3 py-1.5 bg-[#F3F4F6] text-xs font-medium text-[#4B5563] rounded-lg hover:bg-[#E5E7EB] transition-colors cursor-pointer">
                Choose Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueAggregation;
