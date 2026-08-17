import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import {
  Calendar,
  Download,
  Grid3X3,
  List,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { departments, fieldTeams, type DepartmentData } from '../../data/municipalMockData';

export const DepartmentOperations: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [timeRange, setTimeRange] = useState('7d');

  const totalActive = departments.reduce((sum, d) => sum + d.activeIssues, 0);
  const totalCritical = departments.reduce((sum, d) => sum + d.criticalIssues, 0);

  const summaryMetrics = [
    {
      label: 'TOTAL ACTIVE ISSUES',
      value: totalActive.toLocaleString(),
      change: '↑ 12%',
      changeColor: 'text-emerald-600',
      icon: <Grid3X3 className="w-5 h-5 text-[#6B7280]" />,
    },
    {
      label: 'CRITICAL SEVERITY',
      value: totalCritical.toLocaleString(),
      change: '↑ 4%',
      changeColor: 'text-red-500',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    },
    {
      label: 'AVG RESOLUTION TIME',
      value: '48h',
      change: '↑ 2h',
      changeColor: 'text-red-500',
      icon: <Clock className="w-5 h-5 text-[#6B7280]" />,
    },
    {
      label: 'FIELD TEAM CAPACITY',
      value: '78%',
      change: '',
      changeColor: '',
      icon: <Users className="w-5 h-5 text-[#6B7280]" />,
      isCapacity: true,
    },
  ];

  const getStatusColor = (status: DepartmentData['status']) => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Stable':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Warning':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Critical':
        return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  const getSlaBarColor = (compliance: number) => {
    if (compliance >= 90) return 'bg-emerald-500';
    if (compliance >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // GSAP card entrance animations
  useEffect(() => {
    const cards = document.querySelectorAll('[data-animate="card"]');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Department Operations</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Real-time oversight of municipal departments. Monitor SLA compliance, critical
            bottlenecks, and field team deployment across all wards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <Calendar className="w-4 h-4" />
            Last 7 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric) => (
          <div key={metric.label} data-animate="card" className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                {metric.label}
              </span>
              {metric.icon}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#111827]">{metric.value}</span>
              {metric.change && (
                <span className={`text-xs font-semibold ${metric.changeColor}`}>
                  {metric.change}
                </span>
              )}
            </div>
            {metric.isCapacity && (
              <div className="mt-3 w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div className="h-full bg-[#1E293B] rounded-full" style={{ width: '78%' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Department Status Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">Department Status</h2>
          <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              data-animate="card"
              className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dept.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">{dept.name}</h3>
                    <p className="text-[11px] text-[#9CA3AF]">Dept ID: {dept.deptId}</p>
                  </div>
                </div>
                <button className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6]">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#F9FAFB] rounded-lg p-3">
                  <p className="text-[11px] text-[#6B7280] mb-1">Active</p>
                  <p className="text-xl font-bold text-[#111827]">{dept.activeIssues}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-[11px] text-red-600 mb-1 font-medium">SLA Risk</p>
                  <p className="text-xl font-bold text-red-700">{dept.slaRisk}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#6B7280]">Resolution Rate</span>
                  <span className="text-xs font-semibold text-[#111827]">
                    {dept.resolutionRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dept.resolutionRate >= 80
                        ? 'bg-emerald-500'
                        : dept.resolutionRate >= 60
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.resolutionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Grid: Operational Workload + Active Field Teams ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Workload Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">Operational Workload</h3>
            <button className="text-xs font-semibold text-[#2563EB] hover:underline">
              View Full Report
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
            <div>Department</div>
            <div className="text-right">Avg Res Time</div>
            <div className="text-right">Verification Rate</div>
            <div className="text-right">Status</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#F3F4F6]">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="grid grid-cols-4 gap-4 px-5 py-3.5 items-center hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      dept.status === 'Optimal'
                        ? 'bg-emerald-500'
                        : dept.status === 'Stable'
                        ? 'bg-blue-500'
                        : dept.status === 'Warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-[#374151]">{dept.name}</span>
                </div>
                <div
                  className={`text-right text-sm font-medium ${
                    dept.avgResolutionTime.includes('72h')
                      ? 'text-red-600'
                      : 'text-[#374151]'
                  }`}
                >
                  {dept.avgResolutionTime}
                </div>
                <div className="text-right text-sm text-[#374151]">{dept.verificationRate}%</div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getStatusColor(
                      dept.status
                    )}`}
                  >
                    {dept.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Field Teams */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Active Field Teams</h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              Live capacity and deployment status across all municipal wards.
            </p>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {fieldTeams.slice(0, 3).map((team) => (
              <div key={team.id} className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">{team.name}</h4>
                    <p className="text-xs text-[#6B7280] mt-0.5">{team.focus}</p>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 ${
                      team.status === 'Active'
                        ? 'bg-emerald-500'
                        : team.status === 'En Route'
                        ? 'bg-blue-500'
                        : team.status === 'Standby'
                        ? 'bg-gray-400'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {team.members.map((m, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">
                    Capacity
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      team.activeTasks >= team.maxTasks && team.maxTasks > 0
                        ? 'text-red-600'
                        : 'text-[#374151]'
                    }`}
                  >
                    {team.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#E5E7EB]">
            <button className="w-full py-2 text-sm font-semibold text-[#374151] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors">
              Manage Teams
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOperations;
