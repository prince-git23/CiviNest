import React from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  ThumbsUp,
  Share2,
} from 'lucide-react';
import { DashboardReportItem, SpatialMapNode } from '../../types';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: DashboardReportItem | null;
  mapNode?: SpatialMapNode | null;
  onConfirmResolution?: (id: string) => void;
  onViewReport?: (reportId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  mapNode,
  onConfirmResolution,
  onViewReport,
}) => {
  if (!isOpen || (!report && !mapNode)) return null;

  const title = report?.title || mapNode?.title || 'Civic Issue Details';
  const reportNumber = report?.reportNumber || (mapNode ? `#NODE-${mapNode.id.slice(-4).toUpperCase()}` : '#CV-GEN');
  const location = report?.location || `${mapNode?.sector} (${mapNode?.distance})`;
  const status = report?.status || mapNode?.status || 'Under Review';
  const description =
    report?.description || mapNode?.description || 'Citizen verified civic signal logged in local municipal queue.';
  const assigned = mapNode?.assignedTo || 'Municipal Ward Works & Electrical Cell';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-start justify-between bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#1E40AF]">
                {reportNumber}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0F1E36]">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Location & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10.5px] font-mono uppercase text-[#6B7280] block">Location</span>
                <span className="font-semibold text-[#111827]">{location}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs">
              <Building className="w-4 h-4 text-[#4B5563] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10.5px] font-mono uppercase text-[#6B7280] block">Assigned Cell</span>
                <span className="font-semibold text-[#111827]">{assigned}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase text-[#6B7280] mb-1.5">
              Citizen Report Narrative
            </h4>
            <p className="text-xs sm:text-sm text-[#374151] leading-relaxed p-3 bg-white rounded-lg border border-[#F3F4F6]">
              {description}
            </p>
          </div>

          {/* Resolution Timeline */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase text-[#6B7280] mb-2.5">
              Escalation & Action Audit Log
            </h4>
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
              {(report?.timeline || [
                { status: 'Report Lodged', timestamp: 'Yesterday, 08:30 AM', note: 'AI clustered with 4 neighbor signals.' },
                { status: 'Municipal Dispatch', timestamp: 'Today, 10:15 AM', note: 'Technician team assigned for inspection.' },
              ]).map((t, idx) => (
                <div key={idx} className="relative flex items-start gap-3.5 pl-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#2563EB] ring-4 ring-white shrink-0 mt-0.5 flex items-center justify-center text-[9px] text-white font-bold">
                    ✓
                  </div>
                  <div className="flex-1 bg-[#F9FAFB] p-2.5 rounded-lg border border-[#E5E7EB] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111827]">{t.status}</span>
                      <span className="text-[10px] font-mono text-[#9CA3AF]">{t.timestamp}</span>
                    </div>
                    <p className="text-[11.5px] text-[#6B7280] mt-0.5">{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              if (onConfirmResolution && report) onConfirmResolution(report.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-[#0F1E36] hover:bg-[#1E293B] text-white rounded-lg transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirm Resolution as Citizen</span>
          </button>

          <div className="flex items-center gap-2">
            {onViewReport && report && (
              <button
                onClick={() => onViewReport(report.id)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-white hover:bg-gray-50 text-[#2563EB] border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                View Full Report
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs font-semibold text-[#4B5563] hover:text-[#111827] px-3 py-2 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
