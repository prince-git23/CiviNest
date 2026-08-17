import React, { useState } from 'react';
import { User, Users, Landmark, ArrowRight, Check, X, Shield, Smartphone, FileSpreadsheet } from 'lucide-react';

interface StakeholderInfo {
  id: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  highlights: string[];
  tools: string[];
}

const stakeholders: StakeholderInfo[] = [
  {
    id: 'citizen',
    role: 'Citizen',
    icon: User,
    summary:
      'Frictionless reporting via channels they already use. Real-time updates build trust and demonstrate that their voice was heard and acted upon.',
    highlights: [
      'No app downloads required: report via WhatsApp, SMS, web, or dial-in voice',
      'Instant tracking ticket with progress milestones and resolution photos',
      'Zero spam: aggregate updates instead of repetitive robotic acknowledgments',
      '100% PII protection with local cryptographic anonymization',
    ],
    tools: ['Omni-channel SMS Bot', 'Citizen Trust Portal', 'Live Incident Radar'],
  },
  {
    id: 'community',
    role: 'Community',
    icon: Users,
    summary:
      'Neighborhood groups and NGOs can view aggregated data to advocate for systemic changes, equipped with verified evidence rather than anecdotes.',
    highlights: [
      'Export verified evidence dossiers for town hall hearings and council votes',
      'Track historical municipal response times across equity boundaries',
      'Collaborate with neighborhood leaders on localized micro-initiatives',
      'Identify recurring seasonal hazards before emergencies escalate',
    ],
    tools: ['Civic Advocacy Studio', 'Equity Heatmap Explorer', 'Open Data Feeds'],
  },
  {
    id: 'government',
    role: 'Government',
    icon: Landmark,
    summary:
      'Administrators receive clean, prioritized data pipelines integrated directly into existing workflows, reducing triaging time by up to 60%.',
    highlights: [
      'Automated deduplication eliminates hundreds of redundant tickets per event',
      'Direct 2-way sync with CityWorks, ESRI ArcGIS, and municipal dispatch engines',
      'Algorithmic priority scoring based on risk, severity, and population impact',
      'Auditable AI chain of custody ensuring transparent democratic oversight',
    ],
    tools: ['Command Dashboard', 'Work Order Dispatch API', 'Spatial Hotspot Engine'],
  },
];

export const StakeholdersSection: React.FC = () => {
  const [activeModal, setActiveModal] = useState<StakeholderInfo | null>(null);

  return (
    <section id="stakeholders" className="py-24 md:py-32 bg-[#FBFBFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#0F1E36] tracking-tight mb-5">
            One civic network.
            <br />
            <span className="italic font-light">Different perspectives.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-2xl mx-auto font-normal">
            A unified platform tailored to the unique needs of every stakeholder in
            the civic ecosystem.
          </p>
        </div>

        {/* 3 Stakeholder Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stakeholders.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,30,54,0.06)] hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Soft square icon container */}
                  <div className="w-12 h-12 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#0F1E36] mb-6">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-[#0F1E36] mb-3">
                    {item.role}
                  </h3>

                  {/* Summary text */}
                  <p className="text-sm text-[#4B5563] leading-relaxed mb-6 font-normal">
                    {item.summary}
                  </p>
                </div>

                {/* Learn More link */}
                <button
                  onClick={() => setActiveModal(item)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F1E36] hover:text-blue-700 transition-colors group cursor-pointer pt-2"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* Stakeholder Deep-Dive Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F0F4F8] flex items-center justify-center text-[#0F1E36]">
                <activeModal.icon className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-[#0F1E36]">
                {activeModal.role} Architecture
              </h4>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {activeModal.summary}
            </p>

            <div className="mb-6">
              <h5 className="text-xs font-mono font-bold uppercase text-gray-500 mb-3 tracking-wider">
                Key Capabilities
              </h5>
              <div className="space-y-2.5">
                {activeModal.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {activeModal.tools.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#0F1E36] text-white text-xs px-4 py-2 rounded-md font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StakeholdersSection;
