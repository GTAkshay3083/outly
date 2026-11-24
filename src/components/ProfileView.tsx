import { useState } from 'react';
import { MapPin, LogIn, AlertTriangle, Camera, Pencil, Sparkles, LogOut } from 'lucide-react';
import type { UserProfile } from '../types';
import { getReputationTier } from '../utils/reputation';
import EditProfileModal from './EditProfileModal';

interface Props {
  profile: UserProfile | null;
  onCityChange: (city: string, state?: string) => void;
  onOpenSafetyModal: () => void;
  onOpenAuthModal: () => void;
  onOpenCityModal: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
  onSignOut?: () => void;
}

export default function ProfileView({
  profile,
  onCityChange,
  onOpenSafetyModal,
  onOpenAuthModal,
  onOpenCityModal,
  onProfileUpdated,
  onSignOut,
}: Props) {
  const [showEditModal, setShowEditModal] = useState(false);

  const attended = profile?.outings_attended || 0;
  const flaked = profile?.outings_flaked || 0;
  const strikes = profile?.strike_count || 0;
  const tier = getReputationTier(attended, flaked, strikes);

  const isSuspended = () => {
    if (!profile?.suspended_until) return false;
    return new Date(profile.suspended_until).getTime() > Date.now();
  };

  return (
    <div className="flex-1 px-5 pt-3 pb-24 space-y-4">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-[#121214] border border-[#1C1C1F] shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#FF5E3A] to-[#FF8C66] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-[#FF5E3A]/20 overflow-hidden border border-[#2A2A2E]">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  (profile?.full_name || 'U')[0]
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center border-2 border-[#121214] active:scale-95 shadow"
                title="Change photo"
              >
                <Camera size={11} />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#F5F5F7] tracking-tight">
                {profile?.full_name || 'Anonymous User'}
              </h2>
              <span className="text-xs text-[#A1A1A6] font-medium block">
                @{profile?.username || 'user'} • {profile?.city || 'Chennai'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase flex items-center gap-1 ${tier.badgeClass}`}>
                  <span>{tier.emoji}</span>
                  <span>{tier.title}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-white hover:border-[#FF5E3A] flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Pencil size={11} className="text-[#FF5E3A]" />
            <span>Edit</span>
          </button>
        </div>

        {/* Bio Section */}
        <div className="mt-3.5 pt-3 border-t border-[#1C1C1F]">
          <p className="text-xs text-[#A1A1A6] leading-relaxed flex items-start gap-1.5">
            <Sparkles size={13} className="text-[#1DB954] shrink-0 mt-0.5" />
            {profile?.bio ? (
              <span className="text-white/90 italic">"{profile.bio}"</span>
            ) : (
              <span className="text-[#636366] italic">No bio added yet. Tap "Edit" to add your favorite outings & vibes!</span>
            )}
          </p>
        </div>
      </div>

      {/* Quirky Flake Karma Trophy Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121214] to-[#18181C] border border-[#2A2A2E] shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5E3A]">
              Social Flake Protocol
            </span>
            <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
              <span>{tier.emoji}</span>
              <span>{tier.title}</span>
            </h3>
          </div>
          <span className={`text-2xl font-mono font-black ${tier.textClass}`}>
            {tier.score}%
          </span>
        </div>

        <p className="text-xs text-[#A1A1A6] italic mb-4 leading-relaxed bg-[#08080A]/60 p-3 rounded-2xl border border-[#1C1C1F]">
          "{tier.tagline}"
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#08080A] border border-[#1C1C1F]">
            <span className="text-xl font-black text-[#1DB954]">{attended}</span>
            <span className="text-[10px] text-[#A1A1A6] block mt-0.5">Showed Up</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#08080A] border border-[#1C1C1F]">
            <span className="text-xl font-black text-[#FF5E3A]">{flaked}</span>
            <span className="text-[10px] text-[#A1A1A6] block mt-0.5">Flaked</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#08080A] border border-[#1C1C1F]">
            <span className="text-xl font-black text-white">{strikes}</span>
            <span className="text-[10px] text-[#A1A1A6] block mt-0.5">Strikes</span>
          </div>
        </div>

        {isSuspended() && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <span>Cooldown Active: Strikes on account. Joining is temporarily restricted.</span>
          </div>
        )}
      </div>

      {/* City & District Switcher */}
      <div className="p-5 rounded-3xl bg-[#121214] border border-[#1C1C1F] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] flex items-center gap-1.5">
            <MapPin size={13} className="text-[#FF5E3A]" /> Active Location
          </span>
          <button
            onClick={onOpenCityModal}
            className="text-xs font-bold text-[#FF5E3A] hover:underline"
          >
            All 38 Districts & States →
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-[#08080A] border border-[#2A2A2E] flex items-center justify-between">
          <div>
            <span className="font-extrabold text-white text-sm block">
              {profile?.city || 'Chennai'}
            </span>
            <span className="text-[11px] text-[#A1A1A6]">
              {profile?.state || 'Tamil Nadu'}
            </span>
          </div>
          <button
            onClick={onOpenCityModal}
            className="px-3 py-1.5 rounded-xl bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-white hover:border-[#FF5E3A]"
          >
            Change
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {['Chennai', 'Coimbatore', 'Madurai', 'All Tamil Nadu'].map((c) => {
            const isSelected = (profile?.city || 'Chennai') === c;
            return (
              <button
                key={c}
                onClick={() => onCityChange(c, 'Tamil Nadu')}
                className={`py-2 rounded-xl text-[11px] font-bold border truncate transition-all ${
                  isSelected
                    ? 'bg-[#FF5E3A] border-[#FF5E3A] text-white shadow-md'
                    : 'bg-[#08080A] border-[#2A2A2E] text-[#A1A1A6] hover:text-white'
                }`}
              >
                {c.replace('All Tamil Nadu', 'All TN')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Contact Settings */}
      <div className="p-5 rounded-3xl bg-[#121214] border border-[#1C1C1F] flex items-center justify-between">
        <div>
          <span className="font-bold text-xs text-[#F5F5F7] block">Dead Man's Switch & SOS</span>
          <span className="text-[11px] text-[#A1A1A6]">
            {profile?.safety_contact_name
              ? `Linked to ${profile.safety_contact_name} (${profile.safety_contact_phone || 'No phone'})`
              : 'No emergency contact set'}
          </span>
        </div>
        <button
          onClick={onOpenSafetyModal}
          className="px-3 py-1.5 rounded-xl bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-white hover:border-[#1DB954]"
        >
          Configure
        </button>
      </div>

      {/* GOOGLE SIGN IN BANNER - Placed at the bottom of the profile tab */}
      <button
        onClick={onOpenAuthModal}
        className="w-full p-4 rounded-3xl bg-[#121214] border border-[#2A2A2E] hover:border-[#FF5E3A]/60 flex items-center justify-between text-left active:scale-98 transition-all shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-black font-black text-lg shadow-sm">
            G
          </div>
          <div>
            <span className="font-bold text-xs text-white block">
              {profile?.email ? 'Google Account Connected' : 'Sign in with Google'}
            </span>
            <span className="text-[11px] text-[#A1A1A6]">
              {profile?.email ? profile.email : 'Save preferences, avatars & sync across devices'}
            </span>
          </div>
        </div>
        <LogIn size={16} className="text-[#FF5E3A]" />
      </button>

      {/* Sign Out Button */}
      {onSignOut && (
        <button
          onClick={onSignOut}
          className="w-full p-4 rounded-3xl bg-[#121214] border border-white/[0.06] hover:border-red-500/30 text-left flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
              <LogOut size={18} />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Sign Out</span>
              <span className="text-[11px] text-[#A1A1A6]">Switch account or sign in with another email</span>
            </div>
          </div>
        </button>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            if (onProfileUpdated) onProfileUpdated(updated);
          }}
        />
      )}
    </div>
  );
}
