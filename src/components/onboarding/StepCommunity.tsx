import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Users, CheckCircle2, Plus, Building2, ShieldCheck, Check } from 'lucide-react';
import { SocietyItem, UserCommunityData } from '../../types';
import { AVAILABLE_SOCIETIES } from './onboardingData';

interface StepCommunityProps {
  data: UserCommunityData;
  userWard: string;
  onUpdate: (data: Partial<UserCommunityData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepCommunity: React.FC<StepCommunityProps> = ({
  data,
  userWard,
  onUpdate,
  onBack,
  onNext,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(data.isCustom);
  const [customName, setCustomName] = useState(data.isCustom ? data.societyName : '');
  const [customType, setCustomType] = useState(data.isCustom ? data.societyType : 'Apartment Complex');
  const [error, setError] = useState<string | null>(null);

  // Filter societies based on search query
  const filteredSocieties = AVAILABLE_SOCIETIES.filter((soc) => {
    const q = searchQuery.toLowerCase();
    return (
      soc.name.toLowerCase().includes(q) ||
      soc.type.toLowerCase().includes(q) ||
      soc.ward.toLowerCase().includes(q)
    );
  });

  const handleSelectSociety = (society: SocietyItem) => {
    setShowCustomForm(false);
    setError(null);
    onUpdate({
      societyId: society.id,
      societyName: society.name,
      societyType: society.type,
      isCustom: false,
      memberCount: society.memberCount,
    });
  };

  const handleSaveCustomSociety = () => {
    if (!customName.trim()) {
      setError('Please enter your society or community name.');
      return;
    }
    setError(null);
    onUpdate({
      societyId: `custom-${Date.now()}`,
      societyName: customName.trim(),
      societyType: customType,
      isCustom: true,
      memberCount: 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showCustomForm) {
      if (!customName.trim()) {
        setError('Please enter your society or community name.');
        return;
      }
      handleSaveCustomSociety();
    } else if (!data.societyName) {
      setError('Please select a society or choose "My society isn\'t listed".');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight font-serif mb-1">
          Join a Society
        </h2>
        <p className="text-xs sm:text-[13.5px] text-[#64748B] font-sans">
          Connect with your local housing society, RWA, or neighborhood council.
        </p>
        <p className="text-[11px] text-[#94A3B8] mt-1 font-sans">This step is optional — you can always join a community later.</p>
      </div>

      {/* Society Search Input */}
      {!showCustomForm && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search societies, RWAs, or apartment complexes..."
            className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#E5E7EB] text-sm text-[#0F1E36] bg-[#F4F5F7]/90 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none transition-all placeholder:text-[#9CA3AF]"
          />
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Society Selection List */}
      {!showCustomForm ? (
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {filteredSocieties.length > 0 ? (
            filteredSocieties.map((soc) => {
              const isSelected = data.societyId === soc.id && !data.isCustom;
              return (
                <button
                  key={soc.id}
                  type="button"
                  onClick={() => handleSelectSociety(soc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/15 shadow-sm'
                      : 'bg-[#F4F5F7]/70 hover:bg-white border-[#E5E7EB] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-[#0F1E36] truncate block">
                          {soc.name}
                        </span>
                        {soc.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" title="Verified RWA" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B]">
                        <span>{soc.type}</span>
                        <span>•</span>
                        <span>{soc.ward}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {soc.memberCount} members
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected check */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'border border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 px-4 bg-[#F4F5F7]/50 rounded-xl border border-dashed border-[#CBD5E1]">
              <p className="text-xs text-[#64748B] mb-2">No existing societies found matching "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => {
                  setShowCustomForm(true);
                  setCustomName(searchQuery);
                }}
                className="text-xs text-[#2563EB] font-semibold hover:underline"
              >
                Add "{searchQuery || 'My Society'}" as a new community node
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Custom Society Form */
        <div className="p-4 rounded-xl border border-[#CBD5E1] bg-white space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <span className="text-xs font-semibold text-[#0F1E36] font-mono uppercase tracking-wider">
              Register New Community Node
            </span>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="text-xs text-[#64748B] hover:text-[#0F1E36]"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Society / Community Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Greenwood Enclave RWA"
              className="w-full px-3 py-2.5 rounded-lg border border-[#D1D5DB] text-xs text-[#0F1E36] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Community Type
            </label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-xs text-[#0F1E36] outline-none focus:border-[#2563EB]"
            >
              <option value="Apartment Complex">Apartment Complex / Tower</option>
              <option value="RWA">Resident Welfare Association (RWA)</option>
              <option value="Residents Forum">Residents Forum / Welfare Society</option>
              <option value="Neighborhood Guild">Neighborhood Guild / Mohalla Samiti</option>
            </select>
          </div>

          <p className="text-[11px] text-[#64748B]">
            This will create a new decentralized community cluster in {userWard || 'your ward'}.
          </p>
        </div>
      )}

      {/* "My society isn't listed" Toggle */}
      {!showCustomForm && (
        <button
          type="button"
          onClick={() => {
            setShowCustomForm(true);
            setCustomName('');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>My society isn't listed — Add New Community</span>
        </button>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onUpdate({ societyId: '', societyName: '', societyType: '', isCustom: false });
              onNext();
            }}
            className="text-xs font-medium text-[#6B7280] hover:text-[#374151] transition-colors cursor-pointer px-3 py-2.5"
          >
            Skip for now
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepCommunity;
