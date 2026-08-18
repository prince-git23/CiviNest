import type { DiscussionData, DiscussionFacetsData } from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Community Discussion configuration
//
// NO production data lives here. Counts (facets) come from the backend
// (GET /api/resident/discussions), which aggregates the actual Discussion
// collection. This file only defines the canonical category taxonomy so the
// UI and backend stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

export interface DiscussionCategoryConfig {
  id: string;
  label: string;
  icon: 'all' | 'water' | 'roads' | 'lighting' | 'sanitation' | 'safety' | 'environment' | 'community';
}

export const DISCUSSION_CATEGORIES: DiscussionCategoryConfig[] = [
  { id: 'all', label: 'All Discussions', icon: 'all' },
  { id: 'water_supply', label: 'Water Supply', icon: 'water' },
  { id: 'roads', label: 'Roads & Transport', icon: 'roads' },
  { id: 'street_lighting', label: 'Street Lighting', icon: 'lighting' },
  { id: 'sanitation', label: 'Sanitation', icon: 'sanitation' },
  { id: 'public_safety', label: 'Public Safety', icon: 'safety' },
  { id: 'environment', label: 'Environment', icon: 'environment' },
  { id: 'community', label: 'Community', icon: 'community' },
];

/** Human-readable label for a backend category key. */
export function discussionCategoryLabel(category: string): string {
  const found = DISCUSSION_CATEGORIES.find((c) => c.id === category);
  return found?.label || 'Other';
}

/** Read a facet count for a category key (or the total for 'all'). */
export function facetCount(facets: DiscussionFacetsData | null, categoryId: string): number {
  if (!facets) return 0;
  if (categoryId === 'all') return facets.all;
  const value = (facets as unknown as Record<string, unknown>)[categoryId];
  return typeof value === 'number' ? value : 0;
}

export interface DiscussionStatusConfig {
  id: string;
  label: string;
}

export const DISCUSSION_STATUSES: DiscussionStatusConfig[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'OPEN', label: 'Open' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'CLOSED', label: 'Closed' },
];

export function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export type { DiscussionData };
