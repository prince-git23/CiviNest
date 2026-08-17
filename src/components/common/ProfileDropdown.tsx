import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Award,
  FileText,
  Plus,
  Users,
  Shield,
  LogOut,
  Building2,
  Bell,
  Settings,
  Eye,
  BarChart3,
  Key,
  Lock,
  ClipboardList,
  Map,
} from 'lucide-react';
import type { AuthenticatedUser, PortalId, UserRoleId } from '../../types';

interface ProfileDropdownProps {
  user: AuthenticatedUser;
  onNavigateToResidential?: () => void;
  onNavigateToCommunity?: () => void;
  onNavigateToMunicipal?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToMyFilings?: () => void;
  onNavigateToCreateSignal?: () => void;
  onNavigateToImpact?: () => void;
  onNavigateToNotifications?: () => void;
  onSignOut?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onNavigateToResidential,
  onNavigateToCommunity,
  onNavigateToMunicipal,
  onNavigateToAdmin,
  onNavigateToMyFilings,
  onNavigateToCreateSignal,
  onNavigateToImpact,
  onNavigateToNotifications,
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => setIsOpen(false);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getSubtitle = () => {
    if (user.department) return user.department;
    if (user.role === 'admin') return 'System Administrator';
    return user.ward ? `${user.ward} • ${user.city}` : user.locality;
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'municipal_officer':
        return 'Municipal Officer';
      case 'department_head':
        return 'Department Head';
      case 'community_rep':
        return 'Community Rep.';
      case 'admin':
        return 'Administrator';
      default:
        return undefined;
    }
  };

  const roleLabel = getRoleLabel();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full transition-all duration-150 cursor-pointer border border-[#E5E7EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36]"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-semibold tracking-wider uppercase text-[#111827] font-mono">
          {user.name.toUpperCase()}
        </span>
        <div className="w-6 h-6 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
          {getInitials(user.name)}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Profile Header */}
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate">{user.name}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{getSubtitle()}</p>
                {roleLabel && (
                  <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#0F1E36]/5 text-[#0F1E36] border border-[#0F1E36]/10">
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Role-Specific Menu Items */}
          <div className="py-1">
            {/* ── RESIDENT items ── */}
            {(user.role === 'resident' || user.role === 'community_rep') && (
              <>
                {user.impactScore !== undefined && onNavigateToImpact && (
                  <DropdownItem
                    icon={<Award className="w-3.5 h-3.5 text-blue-600" />}
                    label="Civic Impact Score"
                    trailing={
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] px-1.5 py-0.5 rounded">
                        {user.impactScore} pts
                      </span>
                    }
                    onClick={() => { close(); onNavigateToImpact(); }}
                  />
                )}
                {onNavigateToMyFilings && (
                  <DropdownItem
                    icon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
                    label="My Filings & History"
                    onClick={() => { close(); onNavigateToMyFilings(); }}
                  />
                )}
                {onNavigateToCreateSignal && (
                  <DropdownItem
                    icon={<Plus className="w-3.5 h-3.5 text-blue-600" />}
                    label="File New Civic Signal"
                    variant="primary"
                    onClick={() => { close(); onNavigateToCreateSignal(); }}
                  />
                )}
              </>
            )}

            {/* ── COMMUNITY REP additional items ── */}
            {user.role === 'community_rep' && user.hasCommunityRepRole && onNavigateToCommunity && (
              <DropdownItem
                icon={<Users className="w-3.5 h-3.5 text-[#2563EB]" />}
                label="Community Representative Portal"
                variant="role"
                onClick={() => { close(); onNavigateToCommunity(); }}
              />
            )}

            {/* ── MUNICIPAL OFFICER / DEPARTMENT HEAD items ── */}
            {(user.role === 'municipal_officer' || user.role === 'department_head') && (
              <>
                {onNavigateToMunicipal && user.currentPortal !== 'municipal' && (
                  <DropdownItem
                    icon={<Shield className="w-3.5 h-3.5 text-[#0F1E36]" />}
                    label="Municipal Command Center"
                    variant="role"
                    onClick={() => { close(); onNavigateToMunicipal(); }}
                  />
                )}
                {user.currentPortal === 'municipal' && onNavigateToMyFilings && (
                  <DropdownItem
                    icon={<ClipboardList className="w-3.5 h-3.5 text-slate-500" />}
                    label="My Assigned Issues"
                    onClick={() => { close(); onNavigateToMyFilings(); }}
                  />
                )}
                {user.currentPortal === 'municipal' && onNavigateToMunicipal && (
                  <DropdownItem
                    icon={<Building2 className="w-3.5 h-3.5 text-[#0F1E36]" />}
                    label="Department Operations"
                    onClick={() => { close(); onNavigateToMunicipal(); }}
                  />
                )}
                {onNavigateToNotifications && (
                  <DropdownItem
                    icon={<Bell className="w-3.5 h-3.5 text-slate-400" />}
                    label="Notifications"
                    onClick={() => { close(); onNavigateToNotifications(); }}
                  />
                )}
              </>
            )}

            {/* ── ADMIN items ── */}
            {user.role === 'admin' && (
              <>
                {onNavigateToAdmin && user.currentPortal !== 'admin' && (
                  <DropdownItem
                    icon={<Settings className="w-3.5 h-3.5 text-[#0F1E36]" />}
                    label="Administration Command Center"
                    variant="role"
                    onClick={() => { close(); onNavigateToAdmin(); }}
                  />
                )}
                <DropdownItem
                  icon={<Users className="w-3.5 h-3.5 text-slate-500" />}
                  label="User Management"
                  onClick={() => { close(); }}
                />
                <DropdownItem
                  icon={<Key className="w-3.5 h-3.5 text-slate-500" />}
                  label="Roles & Permissions"
                  onClick={() => { close(); }}
                />
                <DropdownItem
                  icon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                  label="AI Governance"
                  onClick={() => { close(); }}
                />
                <DropdownItem
                  icon={<Lock className="w-3.5 h-3.5 text-slate-500" />}
                  label="Security & Audit"
                  onClick={() => { close(); }}
                />
                <DropdownItem
                  icon={<Settings className="w-3.5 h-3.5 text-slate-500" />}
                  label="System Settings"
                  onClick={() => { close(); }}
                />
              </>
            )}
          </div>

          {/* Footer Actions — same for all roles */}
          <div className="border-t border-[#F3F4F6] pt-1">
            {onSignOut && (
              <DropdownItem
                icon={<LogOut className="w-3.5 h-3.5 text-red-500" />}
                label="Sign Out"
                variant="danger"
                onClick={() => { close(); onSignOut(); }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Dropdown Item Sub-component ──

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  variant?: 'default' | 'primary' | 'role' | 'danger';
  onClick: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ icon, label, trailing, variant = 'default', onClick }) => {
  const colorClasses = {
    default: 'text-[#374151] hover:bg-[#F9FAFB]',
    primary: 'text-[#2563EB] font-medium hover:bg-blue-50',
    role: 'text-[#0F1E36] font-semibold hover:bg-slate-50',
    danger: 'text-[#DC2626] hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${colorClasses[variant]}`}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      {trailing}
    </button>
  );
};

export default ProfileDropdown;
