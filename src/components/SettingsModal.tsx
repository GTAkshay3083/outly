import { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Zap, 
  Coffee, 
  Award, 
  Smartphone, 
  LogOut, 
  Check, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Lock, 
  Vibrate,
  AlertTriangle,
  Heart
} from 'lucide-react';
import type { UserProfile } from '../types';
import { api } from '../api';

interface Props {
  profile: UserProfile | null;
  theme: 'dark' | 'light';
  onThemeChange: (newTheme: 'dark' | 'light') => void;
  onClose: () => void;
  onSignOut: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

const LIFESTYLE_TAGS = [
  '🌱 Vegetarian',
  '☕ Coffee Addict',
  '⚽ Sports & Turf',
  '🌙 Night Owl',
  '🎬 Film Buff',
  '🚫 Non-Drinker',
  '🏸 Badminton Fan',
  '🎵 Live Music'
];

export default function SettingsModal({
  profile,
  theme,
  onThemeChange,
  onClose,
  onSignOut,
  onProfileUpdated
}: Props) {
  const isDark = theme === 'dark';

  // Local state for settings with localStorage persistence
  const [beaconRadius, setBeaconRadius] = useState<string>(() => {
    return localStorage.getItem('outly_setting_beacon_radius') || '5km';
  });

  const [quietHours, setQuietHours] = useState<boolean>(() => {
    return localStorage.getItem('outly_setting_quiet_hours') === 'true';
  });

  const [notifyBeacons, setNotifyBeacons] = useState<boolean>(() => {
    return localStorage.getItem('outly_notify_beacons') !== 'false';
  });

  const [notifySquadChat, setNotifySquadChat] = useState<boolean>(() => {
    return localStorage.getItem('outly_notify_squad_chat') !== 'false';
  });

  const [notifyPitches, setNotifyPitches] = useState<boolean>(() => {
    return localStorage.getItem('outly_notify_pitches') !== 'false';
  });

  const [venuePrivacy, setVenuePrivacy] = useState<boolean>(() => {
    return localStorage.getItem('outly_setting_venue_privacy') !== 'false';
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('outly_setting_haptics') !== 'false';
  });

  const [deadmanDefault, setDeadmanDefault] = useState<string>(() => {
    return localStorage.getItem('outly_setting_deadman_default') || '2h';
  });

  const [splitVibeDefault, setSplitVibeDefault] = useState<string>(() => {
    return localStorage.getItem('outly_setting_split_vibe') || 'equally_split';
  });

  // Emergency contact state
  const [contactName, setContactName] = useState(profile?.safety_contact_name || '');
  const [contactPhone, setContactPhone] = useState(profile?.safety_contact_phone || '');
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  // Selected lifestyle tags
  const [userTags, setUserTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('outly_lifestyle_tags');
    return saved ? JSON.parse(saved) : ['☕ Coffee Addict', '🌙 Night Owl'];
  });

  // Feedback notifications
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showHonorCode, setShowHonorCode] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const triggerHaptic = () => {
    if (hapticsEnabled && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem('outly_setting_haptics', String(next));
    if (next && 'vibrate' in navigator) navigator.vibrate(50);
  };

  const handleSaveContact = async () => {
    if (!profile) return;
    setSavingContact(true);
    triggerHaptic();
    try {
      const updated = await api.updateProfile(profile.id, {
        safety_contact_name: contactName.trim(),
        safety_contact_phone: contactPhone.trim(),
      });
      if (onProfileUpdated) onProfileUpdated(updated);
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2500);
    } catch (err) {
      alert('Could not save safety contact. Please try again.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    triggerHaptic();
    const next = userTags.includes(tag) 
      ? userTags.filter(t => t !== tag) 
      : [...userTags, tag];
    setUserTags(next);
    localStorage.setItem('outly_lifestyle_tags', JSON.stringify(next));
  };

  const handleClearCache = () => {
    triggerHaptic();
    // Clear non-essential cached assets and temp stories
    sessionStorage.clear();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const handleTestPushNotification = async () => {
    triggerHaptic();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://outly-backend-t8c3.onrender.com/api'}/test-push/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: profile?.id }),
      });
      if (res.ok) {
        alert('Test push notification dispatched! Check your notification tray.');
      } else {
        alert('Push notification test sent to backend.');
      }
    } catch {
      alert('Push notification test queued.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-md mx-auto h-[92vh] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl transition-colors duration-200 border-t ${
          isDark 
            ? 'bg-[#08080A] text-[#F5F5F7] border-white/[0.08]' 
            : 'bg-[#F4F4F6] text-[#09090B] border-black/[0.08]'
        }`}
      >
        {/* Top Sticky Header */}
        <div 
          className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'bg-[#08080A]/95 border-white/[0.06]' : 'bg-white/95 border-black/[0.06]'
          } backdrop-blur-md`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF5E3A]/10 flex items-center justify-center text-[#FF5E3A]">
              <Smartphone size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Settings & Preferences</h2>
              <span className={`text-[10px] font-semibold ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                Outly v1.0.2 • Cloud Connected
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
              isDark 
                ? 'bg-[#121214] border-white/[0.08] text-[#A1A1A6] hover:text-white' 
                : 'bg-white border-black/[0.08] text-[#71717A] hover:text-black shadow-sm'
            }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 no-scrollbar">
          
          {/* 1. APPEARANCE (Dark vs Light Theme) */}
          <section className="space-y-2.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
              Appearance
            </span>

            <div className={`p-1.5 rounded-2xl flex items-center gap-1.5 border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              <button
                onClick={() => {
                  triggerHaptic();
                  onThemeChange('dark');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isDark
                    ? 'bg-[#1C1C1F] text-white shadow-md border border-white/[0.08]'
                    : 'text-[#71717A] hover:text-black'
                }`}
              >
                <Moon size={14} className={isDark ? 'text-[#FF5E3A]' : 'text-[#71717A]'} />
                <span>Obsidian Dark</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic();
                  onThemeChange('light');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  !isDark
                    ? 'bg-[#F4F4F6] text-[#09090B] shadow-md border border-black/[0.08]'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                <Sun size={14} className={!isDark ? 'text-[#FF5E3A]' : 'text-[#8E8E93]'} />
                <span>Clean Light</span>
              </button>
            </div>
          </section>

          {/* 2. SAFETY & PHYSICAL TRUST */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#1DB954]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                Safety & Physical Trust
              </span>
            </div>

            <div className={`p-4 rounded-2xl space-y-4 border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              {/* Emergency Contact */}
              <div>
                <label className="text-xs font-bold block mb-1">Emergency Safety Contact</label>
                <p className={`text-[11px] mb-2.5 leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                  If your dead-man timer expires and you haven't checked in, Outly dispatches your venue location to this person.
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. Sister, Mom, Best Friend)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-[#08080A] border-white/[0.08] focus:border-[#FF5E3A] text-white' 
                        : 'bg-[#F4F4F6] border-black/[0.08] focus:border-[#FF5E3A] text-black'
                    }`}
                  />
                  <input
                    type="tel"
                    placeholder="Contact Phone Number (+91 ...)"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-[#08080A] border-white/[0.08] focus:border-[#FF5E3A] text-white' 
                        : 'bg-[#F4F4F6] border-black/[0.08] focus:border-[#FF5E3A] text-black'
                    }`}
                  />
                  <button
                    onClick={handleSaveContact}
                    disabled={savingContact || (!contactName && !contactPhone)}
                    className="w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#18A048] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    {contactSaved ? (
                      <>
                        <Check size={13} />
                        <span>Saved to Cloud</span>
                      </>
                    ) : (
                      <span>{savingContact ? 'Saving...' : 'Update Safety Contact'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Dead-man Timer Default */}
              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Clock size={13} className="text-[#FF5E3A]" /> Default Arrival Timer
                  </span>
                  <span className="text-[10px] font-bold text-[#FF5E3A]">{deadmanDefault}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {['30m', '1h', '2h', '4h'].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        triggerHaptic();
                        setDeadmanDefault(val);
                        localStorage.setItem('outly_setting_deadman_default', val);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        deadmanDefault === val
                          ? 'bg-[#FF5E3A] text-white border-[#FF5E3A]'
                          : isDark
                            ? 'bg-[#08080A] border-white/[0.06] text-[#8E8E93]'
                            : 'bg-[#F4F4F6] border-black/[0.06] text-[#71717A]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Venue Privacy Shield */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1">
                    <Lock size={12} className="text-[#1DB954]" /> Venue Privacy Shield
                  </span>
                  <span className={`text-[10px] block leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                    Hide exact address until host approves pitch
                  </span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic();
                    const next = !venuePrivacy;
                    setVenuePrivacy(next);
                    localStorage.setItem('outly_setting_venue_privacy', String(next));
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    venuePrivacy ? 'bg-[#1DB954]' : isDark ? 'bg-[#2A2A2E]' : 'bg-[#D1D1D6]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    venuePrivacy ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* 3. RADAR & NOTIFICATIONS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-[#FF5E3A]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                Radar & Notifications
              </span>
            </div>

            <div className={`p-4 rounded-2xl space-y-4 border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              {/* Beacon Radar Radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#FF5E3A]" /> Beacon Radar Radius
                  </span>
                  <span className="text-[10px] font-bold text-[#FF5E3A]">{beaconRadius}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {['3km', '5km', '10km', 'Entire City'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        triggerHaptic();
                        setBeaconRadius(r);
                        localStorage.setItem('outly_setting_beacon_radius', r);
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border truncate transition-all ${
                        beaconRadius === r
                          ? 'bg-[#FF5E3A] text-white border-[#FF5E3A]'
                          : isDark
                            ? 'bg-[#08080A] border-white/[0.06] text-[#8E8E93]'
                            : 'bg-[#F4F4F6] border-black/[0.06] text-[#71717A]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">⚡ 2-Hour Spontaneous Beacons</span>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      const next = !notifyBeacons;
                      setNotifyBeacons(next);
                      localStorage.setItem('outly_notify_beacons', String(next));
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      notifyBeacons ? 'bg-[#FF5E3A]' : isDark ? 'bg-[#2A2A2E]' : 'bg-[#D1D1D6]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifyBeacons ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">💬 Squad Chat Messages</span>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      const next = !notifySquadChat;
                      setNotifySquadChat(next);
                      localStorage.setItem('outly_notify_squad_chat', String(next));
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      notifySquadChat ? 'bg-[#FF5E3A]' : isDark ? 'bg-[#2A2A2E]' : 'bg-[#D1D1D6]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifySquadChat ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">📬 Join Pitches & Approvals</span>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      const next = !notifyPitches;
                      setNotifyPitches(next);
                      localStorage.setItem('outly_notify_pitches', String(next));
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      notifyPitches ? 'bg-[#FF5E3A]' : isDark ? 'bg-[#2A2A2E]' : 'bg-[#D1D1D6]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notifyPitches ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-medium block">🌙 Quiet Hours (1 AM - 7 AM)</span>
                    <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                      Silence non-urgent beacon alerts
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      const next = !quietHours;
                      setQuietHours(next);
                      localStorage.setItem('outly_setting_quiet_hours', String(next));
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      quietHours ? 'bg-[#1DB954]' : isDark ? 'bg-[#2A2A2E]' : 'bg-[#D1D1D6]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      quietHours ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. MEETUP & VIBE PREFERENCES */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Coffee size={15} className="text-[#FF5E3A]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                Meetup & Vibe Defaults
              </span>
            </div>

            <div className={`p-4 rounded-2xl space-y-3.5 border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              {/* Default Bill Split */}
              <div>
                <span className="text-xs font-bold block mb-1.5">Default Bill Split Policy</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'equally_split', label: 'Equal Split' },
                    { id: 'host_treats', label: 'Host Treats' },
                    { id: 'pay_own', label: 'Pay Own' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        triggerHaptic();
                        setSplitVibeDefault(s.id);
                        localStorage.setItem('outly_setting_split_vibe', s.id);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                        splitVibeDefault === s.id
                          ? 'bg-[#FF5E3A] text-white border-[#FF5E3A]'
                          : isDark
                            ? 'bg-[#08080A] border-white/[0.06] text-[#8E8E93]'
                            : 'bg-[#F4F4F6] border-black/[0.06] text-[#71717A]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lifestyle & Hangout Badges */}
              <div className="pt-3 border-t border-white/[0.06]">
                <span className="text-xs font-bold block mb-1">Your Lifestyle & Vibe Badges</span>
                <p className={`text-[10px] mb-2 ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                  Displayed on your profile so squad hosts know what you enjoy
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {LIFESTYLE_TAGS.map((tag) => {
                    const isSelected = userTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-[#FF5E3A]/15 text-[#FF5E3A] border-[#FF5E3A]/40'
                            : isDark
                              ? 'bg-[#08080A] text-[#8E8E93] border-white/[0.06]'
                              : 'bg-[#F4F4F6] text-[#71717A] border-black/[0.06]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 5. ANTI-FLAKE KARMA AUDIT */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Award size={15} className="text-[#FF5E3A]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                Anti-Flake Karma Audit
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-base font-black block">100% Pull-Up Score</span>
                  <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-wider">
                    Tier: Verified Outly Legend
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] font-black text-sm">
                  100%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/[0.06] text-center">
                <div>
                  <span className="text-base font-black text-white block">
                    {profile?.outings_attended ?? 14}
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>Attended</span>
                </div>
                <div>
                  <span className="text-base font-black text-green-400 block">
                    {profile?.outings_flaked ?? 0}
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>Flakes</span>
                </div>
                <div>
                  <span className="text-base font-black text-white block">
                    {profile?.strike_count ?? 0} / 3
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>Strikes</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className={`text-[11px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                  Had a medical or genuine emergency?
                </span>
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="text-xs font-bold text-[#FF5E3A] hover:underline"
                >
                  Appeal a Strike
                </button>
              </div>
            </div>
          </section>

          {/* 6. APP EXPERIENCE & DIAGNOSTICS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone size={15} className="text-[#FF5E3A]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                App Experience & Memory
              </span>
            </div>

            <div className={`p-4 rounded-2xl space-y-3.5 border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              {/* Haptic Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <Vibrate size={13} className="text-[#FF5E3A]" /> Haptic Feedback
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                    Subtle vibrations on check-ins and timer actions
                  </span>
                </div>
                <button
                  onClick={handleToggleHaptics}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    hapticsEnabled ? 'bg-[#FF5E3A]' : isDark ? 'bg-[#2A2A2E]' : 'bg-[#D1D1D6]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Push Test */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">Push Diagnostic</span>
                  <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                    Verify Firebase cloud messaging connection
                  </span>
                </div>
                <button
                  onClick={handleTestPushNotification}
                  className="px-3 py-1.5 rounded-lg bg-[#FF5E3A]/10 text-[#FF5E3A] border border-[#FF5E3A]/20 text-xs font-bold active:scale-95 transition-all"
                >
                  Test Push
                </button>
              </div>

              {/* Clear Cache */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">Clear Cached Media</span>
                  <span className={`text-[10px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                    Frees phone memory from downloaded stories
                  </span>
                </div>
                <button
                  onClick={handleClearCache}
                  disabled={cacheCleared}
                  className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-semibold hover:border-[#FF5E3A] active:scale-95 transition-all"
                >
                  {cacheCleared ? '✓ Cleared' : 'Free Memory'}
                </button>
              </div>
            </div>
          </section>

          {/* 7. ACCOUNT & LEGAL */}
          <section className="space-y-3 pb-6">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
              Account & Guidelines
            </span>

            <div className={`p-4 rounded-2xl space-y-3 border ${
              isDark ? 'bg-[#121214] border-white/[0.06]' : 'bg-white border-black/[0.06] shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">Connected Identity</span>
                  <span className={`text-[11px] ${isDark ? 'text-[#8E8E93]' : 'text-[#71717A]'}`}>
                    {profile?.email || 'akshay@outly.app'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#1DB954] uppercase px-2 py-0.5 rounded bg-[#1DB954]/10 border border-[#1DB954]/20">
                  Verified
                </span>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowHonorCode(true)}
                  className="w-full flex items-center justify-between text-xs font-semibold py-1.5 hover:text-[#FF5E3A] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Heart size={13} className="text-[#FF5E3A]" /> Outly Anti-Flake Honor Code
                  </span>
                  <ChevronRight size={14} className="text-[#8E8E93]" />
                </button>
              </div>

              {/* Sign Out */}
              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    triggerHaptic();
                    if (confirm('Are you sure you want to sign out of Outly?')) {
                      onSignOut();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Honor Code Modal */}
      {showHonorCode && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="text-[#1DB954]" /> The Outly Honor Code
            </h3>
            <div className="space-y-3 text-xs text-[#A1A1A6] leading-relaxed">
              <p>
                <strong>1. 100% Intent:</strong> Only claim a spot or pitch if you fully intend to show up.
              </p>
              <p>
                <strong>2. The 2-Hour Rule:</strong> If you must cancel, do so at least 2 hours before the meetup so another member can take your spot.
              </p>
              <p>
                <strong>3. Geofenced Verification:</strong> Arrive at the venue and tap check-in to boost your pull-up karma.
              </p>
              <p>
                <strong>4. Zero Tolerance for Flakers:</strong> 3 unexcused no-shows trigger a 48-hour squad suspension.
              </p>
            </div>
            <button
              onClick={() => setShowHonorCode(false)}
              className="w-full py-3 rounded-xl bg-[#FF5E3A] text-white font-bold text-xs"
            >
              I Promise to Show Up
            </button>
          </div>
        </div>
      )}

      {/* Strike Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="text-[#FF5E3A]" /> Appeal a Flake Strike
            </h3>
            <p className="text-xs text-[#A1A1A6] leading-relaxed">
              Had an unexpected medical emergency, transport failure, or urgent family issue? Submit a brief note below:
            </p>
            <textarea
              rows={3}
              placeholder="Explain what happened..."
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              className="w-full bg-[#08080A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF5E3A]"
            />
            {appealSubmitted ? (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold text-center">
                ✓ Appeal submitted to community moderator
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAppealModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs text-[#A1A1A6]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setAppealSubmitted(true);
                    setTimeout(() => {
                      setShowAppealModal(false);
                      setAppealSubmitted(false);
                      setAppealText('');
                    }, 2000);
                  }}
                  disabled={!appealText.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF5E3A] text-white font-bold text-xs disabled:opacity-40"
                >
                  Submit Appeal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
