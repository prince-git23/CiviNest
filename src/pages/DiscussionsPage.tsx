import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Pin,
  Droplet,
  Car,
  Lightbulb,
  Trash2,
  Shield,
  TreePine,
  X,
  Send,
  Paperclip,
  Loader2,
} from 'lucide-react';
import {
  DiscussionItem,
  DiscussionCategory,
  TrendingTopic,
  CommunityPulseItem,
  DiscussionMessage,
  DiscussionParticipant,
  sampleDiscussions,
  discussionCategories,
  trendingTopics,
  communityPulseItems,
  filterDiscussions,
} from '../services/discussionsService';
import { getResidentDiscussions, getDiscussion, postDiscussionMessage, DiscussionData } from '../services/api';

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
    water: <Droplet className="w-4 h-4" />,
    roads: <Car className="w-4 h-4" />,
    lighting: <Lightbulb className="w-4 h-4" />,
    sanitation: <Trash2 className="w-4 h-4" />,
    safety: <Shield className="w-4 h-4" />,
    environment: <TreePine className="w-4 h-4" />,
  };
  return icons[categoryId] || <MessageSquare className="w-4 h-4" />;
};

const getStatusColor = (status: DiscussionItem['status']) => {
  switch (status) {
    case 'active':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'escalated':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'pending_action':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const CATEGORY_TO_DISCUSSION: Record<string, DiscussionItem['category']> = {
  water_supply: 'water',
  water: 'water',
  roads: 'roads',
  road: 'roads',
  street_lighting: 'lighting',
  lighting: 'lighting',
  drainage: 'sanitation',
  waste: 'sanitation',
  public_safety: 'safety',
  safety: 'safety',
  parks: 'environment',
};

function toDiscussionItem(d: DiscussionData): DiscussionItem {
  const category = CATEGORY_TO_DISCUSSION[d.category] || 'general';
  const categoryLabel = (d.category || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const firstMessage = d.messages?.[0]?.text || '';
  return {
    id: d._id,
    title: d.issueTitle || 'Community discussion',
    category,
    categoryLabel: categoryLabel || 'General',
    locality: d.locality || d.ward || 'Dharampeth',
    ward: d.ward || 'Ward 14',
    associatedIssueId: d.issueId,
    associatedIssueTitle: d.issueTitle,
    participants: [],
    messageCount: d.messages?.length || 0,
    confirmations: d.confirmations?.length || 0,
    status: d.status === 'CLOSED' ? 'resolved' : 'active',
    createdAt: d.createdAt,
    lastActivity: d.updatedAt || d.createdAt,
    description: firstMessage || `${categoryLabel || 'Civic'} concern in ${d.locality || 'your area'} — join the discussion to add your voice.`,
    tags: [categoryLabel || 'Civic'],
  };
}

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({
  userContext = {
    name: 'Prince',
    city: 'Nagpur',
    ward: 'Dharampeth Ward 14',
    community: 'Green Valley Residency',
  },
  onNavigateToIssue,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>(sampleDiscussions);
  const [drawerMessages, setDrawerMessages] = useState<DiscussionMessage[]>([]);

  // Load real discussions from the backend when available
  useEffect(() => {
    let mounted = true;
    getResidentDiscussions()
      .then(({ discussions: real }) => {
        if (!mounted || !real || real.length === 0) return;
        setDiscussions(real.map(toDiscussionItem));
      })
      .catch(() => {
        // Backend unavailable — demo discussions stay
      });
    return () => {
      mounted = false;
    };
  }, []);

  const pageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.animate-entry'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, filteredDiscussions.length);
    gsap.fromTo(
      cardRefs.current.filter(Boolean),
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, [selectedCategory, selectedStatus, searchQuery]);

  const filteredDiscussions = filterDiscussions(discussions, {
    category: selectedCategory,
    status: selectedStatus,
    searchQuery,
    locality: selectedLocality,
  });

  const handleSelectDiscussion = (discussion: DiscussionItem) => {
    setSelectedDiscussion(discussion);
    setDrawerMessages([]);
    setNewMessage('');
    setIsDetailDrawerOpen(true);

    // Load the real message thread from the backend
    getDiscussion(discussion.id)
      .then(({ discussion: detail }) => {
        const loaded = (detail.messages || []).map((m, i) => ({
          id: m.userId + '-' + i,
          author: {
            id: m.userId,
            name: m.userName || 'Resident',
            isVerified: false,
          },
          content: m.text,
          timestamp: m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
          isEvidence: false,
        }));
        setDrawerMessages(loaded);
      })
      .catch(() => {
        // Backend unavailable — empty thread
      });

    gsap.fromTo(
      '.drawer-content',
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  };

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !selectedDiscussion || sendingMessage) return;

    const discussionId = selectedDiscussion.id;
    setSendingMessage(true);
    try {
      const { message } = await postDiscussionMessage(discussionId, text);
      const newMsg: DiscussionMessage = {
        id: `${Date.now()}`,
        author: { id: message.userId, name: message.userName || 'Resident', isVerified: false },
        content: message.text,
        timestamp: message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Just now',
        isEvidence: false,
      };
      setDrawerMessages((prev) => [...prev, newMsg]);
      setNewMessage('');

      // Reflect the new count + participants in the drawer and list
      setSelectedDiscussion((prev) =>
        prev ? { ...prev, messageCount: prev.messageCount + 1 } : prev
      );
      setDiscussions((prev) =>
        prev.map((d) => (d.id === discussionId ? { ...d, messageCount: d.messageCount + 1 } : d))
      );
    } catch {
      // Keep the text so the resident can retry
    } finally {
      setSendingMessage(false);
    }
  };

  // Participants derived from the loaded message thread
  const drawerParticipants: DiscussionParticipant[] = useMemo(() => {
    const seen = new Set<string>();
    const participants: DiscussionParticipant[] = [];
    drawerMessages.forEach((m) => {
      const key = m.author.id + m.author.name;
      if (!seen.has(key)) {
        seen.add(key);
        participants.push(m.author);
      }
    });
    return participants;
  }, [drawerMessages]);

  const handleCloseDrawer = () => {
    gsap.to('.drawer-content', {
      x: 100,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setIsDetailDrawerOpen(false),
    });
  };

  const localities = Array.from(new Set(discussions.map((d) => d.locality)));

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FBFBFA]">
      <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between gap-4 animate-entry">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Community Voice</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight font-serif">
                Community Discussions
              </h1>
              <p className="text-xs text-[#6B7280] mt-1 max-w-xl">
                Discuss local civic issues, share evidence and context, and coordinate community action.
              </p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Start Discussion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 animate-entry">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search discussions, issues, or #IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                    <option value="pending_action">Pending Action</option>
                  </select>
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="px-3 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827] cursor-pointer hidden sm:block"
                  >
                    <option value="all">All Localities</option>
                    {localities.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F3F4F6]">
                {discussionCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-[#0F1E36] text-white'
                        : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {getCategoryIcon(category.id)}
                    <span>{category.label}</span>
                    <span className={`text-[10px] font-mono ${selectedCategory === category.id ? 'text-white/70' : 'text-[#9CA3AF]'}`}>
                      ({category.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((discussion, index) => (
                  <div
                    key={discussion.id}
                    ref={(el) => { cardRefs.current[index] = el; }}
                    onClick={() => handleSelectDiscussion(discussion)}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {discussion.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(discussion.status)}`}>
                            {discussion.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">•</span>
                          <span className="text-xs text-[#6B7280] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {discussion.locality}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#0F1E36] group-hover:text-blue-600 transition-colors mb-1">
                          {discussion.title}
                        </h3>
                        <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">
                          {discussion.description}
                        </p>

                        {discussion.associatedIssueId && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 mb-3">
                            <span className="text-[10px] font-mono font-bold text-blue-600">
                              #{discussion.associatedIssueId}
                            </span>
                            <span className="text-[11px] text-blue-700 truncate max-w-[200px]">
                              {discussion.associatedIssueTitle}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToIssue?.(discussion.associatedIssueId!);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {discussion.participants.length} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {discussion.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {discussion.confirmations} confirmations
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {discussion.lastActivity}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-blue-600 transition-colors shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-[#0F1E36]">No discussions found</h3>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Try adjusting your filters or start a new discussion.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#0F1E36]">Trending Topics</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">{topic.title}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        {topic.reportCount} reports • {topic.engagementScore}% engagement
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 animate-entry">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-[#0F1E36]">Community Pulse</h3>
              </div>
              <div className="space-y-3">
                {communityPulseItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'verification' ? 'bg-emerald-50 text-emerald-600' :
                      item.type === 'escalation' ? 'bg-red-50 text-red-600' :
                      item.type === 'evidence' ? 'bg-blue-50 text-blue-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {item.type === 'verification' && <CheckCircle2 className="w-4 h-4" />}
                      {item.type === 'escalation' && <AlertTriangle className="w-4 h-4" />}
                      {item.type === 'evidence' && <Paperclip className="w-4 h-4" />}
                      {item.type === 'resolution' && <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827]">{item.title}</p>
                      <p className="text-[11px] text-[#6B7280] line-clamp-2">{item.description}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">{item.timestamp} • {item.locality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDetailDrawerOpen && selectedDiscussion && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="drawer-content w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {selectedDiscussion.categoryLabel}
                </span>
                <h2 className="text-lg font-bold text-[#0F1E36]">{selectedDiscussion.title}</h2>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedDiscussion.associatedIssueId && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[11px] font-semibold text-blue-600 mb-1">Associated Civic Issue</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700">#{selectedDiscussion.associatedIssueId}</span>
                    <button
                      onClick={() => onNavigateToIssue?.(selectedDiscussion.associatedIssueId!)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <span>View Issue</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-xs text-[#6B7280] mb-2">Discussion Description</p>
                <p className="text-sm text-[#111827]">{selectedDiscussion.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#6B7280]">Participants</p>
                  <p className="text-lg font-bold text-[#0F1E36]">
                    {drawerMessages.length > 0 ? drawerParticipants.length : selectedDiscussion.participants.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#6B7280]">Messages</p>
                  <p className="text-lg font-bold text-[#0F1E36]">{selectedDiscussion.messageCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#6B7280]">Confirmations</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedDiscussion.confirmations}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#6B7280]">Status</p>
                  <p className="text-sm font-bold text-[#0F1E36] capitalize">{selectedDiscussion.status.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">Participants</p>
                <div className="flex flex-wrap gap-2">
                  {(drawerMessages.length > 0 ? drawerParticipants : selectedDiscussion.participants).map((participant) => (
                    <div
                      key={participant.id + participant.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB]"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                        {(participant.name || '?').charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-[#111827]">{participant.name}</span>
                      {participant.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message thread */}
              <div>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">Conversation</p>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {drawerMessages.length === 0 ? (
                    <p className="text-xs text-[#9CA3AF] bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-xl p-4 text-center">
                      No messages yet — start the conversation below.
                    </p>
                  ) : (
                    drawerMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                          {(msg.author.name || 'R').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-[#111827]">{msg.author.name}</span>
                            <span className="text-[10px] text-[#9CA3AF]">{msg.timestamp}</span>
                          </div>
                          <p className="text-xs text-[#374151] mt-0.5 break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDiscussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#4B5563]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add to discussion..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="p-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;
