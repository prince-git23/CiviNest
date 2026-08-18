import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  RefreshCw,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import {
  getDiscussion,
  postDiscussionMessage,
  confirmDiscussion,
  type DiscussionData,
} from '../../services/api';
import {
  discussionCategoryLabel,
  formatRelativeTime,
  initialsOf,
} from '../../services/discussionsService';
import { CivicMap } from '../../components/map/CivicMap';

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

export const DiscussionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [discussion, setDiscussion] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { discussion: d } = await getDiscussion(id);
      setDiscussion(d);
    } catch (e: any) {
      setError(e.message || 'Unable to load discussion.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReply = async () => {
    const text = replyText.trim();
    if (!text || !id || sendingReply) return;
    setSendingReply(true);
    setReplyError(null);
    try {
      const { discussion: updated } = await postDiscussionMessage(id, text);
      setDiscussion(updated);
      setReplyText('');
    } catch (e: any) {
      setReplyError(e.message || 'Failed to post your reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleConfirm = async () => {
    if (!id || confirming || discussion?.confirmedByMe) return;
    setConfirming(true);
    setReplyError(null);
    try {
      const { discussion: updated } = await confirmDiscussion(id);
      setDiscussion(updated);
    } catch (e: any) {
      setReplyError(e.message || 'Failed to record your support. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleViewIssue = () => {
    if (discussion?.issueId) navigate(`/resident/reports/${discussion.issueId}`);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 animate-pulse">
          <div className="h-3 w-24 bg-[#F3F4F6] rounded-full mb-4" />
          <div className="h-5 w-2/3 bg-[#F3F4F6] rounded-full mb-3" />
          <div className="h-3 w-full bg-[#F9FAFB] rounded-full mb-1.5" />
          <div className="h-3 w-3/4 bg-[#F9FAFB] rounded-full" />
        </div>
      </div>
    );
  }

  // ── Error / not found ──
  if (error || !discussion) {
    return (
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate('/resident/community')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </button>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0F1E36]">
            {error === 'Discussion not found' ? 'Discussion not found' : 'Unable to load discussion'}
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            {error === 'Discussion not found'
              ? 'This discussion may have been removed.'
              : 'Check your connection and try again.'}
          </p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasCoords =
    typeof discussion.location?.latitude === 'number' &&
    typeof discussion.location?.longitude === 'number';

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate('/resident/community')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </button>

        {/* ── Discussion card ── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusPill(discussion.status)}`}>
                {discussion.status === 'CLOSED' ? 'CLOSED' : discussion.status === 'ACTIVE' ? 'ACTIVE' : 'OPEN'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] text-[#4B5563]">
                {discussion.categoryLabel || discussionCategoryLabel(discussion.category)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight font-serif mb-4">
              {discussion.title}
            </h1>

            {/* Author */}
            <div className="flex flex-wrap items-center gap-4 pb-5 border-b border-[#F3F4F6] mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                  {initialsOf(discussion.author.displayName)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{discussion.author.displayName}</p>
                  <p className="text-[10.5px] text-[#6B7280] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Started {formatRelativeTime(discussion.createdAt)}
                  </p>
                </div>
              </div>
              {(discussion.location.ward || discussion.location.locality) && (
                <span className="flex items-center gap-1 text-xs text-[#6B7280] ml-auto">
                  <MapPin className="w-3.5 h-3.5" />
                  {discussion.location.locality || discussion.location.ward}
                </span>
              )}
            </div>

            {/* Body */}
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap mb-6">
              {discussion.body || discussion.preview}
            </p>

            {/* Linked issue */}
            {discussion.issueId && (
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-100 mb-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono font-bold text-blue-600 mb-0.5">
                    #{discussion.issueId.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm font-bold text-blue-900 truncate">
                    {discussion.issueTitle || 'Linked civic issue'}
                  </p>
                </div>
                <button
                  onClick={handleViewIssue}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 cursor-pointer transition-colors shrink-0"
                >
                  View Issue
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Optional location map */}
            {hasCoords && (
              <div className="mb-5">
                <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
                  <CivicMap
                    viewport={{
                      latitude: discussion.location!.latitude!,
                      longitude: discussion.location!.longitude!,
                      zoom: 14,
                    }}
                    userLocation={{ latitude: discussion.location!.latitude!, longitude: discussion.location!.longitude! }}
                    showUserLocation={true}
                    issues={[
                      {
                        id: 'discussion-point',
                        title: discussion.title,
                        category: (discussion.category || 'other') as any,
                        priority: 50,
                        confidence: 1,
                        reportCount: discussion.replyCount,
                        confirmationCount: discussion.confirmationCount,
                        status: 'Under Review' as any,
                        latitude: discussion.location!.latitude!,
                        longitude: discussion.location!.longitude!,
                      },
                    ]}
                    className="w-full"
                    style={{ height: 220 }}
                    compact={true}
                  />
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-1.5">
                  {discussion.location.address ||
                    `${discussion.location!.latitude!.toFixed(4)}, ${discussion.location!.longitude!.toFixed(4)}`}
                  {discussion.location.ward ? ` · ${discussion.location.ward}` : ''}
                </p>
              </div>
            )}

            {/* Stats + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-[11px] text-[#6B7280]">Replies</p>
                <p className="text-lg font-bold text-[#0F1E36]">{discussion.replyCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-[11px] text-[#6B7280]">Support</p>
                <p className="text-lg font-bold text-emerald-600">{discussion.confirmationCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-[11px] text-[#6B7280]">Last activity</p>
                <p className="text-lg font-bold text-[#0F1E36]">{formatRelativeTime(discussion.updatedAt)}</p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming || discussion.confirmedByMe}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                discussion.confirmedByMe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#0F1E36] hover:bg-[#1E293B] text-white'
              } disabled:cursor-not-allowed`}
            >
              {confirming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4" />
              )}
              {discussion.confirmedByMe
                ? `You support this discussion · ${discussion.confirmationCount}`
                : `Confirm / Support · ${discussion.confirmationCount}`}
            </button>
          </div>

          {/* ── Conversation ── */}
          <div className="border-t border-[#E5E7EB] bg-[#F8FAFC] p-6 sm:p-8">
            <h2 className="text-sm font-bold text-[#0F1E36] mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Conversation
              <span className="text-[11px] font-mono text-[#9CA3AF]">({discussion.replyCount})</span>
            </h2>

            <div className="space-y-3">
              {!discussion.messages || discussion.messages.length === 0 ? (
                <div className="bg-white border border-dashed border-[#E5E7EB] rounded-xl p-6 text-center">
                  <p className="text-xs text-[#9CA3AF]">No replies yet — start the conversation below.</p>
                </div>
              ) : (
                discussion.messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
                    <span className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {initialsOf(msg.userName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-[#111827]">{msg.userName}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{formatRelativeTime(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#374151] mt-1 break-words whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply composer */}
            {discussion.status !== 'CLOSED' ? (
              <div className="mt-4">
                {replyError && (
                  <div className="flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{replyError}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add to the discussion…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827]"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="p-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Send reply"
                  >
                    {sendingReply ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                This discussion is closed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetailPage;
