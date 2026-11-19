import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Award,
  CalendarCheck,
  Flame,
  UserCheck
} from 'lucide-react';
import { getReputationTier } from '../utils/reputation';
import { api } from '../api';

export interface PublicUserSummary {
  id?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  outings_attended?: number;
  outings_flaked?: number;
  strike_count?: number;
  interests?: string[];
}

interface Props {
  user: PublicUserSummary | null;
  onClose: () => void;
}

export default function PublicProfileModal({ user, onClose }: Props) {
  const [profile, setProfile] = useState<PublicUserSummary | null>(user);

  useEffect(() => {
    setProfile(user);
    if (user?.id) {
      api.getProfile(user.id)
        .then((fullProfile) => {
          if (fullProfile) {
            setProfile((prev) => ({
              ...prev,
              ...fullProfile,
            }));
          }
        })
        .catch((err) => {
          console.warn('Could not fetch extra profile details:', err);
        });
    }
  }, [user]);

  if (!user || !profile) return null;

  const attended = profile.outings_attended ?? 0;
  const flaked = profile.outings_flaked ?? 0;
  const strikes = profile.strike_count ?? 0;
  const tier = getReputationTier(attended, flaked, strikes);

  const total = attended + flaked;
  const reliabilityRate = total > 0 ? Math.round((attended / total) * 100) : 100;

  const locationDisplay = [profile.city, profile.state].filter(Boolean).join(', ') || 'Tamil Nadu, India';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end animate-in fade-in duration-200 overflow-x-hidden">
      <div 
        className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[36px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[88vh] overflow-y-auto overflow-x-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-4" />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${tier.badgeClass}`}>
            <span>{tier.emoji}</span>
            <span>{tier.title}</span>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#1C1C1F] hover:bg-[#2A2A2E] text-[#A1A1A6] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero User Identity - Perfectly Centered & 100% Visible */}
        <div className="flex flex-col items-center text-center mb-5 p-5 rounded-3xl bg-[#08080A] border border-[#1C1C1F] w-full">
          <div className="relative mb-3">
            <div 
              className={`rounded-full bg-[#1C1C1F] border-2 flex items-center justify-center overflow-hidden font-black text-3xl text-[#FF5E3A] shadow-xl shrink-0 ${
                tier.id === 'LEGEND' ? 'border-[#1DB954]' : 'border-[#FF5E3A]'
              }`}
              style={{ width: '84px', height: '84px' }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                (profile.full_name || 'U')[0].toUpperCase()
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#08080A] border border-[#2A2A2E] flex items-center justify-center shadow">
              <ShieldCheck size={14} className="text-[#1DB954]" />
            </div>
          </div>

          <h3 className="text-xl font-black text-[#F5F5F7] tracking-tight max-w-full truncate px-2">
            {profile.full_name || 'Anonymous User'}
          </h3>
          <p className="text-xs font-semibold text-[#FF5E3A] mt-0.5">
            @{profile.username || 'user'}
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#A1A1A6] mt-2.5 px-3 py-1 rounded-full bg-[#121214] border border-[#2A2A2E]">
            <MapPin size={11} className="text-[#FF5E3A] shrink-0" />
            <span className="truncate max-w-[240px]">{locationDisplay}</span>
          </div>
        </div>

        {/* Anti-Flake Reliability Scoreboard */}
        <div className="mb-5 p-4 rounded-3xl bg-[#08080A] border border-[#1C1C1F] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] flex items-center gap-1.5">
              <Award size={14} className="text-[#1DB954]" /> Outly Anti-Flake Score
            </span>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
              reliabilityRate >= 90 ? 'bg-[#1DB954]/15 text-[#1DB954]' : 'bg-[#FF5E3A]/15 text-[#FF5E3A]'
            }`}>
              {total === 0 ? 'Fresh Member' : `${reliabilityRate}% Reliability`}
            </span>
          </div>

          {/* Reliability Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#1C1C1F] overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                reliabilityRate >= 90 ? 'bg-gradient-to-r from-emerald-500 to-[#1DB954]' : 'bg-gradient-to-r from-amber-500 to-[#FF5E3A]'
              }`}
              style={{ width: `${total === 0 ? 100 : reliabilityRate}%` }}
            />
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-[#121214] border border-[#1C1C1F] text-center">
              <div className="flex items-center justify-center gap-1 text-[#1DB954] mb-0.5">
                <CalendarCheck size={12} />
                <span className="text-base font-black text-white">{attended}</span>
              </div>
              <span className="text-[10px] text-[#A1A1A6] font-semibold">Attended</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#121214] border border-[#1C1C1F] text-center">
              <div className="flex items-center justify-center gap-1 text-[#FF5E3A] mb-0.5">
                <Flame size={12} />
                <span className="text-base font-black text-white">{flaked}</span>
              </div>
              <span className="text-[10px] text-[#A1A1A6] font-semibold">Flakes</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#121214] border border-[#1C1C1F] text-center">
              <div className="flex items-center justify-center gap-1 text-cyan-400 mb-0.5">
                <UserCheck size={12} />
                <span className="text-base font-black text-white">{strikes}</span>
              </div>
              <span className="text-[10px] text-[#A1A1A6] font-semibold">Strikes</span>
            </div>
          </div>

          {/* Tier Tagline */}
          <p className="text-[11px] text-[#A1A1A6] italic bg-[#121214] border border-[#2A2A2E]/50 rounded-2xl p-2.5 text-center leading-relaxed">
            "{tier.tagline}"
          </p>
        </div>

        {/* Bio Section */}
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] block mb-2">
            Social Vibe & Bio
          </span>
          <div className="p-4 rounded-2xl bg-[#08080A] border border-[#1C1C1F] text-xs text-[#F5F5F7] leading-relaxed">
            {profile.bio && profile.bio.trim() ? (
              profile.bio
            ) : (
              <span className="text-[#636366] italic">
                No bio written yet. Ready for spontaneous outings and meeting reliable crowds!
              </span>
            )}
          </div>
        </div>

        {/* Passions & Interests */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] block mb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#FF5E3A]" /> Interests & Passions
          </span>
          {profile.interests && profile.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-semibold text-[#F5F5F7] flex items-center gap-1.5 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5E3A]" />
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#08080A] border border-[#1C1C1F] text-center text-xs text-[#636366]">
              All-rounder • Open to all outing categories
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#ff7352] text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-transform shadow-lg shadow-[#FF5E3A]/20"
        >
          Done
        </button>
      </div>
    </div>
  );
}
