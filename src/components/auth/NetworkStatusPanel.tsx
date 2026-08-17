import React from 'react';
import { Activity, Radio, Shield, Layers, RefreshCw } from 'lucide-react';
import { UserRoleConfig } from '../../types';
import { USER_ROLES } from './rolesData';

interface NetworkStatusPanelProps {
  activeRole: UserRoleConfig | null;
  onSelectRole: (role: UserRoleConfig) => void;
  onResetView: () => void;
}

export const NetworkStatusPanel: React.FC<NetworkStatusPanelProps> = ({
  activeRole,
  onSelectRole,
  onResetView,
}) => {
  return (
    <div className="bg-[#0F1E36]/85 backdrop-blur-md border border-slate-700/60 text-white p-4 sm:p-5 rounded-2xl shadow-2xl max-w-sm w-full transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200">
            CIVINEST MESH ACTIVE
          </span>
        </div>

        <button
          type="button"
          onClick={onResetView}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
          title="Reset Camera Perspective"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="text-[10.5px]">Reset</span>
        </button>
      </div>

      {/* Perspective Info */}
      <div className="py-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#60A5FA] block mb-0.5">
          {activeRole ? activeRole.perspectiveBadge : 'System Overview Perspective'}
        </span>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {activeRole
            ? activeRole.perspectiveHeadline
            : 'Explore how citizen signals, neighborhood clusters, and municipal response integrate in real-time.'}
        </p>
      </div>

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-t border-slate-700/50">
        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Connected Nodes</span>
          <span className="text-sm font-semibold text-white font-mono">48 Wards</span>
        </div>
        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Active Signals</span>
          <span className="text-sm font-semibold text-emerald-400 font-mono">1,420 Ingested</span>
        </div>
        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Cluster Precision</span>
          <span className="text-sm font-semibold text-blue-400 font-mono">99.1% Verified</span>
        </div>
        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Routing SLA</span>
          <span className="text-sm font-semibold text-amber-300 font-mono">&lt; 0.18s</span>
        </div>
      </div>

      {/* Quick Perspective Switching Chips */}
      <div className="pt-2 border-t border-slate-700/60">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
          Perspective Mode:
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {USER_ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role)}
              className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-all text-left truncate cursor-pointer ${
                activeRole?.id === role.id
                  ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {role.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusPanel;
