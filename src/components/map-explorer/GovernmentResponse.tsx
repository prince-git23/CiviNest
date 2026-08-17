import React from 'react';
import { Building2, User, FileText, CheckCircle2, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { MapClusterItem } from '../../services/mapExplorerService';

interface GovernmentResponseProps {
  cluster: MapClusterItem;
}

export const GovernmentResponse: React.FC<GovernmentResponseProps> = ({ cluster }) => {
  const agency = cluster.responsibleAgency;

  const timelineSteps = [
    {
      label: 'Signal Aggregated',
      status: 'completed',
      time: cluster.firstReportedTime,
      desc: 'Quorum reached & AI cluster formed',
    },
    {
      label: 'Work Order Dispatched',
      status: 'completed',
      time: '24h ago',
      desc: `Ref: ${agency.workOrderNumber || 'NMC-WO-2026'}`,
    },
    {
      label: 'Field Crew Onsite',
      status: cluster.statusType === 'resolved' ? 'completed' : 'in_progress',
      time: 'Today',
      desc: agency.status,
    },
    {
      label: 'Citizen Verification Quorum',
      status: cluster.statusType === 'resolved' ? 'completed' : 'pending',
      time: cluster.statusType === 'resolved' ? 'Confirmed' : 'Pending',
      desc: 'Closed by community consensus',
    },
  ];

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
          Government Response & Accountability
        </span>
        {agency.workOrderNumber && (
          <span className="text-[10px] font-mono font-semibold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {agency.workOrderNumber}
          </span>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        {/* Department Info */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F172A]">{agency.department}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {agency.contactOfficer}
              </span>
            </div>
          </div>
        </div>

        {/* Current Dispatch Status Banner */}
        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E40AF]">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{agency.status}</span>
          </div>
        </div>

        {/* Accountability Timeline */}
        <div className="pt-2 space-y-2 border-t border-slate-100">
          <span className="text-[10px] font-mono font-semibold text-[#94A3B8] uppercase block">
            Resolution Pipeline
          </span>
          <div className="space-y-2">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <div className="mt-0.5">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : step.status === 'in_progress' ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold text-[11px] ${
                        step.status === 'completed'
                          ? 'text-[#0F172A]'
                          : step.status === 'in_progress'
                          ? 'text-blue-700 font-bold'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">{step.time}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
