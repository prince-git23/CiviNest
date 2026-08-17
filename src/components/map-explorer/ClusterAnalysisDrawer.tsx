import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  X,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  MapPin,
  Flame,
} from 'lucide-react';
import { MapClusterItem } from '../../services/mapExplorerService';
import { ClusterAIInsight } from './ClusterAIInsight';
import { ClusterMetrics } from './ClusterMetrics';
import { ImpactRadius } from './ImpactRadius';
import { GovernmentResponse } from './GovernmentResponse';

interface ClusterAnalysisDrawerProps {
  cluster: MapClusterItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackToggle?: (clusterId: string, isTracking: boolean) => void;
  isTracking?: boolean;
  onOpenVerification?: (cluster: MapClusterItem) => void;
  onOpenReportModal?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ClusterAnalysisDrawer: React.FC<ClusterAnalysisDrawerProps> = ({
  cluster,
  isOpen,
  onClose,
  onTrackToggle,
  isTracking = false,
  onOpenVerification,
  onOpenReportModal,
  onShowToast,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [localTracking, setLocalTracking] = useState(isTracking);

  useEffect(() => {
    setLocalTracking(isTracking);
  }, [isTracking]);

  // GSAP animation for opening/closing drawer
  useEffect(() => {
    if (!drawerRef.current) return;
    const drawer = drawerRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isOpen && cluster) {
      if (prefersReducedMotion) {
        gsap.set(drawer, { x: 0, opacity: 1 });
      } else {
        gsap.fromTo(
          drawer,
          { x: '100%', opacity: 0.8 },
          { x: '0%', opacity: 1, duration: 0.45, ease: 'power3.out' }
        );
      }
    }
  }, [isOpen, cluster]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cluster) return null;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?cluster=${cluster.clusterCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      if (onShowToast) {
        onShowToast(`Copied civic link for ${cluster.clusterCode} to clipboard!`);
      }
    } else if (onShowToast) {
      onShowToast(`Sharing cluster ${cluster.clusterCode}`);
    }
  };

  const handleToggleTracking = () => {
    const nextState = !localTracking;
    setLocalTracking(nextState);
    if (onTrackToggle) {
      onTrackToggle(cluster.id, nextState);
    }
    if (onShowToast) {
      onShowToast(
        nextState
          ? `Subscribed to real-time telemetry for Cluster ${cluster.clusterCode}`
          : `Unfollowed Cluster ${cluster.clusterCode}`
      );
    }
  };

  const getSeverityBadge = () => {
    switch (cluster.severity) {
      case 'critical':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Critical Bottleneck',
          dot: 'bg-rose-500',
        };
      case 'high':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'High Priority Cluster',
          dot: 'bg-blue-600',
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Medium Attention',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Resolved / Stable',
          dot: 'bg-emerald-500',
        };
    }
  };

  const badge = getSeverityBadge();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden transition-opacity"
      />

      {/* Drawer Container (Desktop Right Sidebar / Mobile Bottom Sheet) */}
      <aside
        ref={drawerRef}
        id="cluster-analysis-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Analysis for cluster ${cluster.issueTitle}`}
        className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[460px] lg:w-[480px] bg-[#FBFBFA] border-l border-[#E2E8F0] shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Top Header Section */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E2E8F0] sticky top-0 z-10 text-left">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${badge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
                {cluster.clusterCode}
              </span>
              <span className="text-xs font-mono text-[#64748B] bg-slate-100 px-2 py-1 rounded">
                {cluster.categoryLabel}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Analysis Drawer"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
            {cluster.issueTitle}
          </h2>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B] font-mono">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{cluster.location.sector} · {cluster.location.city}</span>
          </div>
        </div>

        {/* Scrollable Intelligence Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. AI Pattern Insight */}
          <ClusterAIInsight cluster={cluster} />

          {/* 2. Cluster Core Metrics */}
          <ClusterMetrics cluster={cluster} />

          {/* 3. Spatial Impact Radius & Exposure */}
          <ImpactRadius cluster={cluster} />

          {/* 4. Government Response & Accountability */}
          <GovernmentResponse cluster={cluster} />
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E2E8F0] flex items-center gap-3">
          <button
            onClick={handleToggleTracking}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              localTracking
                ? 'bg-blue-50 text-[#2563EB] border border-blue-200 hover:bg-blue-100'
                : 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-xs'
            }`}
          >
            {localTracking ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-[#2563EB]" />
                <span>Tracking Issue</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-blue-400" />
                <span>Track Issue</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#334155] transition-colors cursor-pointer"
            title="Share Context with Community"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {onOpenVerification && (
            <button
              onClick={() => onOpenVerification(cluster)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              title="Verify on Ground"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Verify</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
