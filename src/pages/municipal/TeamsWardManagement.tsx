import React, { useState } from 'react';
import {
  Plus,
  Settings,
  ChevronRight,
  MapPin,
  Zap,
  Droplets,
  Wrench,
  Download,
  Activity,
  Users,
  Clock,
} from 'lucide-react';
import { wards, fieldTeams, auditLog, type WardData, type FieldTeam } from '../../data/municipalMockData';

export const TeamsWardManagement: React.FC = () => {
  const [slaHours, setSlaHours] = useState(48);
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  const getStatusBarWidth = (activeIssues: number) => {
    const max = Math.max(...wards.map((w) => w.activeIssues));
    return `${(activeIssues / max) * 100}%`;
  };

  const getStatusColor = (status: WardData['status']) => {
    switch (status) {
      case 'NOMINAL':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'ELEVATED':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  const getAuditDotColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-500';
      case 'officer':
        return 'bg-gray-400';
      case 'alert':
        return 'bg-red-500';
      case 'admin':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getTeamIcon = (dept: string) => {
    if (dept.includes('Sanitation')) return <Droplets className="w-4 h-4 text-blue-500" />;
    if (dept.includes('Electrical')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (dept.includes('Roads')) return <Wrench className="w-4 h-4 text-slate-500" />;
    return <Activity className="w-4 h-4 text-[#6B7280]" />;
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-[#111827]" />
          <h1 className="text-2xl font-bold text-[#111827]">Administration & Teams</h1>
        </div>
        <p className="text-sm text-[#6B7280] max-w-2xl">
          Manage ward assignments, monitor field unit deployments, and review system audit logs.
          Configure operational thresholds to maintain service level agreements.
        </p>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Ward Allocations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#6B7280]" />
              <div>
                <h2 className="text-base font-bold text-[#111827]">Ward Allocations</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Current deployment status across municipal zones.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Reassign Zone
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            <div>Ward ID</div>
            <div>Lead Officer</div>
            <div>Active Issues</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#F3F4F6]">
            {wards.map((ward) => (
              <div
                key={ward.id}
                className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors cursor-pointer"
              >
                <div>
                  <span className="text-sm font-semibold text-[#111827]">{ward.id}</span>
                  <span className="text-xs text-[#6B7280] block">({ward.name})</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#1E293B] text-white text-[11px] font-bold flex items-center justify-center">
                    {ward.leadInitials}
                  </span>
                  <span className="text-sm text-[#374151]">{ward.leadOfficer}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        ward.status === 'CRITICAL'
                          ? 'bg-red-500'
                          : ward.status === 'ELEVATED'
                          ? 'bg-amber-500'
                          : 'bg-[#1E293B]'
                      }`}
                      style={{ width: getStatusBarWidth(ward.activeIssues) }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">
                    {ward.activeIssues}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getStatusColor(
                      ward.status
                    )}`}
                  >
                    {ward.status}
                  </span>
                </div>

                <div className="text-right">
                  <button className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1/3: Operations Config + Active Deployment */}
        <div className="space-y-6">
          {/* Operations Config */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">Operations Config</h3>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Auto-escalation SLA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111827]">Auto-escalation SLA</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSlaHours(Math.max(12, slaHours - 12))}
                    className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="w-14 text-center text-sm font-bold text-[#111827]">
                    {slaHours}h
                  </span>
                  <button
                    onClick={() => setSlaHours(Math.min(96, slaHours + 12))}
                    className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Critical Alerts Toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#111827]">Critical Alerts</p>
                <button
                  onClick={() => setCriticalAlerts(!criticalAlerts)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    criticalAlerts ? 'bg-[#1E293B]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      criticalAlerts ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Active Deployment Map */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="relative h-48 bg-[#E8F0E8] flex items-center justify-center">
              {/* Simplified map */}
              <div className="absolute inset-0 opacity-30">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="200" y1="0" x2="200" y2="200" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="100" y1="0" x2="100" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                </svg>
              </div>

              {/* Deployment Markers */}
              <div className="absolute top-1/3 left-1/3">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-md" />
              </div>
              <div className="absolute top-1/2 left-1/2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
              </div>
              <div className="absolute bottom-1/3 right-1/3">
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md" />
              </div>

              {/* Label */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#E5E7EB]">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  Active Deployment
                </p>
                <p className="text-sm font-bold text-[#111827]">Zone 4 Aggregation</p>
              </div>

              <button className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Field Units + System Audit Log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Units */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Field Units</h3>
            </div>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {fieldTeams.map((team) => (
              <div
                key={team.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center border border-[#E5E7EB]">
                    {getTeamIcon(team.department)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">{team.name}</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {team.status === 'Standby'
                        ? `Status: ${team.status}`
                        : `Focus: ${team.focus} • ${team.activeTasks} Active task${team.activeTasks !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#6B7280] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* System Audit Log */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">System Audit Log</h3>
            </div>
            <button className="text-xs font-semibold text-[#2563EB] hover:underline">
              Export CSV
            </button>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {auditLog.map((entry, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-start gap-4">
                  {/* Time */}
                  <div className="w-20 shrink-0">
                    {entry.time && (
                      <span className="text-xs font-medium text-[#6B7280]">{entry.time}</span>
                    )}
                    <span className="text-[11px] text-[#9CA3AF] block">{entry.date}</span>
                  </div>

                  {/* Dot */}
                  <div className="mt-1.5 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full block ${getAuditDotColor(entry.type)}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#374151]">
                      <span className="font-semibold text-[#111827]">{entry.actor}</span>{' '}
                      {entry.action}{' '}
                      <code className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-xs font-mono font-semibold text-[#111827]">
                        {entry.target}
                      </code>
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{entry.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsWardManagement;
