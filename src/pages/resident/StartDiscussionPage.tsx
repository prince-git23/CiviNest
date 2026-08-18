import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  LocateFixed,
  Loader2,
  Search,
  CheckCircle2,
  Link2,
  X,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { createDiscussion, getMapIssues, getIssueById, type ReportData } from '../../services/api';
import { DISCUSSION_CATEGORIES, initialsOf } from '../../services/discussionsService';
import { reverseGeocode } from '../../services/geo/geocodingService';
import { CivicMap } from '../../components/map/CivicMap';
import { MapSearch } from '../../components/map/MapSearch';
import type { AuthenticatedUser } from '../../types';

interface StartDiscussionPageProps {
  authenticatedUser?: AuthenticatedUser;
}

interface DiscussionLocation {
  latitude: number;
  longitude: number;
  address?: string;
  ward?: string;
  locality?: string;
}

const TOPIC_OPTIONS = DISCUSSION_CATEGORIES.filter((c) => c.id !== 'all');

export const StartDiscussionPage: React.FC<StartDiscussionPageProps> = ({ authenticatedUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Optional location ──
  const [locationOpen, setLocationOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [location, setLocation] = useState<DiscussionLocation | null>(null);
  const [mapViewport, setMapViewport] = useState({ latitude: 21.1458, longitude: 79.0882, zoom: 13 });

  // ── Optional linked civic issue ──
  const [issueOpen, setIssueOpen] = useState(false);
  const [issues, setIssues] = useState<ReportData[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issueQuery, setIssueQuery] = useState('');
  const [linkedIssue, setLinkedIssue] = useState<{ id: string; title: string } | null>(null);

  // Support ?issueId= from other flows ("Discuss this issue").
  useEffect(() => {
    const issueId = searchParams.get('issueId');
    if (!issueId) return;
    getIssueById(issueId)
      .then(({ issue }) => {
        setLinkedIssue({ id: issue.id, title: issue.title });
        setIssueOpen(true);
      })
      .catch(() => {});
  }, [searchParams]);

  const loadIssues = async () => {
    if (issues.length > 0) return;
    setIssuesLoading(true);
    try {
      const { issues: found } = await getMapIssues();
      setIssues(found);
    } catch {
      // no-op — picker just stays empty
    } finally {
      setIssuesLoading(false);
    }
  };

  const filteredIssues = useMemo(() => {
    const q = issueQuery.trim().toLowerCase();
    if (!q) return issues.slice(0, 12);
    return issues
      .filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.reportNumber || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [issues, issueQuery]);

  // ── Geolocation ──
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support geolocation. You can search for a place instead.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapViewport({ latitude, longitude, zoom: 15 });
        setLocation({ latitude, longitude });
        setResolving(true);
        try {
          const geo = await reverseGeocode({ latitude, longitude });
          setLocation({
            latitude,
            longitude,
            address: geo?.address,
            ward: geo?.ward,
            locality: geo?.locality,
          });
        } catch {
          setLocation({ latitude, longitude });
        } finally {
          setResolving(false);
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location access was denied. You can search for the issue location manually.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Please try again or search manually.');
        } else {
          setLocationError('Unable to determine your location. Please search for a place instead.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  const handleSearchSelect = async (point: { latitude: number; longitude: number }, name: string) => {
    setMapViewport({ latitude: point.latitude, longitude: point.longitude, zoom: 15 });
    setLocation({ latitude: point.latitude, longitude: point.longitude, address: name });
    setLocationError(null);
    setResolving(true);
    try {
      const geo = await reverseGeocode(point);
      setLocation((prev) => ({
        latitude: point.latitude,
        longitude: point.longitude,
        address: geo?.address || name,
        ward: geo?.ward,
        locality: geo?.locality,
      }));
    } catch {
      setLocation((prev) => prev || { latitude: point.latitude, longitude: point.longitude, address: name });
    } finally {
      setResolving(false);
    }
  };

  const handleMapClick = async (point: { latitude: number; longitude: number }) => {
    setMapViewport({ latitude: point.latitude, longitude: point.longitude, zoom: 15 });
    setLocation({ latitude: point.latitude, longitude: point.longitude });
    setLocationError(null);
    setResolving(true);
    try {
      const geo = await reverseGeocode(point);
      setLocation({
        latitude: point.latitude,
        longitude: point.longitude,
        address: geo?.address,
        ward: geo?.ward,
        locality: geo?.locality,
      });
    } finally {
      setResolving(false);
    }
  };

  const removeLocation = () => {
    setLocation(null);
    setLocationOpen(false);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setError(null);
    if (title.trim().length < 3) {
      setError('Please give your discussion a title (at least 3 characters).');
      return;
    }
    if (body.trim().length < 3) {
      setError('Please write a short description of what you want to discuss.');
      return;
    }
    if (!category) {
      setError('Please choose a topic.');
      return;
    }

    setSubmitting(true);
    try {
      const { discussion } = await createDiscussion({
        title: title.trim(),
        body: body.trim(),
        category,
        ward: authenticatedUser?.ward,
        locality: authenticatedUser?.locality,
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              ward: location.ward || authenticatedUser?.ward,
              locality: location.locality || authenticatedUser?.locality,
            }
          : undefined,
        issueId: linkedIssue?.id,
      });
      navigate(`/resident/community/${discussion.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to start the discussion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const userName = authenticatedUser?.name || 'Resident';

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6">
        {/* Back + header */}
        <button
          onClick={() => navigate('/resident/community')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </button>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#E5E7EB] bg-[#F8FAFC]">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Community Voice</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F1E36] tracking-tight font-serif">
              Start a Community Discussion
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Share a topic with your neighbourhood. Discussions are conversations — they are not
              civic signals and are never sent to the municipal workflow.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Author identity */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                {initialsOf(userName)}
              </span>
              <div>
                <p className="text-xs font-semibold text-[#111827]">Posting as {userName}</p>
                <p className="text-[10.5px] text-[#6B7280]">
                  {authenticatedUser?.ward || 'Resident'} · {authenticatedUser?.city || 'CiviNest'}
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#6B7280] mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827]"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#6B7280] mb-1.5">
                Topic
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827] cursor-pointer"
              >
                <option value="">Select a topic…</option>
                {TOPIC_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Body */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#6B7280] mb-1.5">
                Discussion
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Describe the topic, what you know, and what you'd like the community to weigh in on…"
                className="w-full px-4 py-3 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827] resize-y"
              />
            </div>

            {/* ── Optional civic context ── */}
            <div className="space-y-3">
              {/* Optional location */}
              <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <button
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#374151]">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {location ? 'Add Location (optional)' : 'Add Location (optional)'}
                  </span>
                  {location ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {resolving ? 'Resolving…' : 'Added'}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#9CA3AF]">{locationOpen ? 'Hide' : 'Expand'}</span>
                  )}
                </button>

                {locationOpen && (
                  <div className="p-4 border-t border-[#E5E7EB] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={useMyLocation}
                        disabled={locating || resolving}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#0F1E36] hover:bg-slate-800 text-white text-xs font-medium transition-all disabled:opacity-60 cursor-pointer"
                      >
                        {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                        {locating ? 'Getting your location…' : 'Use My Current Location'}
                      </button>
                      <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg px-2.5">
                        <MapSearch onSelectLocation={handleSearchSelect} placeholder="Search street, landmark…" />
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
                      <CivicMap
                        viewport={mapViewport}
                        onViewportChange={setMapViewport}
                        onMapClick={handleMapClick}
                        userLocation={location || undefined}
                        showUserLocation={Boolean(location)}
                        className="w-full"
                        style={{ height: 220 }}
                        compact={true}
                      />
                    </div>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Click the map to drop the pin, use your current location, or search for a place.
                    </p>

                    {location && (
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-blue-900 truncate">
                              {resolving ? 'Resolving address…' : (location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)}
                            </p>
                            <p className="text-[10px] text-blue-800 font-mono truncate">
                              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                              {location.ward ? ` · ${location.ward}` : ''}
                              {location.locality ? ` · ${location.locality}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeLocation}
                          className="p-1 text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                          aria-label="Remove location"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {locationError && (
                      <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{locationError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional linked civic issue */}
              <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <button
                  onClick={() => {
                    setIssueOpen(!issueOpen);
                    if (!issueOpen) loadIssues();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#374151]">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    Link a Civic Issue (optional)
                  </span>
                  {linkedIssue ? (
                    <span className="text-[11px] text-emerald-600 font-semibold">Linked</span>
                  ) : (
                    <span className="text-[11px] text-[#9CA3AF]">{issueOpen ? 'Hide' : 'Expand'}</span>
                  )}
                </button>

                {issueOpen && (
                  <div className="p-4 border-t border-[#E5E7EB] space-y-3">
                    {linkedIssue ? (
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono font-bold text-blue-600">#{linkedIssue.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs font-semibold text-blue-900 truncate">{linkedIssue.title}</p>
                        </div>
                        <button
                          onClick={() => setLinkedIssue(null)}
                          className="p-1 text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                          aria-label="Remove linked issue"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                          <input
                            type="text"
                            value={issueQuery}
                            onChange={(e) => setIssueQuery(e.target.value)}
                            placeholder="Search civic issues…"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#111827]"
                          />
                        </div>
                        {issuesLoading ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-xs text-[#6B7280]">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            Loading civic issues…
                          </div>
                        ) : filteredIssues.length === 0 ? (
                          <p className="py-4 text-center text-xs text-[#9CA3AF]">
                            No civic issues found.
                          </p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-lg">
                            {filteredIssues.map((issue) => (
                              <button
                                key={issue._id}
                                onClick={() => setLinkedIssue({ id: issue._id, title: issue.title })}
                                className="w-full px-3 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors cursor-pointer flex items-center gap-2"
                              >
                                <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-[#111827] truncate">{issue.title}</p>
                                  <p className="text-[10px] text-[#6B7280] font-mono">
                                    {issue.reportNumber} · {issue.status}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F3F4F6]">
              <button
                onClick={() => navigate('/resident/community')}
                className="px-4 py-2.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Start Discussion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartDiscussionPage;
