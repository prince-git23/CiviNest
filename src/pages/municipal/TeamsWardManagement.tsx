import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Settings,
  ChevronRight,
  MapPin,
  Zap,
  Droplets,
  Wrench,
  Activity,
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { getMunicipalSpatial, getMunicipalTeams, getMunicipalAuditLog, type WardSummary, type FieldTeam } from '../../services/municipalApi';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport, DeploymentPoint } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';

export const TeamsWardManagement: React.FC = () => {
  const [slaHours, setSlaHours] = useState(48);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [spatial, teamRes, audit] = await Promise.all([getMunicipalSpatial(), getMunicipalTeams(), getMunicipalAuditLog(12)]);
      setWards(spatial.wards);
      setTeams(teamRes);
      setAuditLog(audit);
    } catch (e: any) {
      setError(e?.message || 'Failed to load teams and wards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getStatusBarWidth = (activeIssues: number) => {
    const max = Math.max(1, ...wards.map((w) => w.activeIssues));
    return `${(activeIssues / max) * 100}%`;
  };

  const getStatusColor = (status: WardSummary['status']) => {
    switch (status) {
      case 'NOMINAL': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'CRITICAL': return 'bg-red-50 text-red-700 border border-red-200';
      case 'ELEVATED': return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  const getAuditDotColor = (action: string) => {
    if (action.includes('RESOLUTION') || action.includes('REOPEN')) return 'bg-red-500';
    if (action.includes('ASSIGN')) return 'bg-blue-500';
    if (action.includes('PRIORITY')) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  const getTeamIcon = (dept: string) => {
    if (dept.includes('Sanitation')) return <Droplets className="w-4 h-4 text-blue-500" />;
    if (dept.includes('Electrical') || dept.includes('Lighting')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (dept.includes('Roads')) return <Wrench className="w-4 h-4 text-slate-500" />;
    return <Activity className="w-4 h-4 text-[#6B7280]" />;
  };

  const deployments: DeploymentPoint[] = teams.map((t) => ({
    id: t.id,
    teamName: t.name,
    department: t.department,
    latitude: 21.1458,
    longitude: 79.0882,
    ward: t.ward,
    status: (t.status.toLowerCase().replace(/\s+/g, '-')) as DeploymentPoint['status'],
    taskCount: t.activeTasks,
  }));

  const mapViewport: MapViewport = { ...DEFAULT_VIEWPORT, zoom: 12 };

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
        </p>
      </div>

      {error && (
        <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">Retry</button>
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Ward Allocations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#6B7280]" />
              <div>
                <h2 className="text-base font-bold text-[#111827]">Ward Allocations</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Current deployment status across municipal zones.</p>
              </div>
            </div>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            <div>Ward</div>
            <div>Active Issues</div>
            <div>Over SLA</div>
            <div className="text-right">Status</div>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {wards.map((ward) => (
              <div key={ward.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-[#111827]">{ward.name}</span>
                  <span className="text-xs text-[#6B7280] block">{ward.resolvedIssues} resolved</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ward.status === 'CRITICAL' ? 'bg-red-500' : ward.status === 'ELEVATED' ? 'bg-amber-500' : 'bg-[#1E293B]'}`}
                      style={{ width: getStatusBarWidth(ward.activeIssues) }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">{ward.activeIssues}</span>
                </div>
                <div>
                  <span className={`text-sm font-semibold ${ward.overSla > 0 ? 'text-red-600' : 'text-[#374151]'}`}>{ward.overSla}</span>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getStatusColor(ward.status)}`}>{ward.status}</span>
                </div>
              </div>
            ))}
            {wards.length === 0 && <div className="p-10 text-center text-xs text-[#6B7280]">No ward data available.</div>}
          </div>
        </div>

        {/* Right 1/3: Operations Config + Active Deployment */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">Operations Config</h3>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#111827]">Auto-escalation SLA</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSlaHours(Math.max(12, slaHours - 12))} className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors text-sm font-bold">−</button>
                  <span className="w-14 text-center text-sm font-bold text-[#111827]">{slaHours}h</span>
                  <button onClick={() => setSlaHours(Math.min(96, slaHours + 12))} className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors text-sm font-bold">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#111827]">Critical Alerts</p>
                <button
                  onClick={() => setCriticalAlerts(!criticalAlerts)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${criticalAlerts ? 'bg-[#1E293B]' : 'bg-[#D1D5DB]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${criticalAlerts ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="relative h-48">
              <CivicMap viewport={mapViewport} deployments={deployments} className="w-full h-full" style={{ height: 192 }} compact />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Field Units + System Audit Log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Field Units</h3>
            </div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {teams.map((team) => (
              <div key={team.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center border border-[#E5E7EB]">
                    {getTeamIcon(team.department)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">{team.name}</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {team.department} · {team.ward}
                      {team.activeTasks > 0 ? ` · ${team.activeTasks} active task${team.activeTasks !== 1 ? 's' : ''}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                      team.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : team.status === 'En Route' ? 'bg-blue-50 text-blue-700' : team.status === 'Standby' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {team.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#6B7280] transition-colors" />
                </div>
              </div>
            ))}
            {teams.length === 0 && <div className="p-8 text-center text-xs text-[#6B7280]">No active teams found.</div>}
          </div>
        </div>

        {/* System Audit Log */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">System Audit Log</h3>
            </div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {auditLog.map((entry, i) => (
              <div key={entry.id || i} className="px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 shrink-0">
                    <span className="text-xs font-medium text-[#6B7280]">
                      {entry.date ? new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] block">{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="mt-1.5 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full block ${getAuditDotColor(entry.action)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#374151]">
                      <span className="font-semibold text-[#111827]">{entry.actor}</span> {entry.action.replace(/_/g, ' ').toLowerCase()}{' '}
                      <code className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-xs font-mono font-semibold text-[#111827]">{entry.target}</code>
                    </p>
                    {entry.reason && <p className="text-xs text-[#6B7280] mt-0.5">{entry.reason}</p>}
                  </div>
                </div>
              </div>
            ))}
            {auditLog.length === 0 && <div className="p-8 text-center text-xs text-[#6B7280]">No audit entries yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsWardManagement;
