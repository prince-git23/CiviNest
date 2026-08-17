import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  FileText,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { resolutionCases, type ResolutionCase } from '../../data/municipalMockData';

type TabId = 'pending' | 'awaiting' | 'reopened';

export const ResolutionVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('pending');

  const tabs: { id: TabId; label: string; count: number; icon?: React.ReactNode }[] = [
    { id: 'pending', label: 'Pending Resolution', count: 14 },
    { id: 'awaiting', label: 'Awaiting Verification', count: 32 },
    { id: 'reopened', label: 'Reopened', count: 3, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  const filteredCases = resolutionCases.filter((c) => {
    if (activeTab === 'pending') return c.status === 'In Progress';
    if (activeTab === 'awaiting') return c.status === 'Awaiting Verification';
    if (activeTab === 'reopened') return c.status === 'Reopened';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">Resolution & Verification</h1>
        <p className="text-sm text-[#6B7280] mt-2 max-w-2xl">
          Track the final lifecycle stages of municipal interventions. Review department actions,
          examine submitted evidence, and monitor citizen sign-offs for complete accountability.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/50'
            }`}
          >
            {tab.icon && (
              <span className={activeTab === tab.id ? 'text-white' : 'text-[#9CA3AF]'}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : tab.id === 'reopened'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white text-[#6B7280]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Cases List ── */}
      <div className="space-y-4">
        {filteredCases.map((caseItem) => (
          <CaseCard key={caseItem.id} caseData={caseItem} />
        ))}

        {filteredCases.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-sm text-[#6B7280]">
              No cases in this category at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Case Card Component ──

const CaseCard: React.FC<{ caseData: ResolutionCase }> = ({ caseData }) => {
  const progressSteps = [
    { label: 'Reported', ...caseData.progress.reported },
    { label: 'Assigned', ...caseData.progress.assigned },
    { label: 'In Progress', ...caseData.progress.inProgress },
    { label: 'Citizen Verified', ...caseData.progress.citizenVerified },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Left: Case Info (2 cols) */}
        <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-[#E5E7EB]">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex px-2.5 py-1 bg-[#F3F4F6] rounded-lg text-xs font-mono font-semibold text-[#6B7280] border border-[#E5E7EB]">
              {caseData.issueCode}
            </span>
            <button className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-[#111827] mb-2">{caseData.title}</h3>
          <p className="text-sm text-[#6B7280] mb-4">{caseData.location}</p>

          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: caseData.departmentColor + '20', color: caseData.departmentColor }}
            >
              {caseData.departmentIcon}
            </span>
            <span className="text-sm font-medium text-[#374151]">{caseData.department}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>Time in state: {caseData.timeInState}</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                caseData.status === 'Reopened' ? 'bg-red-500' :
                caseData.status === 'Awaiting Verification' ? 'bg-blue-500' :
                'bg-[#1E293B]'
              }`}
              style={{
                width:
                  caseData.status === 'Reopened'
                    ? '75%'
                    : caseData.status === 'Awaiting Verification'
                    ? '100%'
                    : '60%',
              }}
            />
          </div>
        </div>

        {/* Right: Resolution Progress (3 cols) */}
        <div className="lg:col-span-3 p-6">
          <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-5">
            Resolution Progress
          </h4>

          {/* Timeline Steps */}
          <div className="flex items-start justify-between mb-8">
            {progressSteps.map((step, i) => (
              <div key={step.label} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.done
                        ? 'bg-[#1E293B] border-[#1E293B]'
                        : step.current
                        ? 'bg-white border-[#1E293B]'
                        : 'bg-white border-[#D1D5DB]'
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : step.current ? (
                      <div className="w-3 h-3 rounded-full bg-[#1E293B]" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-[#D1D5DB]" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs mt-2 text-center ${
                      step.done || step.current
                        ? 'font-semibold text-[#111827]'
                        : 'text-[#9CA3AF]'
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Time */}
                  {step.time && (
                    <span className="text-[11px] text-[#9CA3AF] mt-0.5">{step.time}</span>
                  )}
                </div>

                {/* Connector Line */}
                {i < progressSteps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      step.done ? 'bg-[#1E293B]' : 'bg-[#E5E7EB]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Field Update + Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Latest Field Update */}
            {caseData.latestUpdate && (
              <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                <h5 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                  Latest Field Update
                </h5>
                <p className="text-sm text-[#374151] italic leading-relaxed mb-3">
                  {caseData.latestUpdate.text}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#1E293B] text-white text-[10px] font-bold flex items-center justify-center">
                    {caseData.latestUpdate.initials}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#111827]">
                      {caseData.latestUpdate.author}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF]">{caseData.latestUpdate.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Required Evidence */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <h5 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                Required Evidence
              </h5>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-[#E5E7EB] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <div className="w-14 h-14 rounded-lg bg-[#E5E7EB] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#9CA3AF]" />
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload Evidence & Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionVerification;
