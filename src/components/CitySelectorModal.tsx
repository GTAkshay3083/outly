import { useState } from 'react';
import { X, Search, MapPin, Check, Sparkles, Compass } from 'lucide-react';
import { TAMIL_NADU_DISTRICTS, ALL_INDIAN_STATES } from '../utils/locations';

interface Props {
  currentCity: string;
  currentState?: string;
  onSelect: (city: string, state: string) => void;
  onClose: () => void;
}

export default function CitySelectorModal({
  currentCity,
  currentState = 'Tamil Nadu',
  onSelect,
  onClose,
}: Props) {
  const [tab, setTab] = useState<'tamil_nadu' | 'all_states'>('tamil_nadu');
  const [search, setSearch] = useState('');

  const filteredDistricts = TAMIL_NADU_DISTRICTS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.tagline && d.tagline.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredStates = ALL_INDIAN_STATES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end">
      <div className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[88vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5E3A] flex items-center gap-1">
              <Compass size={12} /> Geographic Coverage
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">Choose Location</h2>
          </div>
          <button onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636366]" />
          <input
            type="text"
            placeholder="Search any district, city, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#08080A] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#636366] focus:outline-none"
          />
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#1C1C1F] text-xs font-bold mb-3">
          <button
            onClick={() => setTab('tamil_nadu')}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
              tab === 'tamil_nadu'
                ? 'text-white border-[#FF5E3A]'
                : 'text-[#636366] border-transparent hover:text-[#A1A1A6]'
            }`}
          >
            Tamil Nadu (38 Districts)
          </button>
          <button
            onClick={() => setTab('all_states')}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
              tab === 'all_states'
                ? 'text-white border-[#FF5E3A]'
                : 'text-[#636366] border-transparent hover:text-[#A1A1A6]'
            }`}
          >
            All States & UTs (36)
          </button>
        </div>

        {/* Tab 1: Tamil Nadu Districts */}
        {tab === 'tamil_nadu' ? (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {/* Quick Statewide Option */}
            <button
              onClick={() => {
                onSelect('All Tamil Nadu', 'Tamil Nadu');
                onClose();
              }}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                currentCity === 'All Tamil Nadu'
                  ? 'bg-[#1C1C1F] border-[#1DB954] text-[#1DB954]'
                  : 'bg-[#08080A] border-[#2A2A2E] text-white hover:border-[#3E3E42]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#1DB954]/15 text-[#1DB954] flex items-center justify-center font-bold text-xs">
                  <Sparkles size={14} />
                </div>
                <div>
                  <span className="font-black text-xs block">All Tamil Nadu</span>
                  <span className="text-[10px] text-[#A1A1A6]">Browse statewide plans & road trips</span>
                </div>
              </div>
              {currentCity === 'All Tamil Nadu' && <Check size={16} />}
            </button>

            {/* Districts List */}
            {filteredDistricts.length === 0 ? (
              <p className="text-center text-xs text-[#636366] py-10">No districts match "{search}".</p>
            ) : (
              filteredDistricts.map((d) => {
                const isSelected = currentCity === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelect(d.id, 'Tamil Nadu');
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#1C1C1F] border-[#FF5E3A] text-white shadow-md'
                        : 'bg-[#08080A] border-[#1C1C1F] text-[#A1A1A6] hover:text-white hover:border-[#2A2A2E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{d.name}</span>
                        {d.isMajor && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5E3A]" />
                        )}
                      </div>
                      {d.tagline && (
                        <p className="text-[10px] text-[#636366] mt-0.5 truncate max-w-[280px]">
                          {d.tagline}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check size={16} className="text-[#FF5E3A] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Tab 2: All Indian States & UTs */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredStates.length === 0 ? (
              <p className="text-center text-xs text-[#636366] py-10">No states match "{search}".</p>
            ) : (
              filteredStates.map((s) => {
                const isSelected = currentState === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelect(s.name, s.id);
                      onClose();
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#1C1C1F] border-[#1DB954] text-white shadow-md'
                        : 'bg-[#08080A] border-[#1C1C1F] text-[#A1A1A6] hover:text-white hover:border-[#2A2A2E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin size={13} className={isSelected ? 'text-[#1DB954]' : 'text-[#636366]'} />
                      <span className="font-bold text-xs text-white">{s.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#121214] border border-[#2A2A2E] text-[#636366]">
                        {s.type}
                      </span>
                    </div>
                    {isSelected && <Check size={16} className="text-[#1DB954] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
