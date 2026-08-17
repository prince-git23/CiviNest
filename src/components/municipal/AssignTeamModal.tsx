import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Shield,
  Clock,
  Send,
  CheckCircle2,
  Users,
  Radio,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { MunicipalIssueItem } from '../../types';

interface AssignTeamModalProps {
  isOpen: boolean;
  issue: MunicipalIssueItem | null;
  onClose: () => void;
  onConfirmDispatch: (
    issueId: string,
    teamData: {
      teamName: string;
      leadEngineer: string;
      personnelCount: number;
      contactRadio: string;
      notes?: string;
    }
  ) => void;
}

export const AssignTeamModal: React.FC<AssignTeamModalProps> = ({
  isOpen,
  issue,
  onClose,
  onConfirmDispatch,
}) => {
  if (!isOpen || !issue) return null;

  // Department-specific crew presets
  const crewPresets: Record<
    string,
    { name: string; lead: string; personnel: number; radio: string }[]
  > = {
    Electricity: [
      {
        name: 'Rapid Electrical Unit 4 (Substation Cell)',
        lead: 'Er. S. Bhende',
        personnel: 5,
        radio: 'CH-1 ELEC DISPATCH',
      },
      {
        name: 'Night Streetlight Grid Repair Crew 2',
        lead: 'M. S. Deshmukh',
        personnel: 4,
        radio: 'CH-1 ELEC AUX',
      },
    ],
    Water: [
      {
        name: 'Water Works Heavy Emergency Crew 3',
        lead: 'Er. Rajesh Patil',
        personnel: 8,
        radio: 'CH-4 WATER DISPATCH',
      },
      {
        name: 'Pipeline Acoustic Leak Detection Squad',
        lead: 'Anil Kulkarni',
        personnel: 3,
        radio: 'CH-4 WATER LAB',
      },
    ],
    Roads: [
      {
        name: 'PWD Rapid Asphalt Patching Unit 7',
        lead: 'Er. Nitin Shinde',
        personnel: 6,
        radio: 'CH-3 PWD ROADS',
      },
      {
        name: 'Structural Bridge & Culvert Inspection Team',
        lead: 'Dr. V. Rao',
        personnel: 4,
        radio: 'CH-3 PWD STRUCT',
      },
    ],
    Sanitation: [
      {
        name: 'NMC Drainage Super-Sucker Unit 1',
        lead: 'R. K. Tidke',
        personnel: 6,
        radio: 'CH-2 DRAINAGE',
      },
      {
        name: 'Solid Waste Rapid Clearance Brigade',
        lead: 'P. G. Sharma',
        personnel: 8,
        radio: 'CH-2 SANITATION',
      },
    ],
    'Public Safety': [
      {
        name: 'Traffic Signal Electronics Crew Alpha',
        lead: 'Insp. R. Verma',
        personnel: 4,
        radio: 'CH-5 CIVIC SAFETY',
      },
    ],
  };

  const currentPresets = crewPresets[issue.department] || crewPresets['Electricity'];

  const [selectedCrewIndex, setSelectedCrewIndex] = useState(0);
  const [leadEngineer, setLeadEngineer] = useState(currentPresets[0]?.lead || 'Officer On Duty');
  const [personnelCount, setPersonnelCount] = useState(currentPresets[0]?.personnel || 4);
  const [contactRadio, setContactRadio] = useState(currentPresets[0]?.radio || 'CH-1 MAIN');
  const [dispatchNotes, setDispatchNotes] = useState('');

  const handleSelectPreset = (idx: number) => {
    setSelectedCrewIndex(idx);
    const preset = currentPresets[idx];
    if (preset) {
      setLeadEngineer(preset.lead);
      setPersonnelCount(preset.personnel);
      setContactRadio(preset.radio);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = currentPresets[selectedCrewIndex];
    onConfirmDispatch(issue.id, {
      teamName: preset ? preset.name : `${issue.department} Field Unit`,
      leadEngineer,
      personnelCount,
      contactRadio,
      notes: dispatchNotes,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F1E36] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold font-sans">Assign Operational Team</h3>
              <p className="text-xs text-slate-300 font-mono">
                {issue.issueCode} · {issue.department} Department
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issue Target Summary Box */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{issue.title}</span>
            <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
              PRIORITY {issue.priorityScore}
            </span>
          </div>
          <p className="text-slate-500 truncate">{issue.location.address}</p>
        </div>

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Preset Crew Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Designated Municipal Crew
            </label>
            <div className="space-y-2">
              {currentPresets.map((crew, idx) => (
                <div
                  key={crew.name}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedCrewIndex === idx
                      ? 'border-[#0F1E36] bg-[#0F1E36]/5 ring-2 ring-[#0F1E36]/10 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-900">{crew.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Lead: {crew.lead} · {crew.personnel} Crew Members
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                    {crew.radio}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Personnel Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lead Engineer / Officer
              </label>
              <input
                type="text"
                value={leadEngineer}
                onChange={(e) => setLeadEngineer(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F1E36]/10 focus:border-[#0F1E36] outline-hidden font-sans"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Field Personnel Count
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={personnelCount}
                onChange={(e) => setPersonnelCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F1E36]/10 focus:border-[#0F1E36] outline-hidden font-sans font-mono"
                required
              />
            </div>
          </div>

          {/* Radio Channel */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Command Dispatch Radio Channel
            </label>
            <input
              type="text"
              value={contactRadio}
              onChange={(e) => setContactRadio(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F1E36]/10 focus:border-[#0F1E36] outline-hidden font-mono"
              required
            />
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Emergency Dispatch Directive / Work Order Notes
            </label>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="e.g. Bring replacement 63A contactor and cordone school crossing..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0F1E36]/10 focus:border-[#0F1E36] outline-hidden font-sans resize-none"
            />
          </div>

          {/* SLA Commitment Notification */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Target Resolution SLA: {issue.slaTargetHours} Hours</p>
              <p className="text-[11px] text-amber-800">
                Dispatching will broadcast live ETA notification to {issue.reportCount} reporting citizens.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Team</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTeamModal;
