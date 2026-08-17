import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Wrench,
  BookOpen,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  LifeBuoy,
  CheckCircle2,
  Upload,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  createSupportTicket,
  supportIssueTypes,
  supportFaqs,
  type SupportIssueType,
  type SupportTicket,
} from '../../services/supportService';
import type { RepresentativeSection } from '../../components/community-representative/RepresentativeSidebar';

interface SupportCenterProps {
  onNavigateSection?: (section: RepresentativeSection) => void;
}

export const SupportCenter: React.FC<SupportCenterProps> = ({ onNavigateSection }) => {
  const [reportOpen, setReportOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  // Form state
  const [issueType, setIssueType] = useState<SupportIssueType>(supportIssueTypes[0]);
  const [description, setDescription] = useState('');
  const [screenshotName, setScreenshotName] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const openReportForm = () => {
    setTicket(null);
    setTouched(false);
    setDescription('');
    setScreenshotName(undefined);
    setIssueType(supportIssueTypes[0]);
    setReportOpen(true);
  };

  const descriptionValid = description.trim().length >= 10;

  // Close the support dialog on Escape
  useEffect(() => {
    if (!reportOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReportOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [reportOpen]);

  const handleSubmit = () => {
    setTouched(true);
    if (!descriptionValid) return;
    const created = createSupportTicket({ issueType, description, screenshotName });
    setTicket(created);
  };

  const guideLinks: { label: string; description: string; section: RepresentativeSection }[] = [
    { label: 'Reporting Issues', description: 'How community issues are lodged and reviewed', section: 'issues' },
    { label: 'Issue Aggregation', description: 'How signals are clustered and prioritized', section: 'aggregation' },
    { label: 'Municipal Responses', description: 'Track department responses to community cases', section: 'dashboard' },
    { label: 'Resolution Verification', description: 'How resolutions are confirmed by residents', section: 'issues' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Support Center
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">How can we help?</p>
      </div>

      {/* Quick Help Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={openReportForm}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5 text-left hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <Wrench className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
            Report a Technical Problem
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">Submit a support request for portal issues</p>
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('support-faqs');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5 text-left hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5 text-[#2563EB]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
            FAQs
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">Answers to common questions</p>
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('support-guide');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5 text-left hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
            CiviNest Guide
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">Learn the community workflow</p>
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('support-contact');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5 text-left hover:border-[#2563EB] hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
            Contact Support
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">Reach the CiviNest support team</p>
        </button>
      </div>

      {/* Guide + FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CiviNest Guide */}
        <div id="support-guide" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">CiviNest Guide</h2>
          <div className="space-y-3">
            {guideLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => onNavigateSection?.(link.section)}
                className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#2563EB] hover:bg-white transition-all duration-200 text-left cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                      {link.label}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{link.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div id="support-faqs" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2.5">
            {supportFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-[#111827]">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 bg-white">
                      <p className="text-xs text-[#4B5563] leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div id="support-contact" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <LifeBuoy className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#111827]">Contact Support</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            support@civinest.app · Mon–Sat, 9:00 AM – 6:00 PM IST
          </p>
        </div>
        <button
          type="button"
          onClick={openReportForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          Open a Ticket
        </button>
      </div>

      {/* Report a Technical Problem Modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E5E7EB] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#0F1E36]">Report a Technical Problem</h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Describe the issue — our team will investigate using the reference ID we generate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Close support form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticket ? (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-[#0F1E36]">Support request submitted</h4>
                <p className="text-sm text-[#6B7280] mt-2">
                  Your reference ID
                </p>
                <div className="inline-block mt-3 px-4 py-2 rounded-lg bg-[#0F1E36] text-white font-mono text-sm font-bold">
                  {ticket.referenceId}
                </div>
                <p className="text-xs text-[#6B7280] mt-4">
                  {ticket.issueType} · {ticket.submittedAt}
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  Keep this ID to track your request. (Demo — stored locally on this device.)
                </p>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="mt-5 px-6 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Issue Type */}
                <div>
                  <label className="text-xs font-semibold text-[#111827] mb-2 block">Issue Type</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as SupportIssueType)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  >
                    {supportIssueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-[#111827] mb-2 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe what happened, what you expected, and any steps to reproduce..."
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent placeholder:text-[#9CA3AF] resize-none"
                  />
                  {touched && !descriptionValid && (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please describe the problem in at least 10 characters.
                    </p>
                  )}
                </div>

                {/* Screenshot */}
                <div>
                  <label className="text-xs font-semibold text-[#111827] mb-2 block">
                    Screenshot <span className="text-[#9CA3AF] font-normal">(optional)</span>
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:bg-[#F3F4F6] cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-xs text-[#4B5563] truncate">
                      {screenshotName || 'Attach a screenshot (PNG/JPG)'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => setScreenshotName(e.target.files?.[0]?.name)}
                    />
                  </label>
                  <p className="text-[10px] text-[#9CA3AF] mt-1.5">
                    Demo stores the file name only — no upload happens yet.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full px-4 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Submit Support Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCenter;
