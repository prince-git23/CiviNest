import React, { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  Building2,
  BadgeCheck,
  Award,
  ShieldCheck,
  Clock,
  FileText,
  CheckCircle2,
  Settings,
  Mail,
  Phone,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { getCommunityProfile } from '../../services/communityApi';
import type { CommunityProfile } from '../../services/communityApi';
import type { Permission } from '../../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../../types';

interface RepresentativeProfileProps {
  onNavigateToSettings?: () => void;
}

const PERMISSION_LABELS: Partial<Record<Permission, string>> = {
  view_residential: 'View resident reports',
  file_signal: 'File civic signals',
  verify_resolution: 'Verify resolutions',
  view_community: 'View community data',
  manage_community: 'Manage community issues',
};

export const RepresentativeProfile: React.FC<RepresentativeProfileProps> = ({ onNavigateToSettings }) => {
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { profile } = await getCommunityProfile();
      setProfile(profile);
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const permissions = ROLE_DEFAULT_PERMISSIONS.community_rep;

  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <div className="h-10 rounded-xl bg-[#E5E7EB]/60 animate-pulse w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
          <div className="h-80 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-bold text-[#0F1E36] mb-1">Unable to load profile</h2>
        <p className="text-sm text-[#6B7280] mb-6">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F1E36] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const { user, contribution } = profile;
  const joined = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Profile
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Your authenticated Community Representative profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#0F1E36] text-white flex items-center justify-center text-xl font-bold shrink-0">
              {user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#0F1E36]">{user.name}</h2>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-1 rounded-full bg-[#0F1E36]/5 text-[#0F1E36] border border-[#0F1E36]/10">
                  <ShieldCheck className="w-3 h-3" />
                  Community Representative
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                {[user.ward, user.locality].filter(Boolean).join(' · ')} {user.city ? `· ${user.city}` : ''}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-1">
                <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
                {user.community || 'No community assigned'}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <BadgeCheck className="w-3.5 h-3.5" />
              {user.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          {/* Contact / membership details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
              <Mail className="w-4 h-4 text-slate-500" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280]">Email</p>
                <p className="text-xs font-semibold text-[#111827] truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
              <Phone className="w-4 h-4 text-slate-500" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280]">Phone</p>
                <p className="text-xs font-semibold text-[#111827]">{user.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
              <Clock className="w-4 h-4 text-slate-500" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280]">Member Since</p>
                <p className="text-xs font-semibold text-[#111827]">{joined}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
              <User className="w-4 h-4 text-slate-500" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B7280]">Ward / Pincode</p>
                <p className="text-xs font-semibold text-[#111827]">
                  {user.ward || '—'}{user.pincode ? ` · ${user.pincode}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Role permissions */}
          <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827] mb-3">Role Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {PERMISSION_LABELS[perm] ?? perm}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#6B7280] mt-3">
              Permissions granted for the Community Representative role in {user.community || 'your community'}.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contribution Summary */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-[#0F1E36]">Contribution</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F9FAFB] text-center">
                <p className="text-2xl font-bold font-mono text-[#0F1E36]">{contribution.aggregationsCreated}</p>
                <p className="text-[10px] text-[#6B7280]">Aggregations</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-center">
                <p className="text-2xl font-bold font-mono text-emerald-600">{contribution.communityConfirmations}</p>
                <p className="text-[10px] text-emerald-700">Community Confirmations</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-center">
                <p className="text-2xl font-bold font-mono text-blue-600">{contribution.registeredMembers}</p>
                <p className="text-[10px] text-blue-700">Registered Members</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-center">
                <p className="text-2xl font-bold font-mono text-purple-600">{contribution.activeContributors}</p>
                <p className="text-[10px] text-purple-700">Active Contributors</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
            </div>
          </div>

          {/* Community status */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-sm font-semibold text-[#111827]">Representing</h3>
            </div>
            <p className="text-sm font-semibold text-[#111827]">{user.community || 'No community assigned'}</p>
            <p className="text-[11px] text-[#6B7280] mt-1">
              {contribution.registeredMembers} registered residents · {contribution.activeContributors} active contributors
            </p>
            <p className="text-[11px] text-[#6B7280] mt-2">
              {contribution.activeIssues} active issues in scope
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeProfile;
