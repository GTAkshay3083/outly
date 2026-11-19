import { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Film, 
  Coffee, 
  Trophy, 
  Music, 
  Gamepad2, 
  Compass, 
  ArrowRight,
  Check,
  Search
} from 'lucide-react';
import { api } from '../api';
import type { UserProfile } from '../types';
import { TAMIL_NADU_DISTRICTS, ALL_INDIAN_STATES } from '../utils/locations';

interface Props {
  user: UserProfile;
  onFinished: (updatedProfile: UserProfile) => void;
}

const INTERESTS = [
  { id: 'movies', label: 'Movies & IMAX', icon: Film },
  { id: 'food', label: 'Midnight Food', icon: Coffee },
  { id: 'turf', label: 'Turf Football', icon: Trophy },
  { id: 'badminton', label: 'Badminton', icon: Trophy },
  { id: 'coffee', label: 'Coffee Walks', icon: Coffee },
  { id: 'gigs', label: 'Gigs & Nightlife', icon: Music },
  { id: 'arcades', label: 'Arcades & Gaming', icon: Gamepad2 },
  { id: 'trips', label: 'Treks & Outdoors', icon: Compass },
];

export default function OnboardingFlow({ user, onFinished }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [city, setCity] = useState(user.city || 'Chennai');
  const [stateName, setStateName] = useState(user.state || 'Tamil Nadu');
  const [locationTab, setLocationTab] = useState<'tamil_nadu' | 'all_states'>('tamil_nadu');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || ['movies', 'food']);
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Legend'
  );
  const [submitting, setSubmitting] = useState(false);

  const filteredDistricts = TAMIL_NADU_DISTRICTS.filter(
    (d) =>
      d.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      (d.tagline && d.tagline.toLowerCase().includes(locationSearch.toLowerCase()))
  );

  const filteredStates = ALL_INDIAN_STATES.filter((s) =>
    s.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const updated = await api.completeOnboarding(user.id, {
        city,
        state: stateName,
        interests: selectedInterests,
        username,
        bio,
        avatar_url: avatarUrl,
      });
      onFinished(updated);
    } catch (err: any) {
      alert('Error saving preferences: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#08080A] z-50 flex justify-center">
      <div className="w-full max-w-md h-full flex flex-col justify-between p-6 bg-[#08080A] border-x border-[#1C1C1F]">
        
        {/* Top Progress bar */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black tracking-widest uppercase text-[#FF5E3A]">
              Step {step} of 3
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? 'w-6 bg-[#FF5E3A]' : s < step ? 'w-2 bg-[#1DB954]' : 'w-2 bg-[#2A2A2E]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: CHOOSE CITY & DISTRICT */}
        {step === 1 && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in fade-in duration-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#FF5E3A]/15 border border-[#FF5E3A]/30 text-[#FF5E3A] text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-1.5">
                <MapPin size={12} /> The Starting Grid
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Where are we hanging out?
              </h1>
              <p className="text-xs text-[#A1A1A6] mt-1">
                Currently selected:{' '}
                <strong className="text-[#FF5E3A]">{city}</strong> ({stateName})
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636366]" />
              <input
                type="text"
                placeholder="Search district, city or state..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full bg-[#121214] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#636366] focus:outline-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1C1C1F] text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocationTab('tamil_nadu')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                  locationTab === 'tamil_nadu'
                    ? 'text-white border-[#FF5E3A]'
                    : 'text-[#636366] border-transparent hover:text-[#A1A1A6]'
                }`}
              >
                Tamil Nadu (38)
              </button>
              <button
                type="button"
                onClick={() => setLocationTab('all_states')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                  locationTab === 'all_states'
                    ? 'text-white border-[#FF5E3A]'
                    : 'text-[#636366] border-transparent hover:text-[#A1A1A6]'
                }`}
              >
                All States & UTs (36)
              </button>
            </div>

            {/* Scrollable Location List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {locationTab === 'tamil_nadu' ? (
                <>
                  {/* All Tamil Nadu Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setCity('All Tamil Nadu');
                      setStateName('Tamil Nadu');
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      city === 'All Tamil Nadu'
                        ? 'bg-[#1C1C1F] border-[#1DB954] text-[#1DB954]'
                        : 'bg-[#121214] border-[#2A2A2E] text-white hover:border-[#3E3E42]'
                    }`}
                  >
                    <div>
                      <span className="font-black text-xs block">All Tamil Nadu (Statewide)</span>
                      <span className="text-[10px] text-[#A1A1A6]">Browse plans anywhere in TN</span>
                    </div>
                    {city === 'All Tamil Nadu' && <Check size={16} />}
                  </button>

                  {filteredDistricts.length === 0 ? (
                    <p className="text-center text-xs text-[#636366] py-6">No districts match "{locationSearch}".</p>
                  ) : (
                    filteredDistricts.map((d) => {
                      const isSelected = city === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setCity(d.id);
                            setStateName('Tamil Nadu');
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
                              <p className="text-[10px] text-[#636366] mt-0.5 truncate max-w-[270px]">
                                {d.tagline}
                              </p>
                            )}
                          </div>
                          {isSelected && <Check size={16} className="text-[#FF5E3A] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  {filteredStates.length === 0 ? (
                    <p className="text-center text-xs text-[#636366] py-6">No states match "{locationSearch}".</p>
                  ) : (
                    filteredStates.map((s) => {
                      const isSelected = stateName === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCity(s.name);
                            setStateName(s.id);
                          }}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#1C1C1F] border-[#1DB954] text-white shadow-md'
                              : 'bg-[#08080A] border-[#1C1C1F] text-[#A1A1A6] hover:text-white hover:border-[#2A2A2E]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{s.name}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#121214] border border-[#2A2A2E] text-[#636366]">
                              {s.type}
                            </span>
                          </div>
                          {isSelected && <Check size={16} className="text-[#1DB954] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE VIBES / INTERESTS */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
                <Sparkles size={12} /> Social Filter
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">
                What's your vibe?
              </h1>
              <p className="text-xs text-[#A1A1A6] mt-1">
                Pick what you actually look forward to doing on weekends.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {INTERESTS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#121214] border-[#1DB954] text-white shadow-md shadow-[#1DB954]/10'
                        : 'bg-[#08080A] border-[#2A2A2E] text-[#A1A1A6]'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isSelected ? 'text-[#1DB954]' : 'text-[#636366]'}
                    />
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: IDENTITY & QUIRKY HANDLE */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
                🐣 The Rookie Starting Card
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Claim your handle
              </h1>
              <p className="text-xs text-[#A1A1A6] mt-1">
                You're entering Outly with a clean slate. Showing up builds your streak.
              </p>
            </div>

            <div className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="text-xs text-[#A1A1A6] font-bold block mb-2">
                  Choose Starting Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'legend', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Legend' },
                    { id: 'spark', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spark' },
                    { id: 'shadow', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow' },
                    { id: 'destiny', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny' },
                    { id: 'aiden', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aiden' },
                    { id: 'felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
                  ].map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`h-12 w-12 rounded-2xl p-1 shrink-0 border transition-all ${
                        avatarUrl === av.url
                          ? 'border-[#FF5E3A] bg-[#FF5E3A]/20 scale-105'
                          : 'border-[#2A2A2E] bg-[#121214]'
                      }`}
                    >
                      <img src={av.url} alt="Avatar" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A1A1A6] font-bold block mb-1">
                  Choose Username
                </label>
                <div className="flex items-center bg-[#121214] border border-[#2A2A2E] focus-within:border-[#FF5E3A] rounded-2xl px-4 py-3">
                  <span className="text-sm font-bold text-[#FF5E3A] mr-1">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourhandle"
                    className="bg-transparent text-sm text-white font-bold w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A1A1A6] font-bold block mb-1">
                  1-Line Vibe / Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Always ready for 70mm IMAX and chai."
                  className="w-full bg-[#121214] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-2xl px-4 py-3 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Starting Tier Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 flex items-center gap-3">
                <span className="text-2xl">🐣</span>
                <div>
                  <span className="text-xs font-black text-purple-300 block">
                    Initial Tier: Fresh Blood
                  </span>
                  <span className="text-[11px] text-purple-200/70">
                    Attend 3 outings without flaking to unlock <strong>"Absolute Legend" 👑</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="pb-4">
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="w-full py-4 rounded-2xl bg-[#FF5E3A] text-white font-extrabold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#FF5E3A]/20"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !username.trim()}
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl bg-[#1DB954] text-black font-extrabold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/20 disabled:opacity-50"
            >
              <span>{submitting ? 'Setting up your profile...' : 'Enter Outly'}</span>
              <Check size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
