import { useState, useEffect } from 'react';
import { X, ShieldCheck, Clock, Phone, AlertTriangle, Send } from 'lucide-react';
import { api } from '../api';
import type { UserProfile } from '../types';

interface Props {
  userProfile: UserProfile | null;
  onClose: () => void;
  onProfileUpdate: () => void;
}

export default function SafetyModal({ userProfile, onClose, onProfileUpdate }: Props) {
  const [contactName, setContactName] = useState(userProfile?.safety_contact_name || '');
  const [contactPhone, setContactPhone] = useState(userProfile?.safety_contact_phone || '');
  const [savingContact, setSavingContact] = useState(false);
  const [switchDurationHours, setSwitchDurationHours] = useState(3);
  const [activeDeadline, setActiveDeadline] = useState<number | null>(() => {
    const saved = localStorage.getItem('outly_deadman_deadline');
    return saved ? Number(saved) : null;
  });
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    if (!activeDeadline) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = activeDeadline - now;
      if (diff <= 0) {
        setTimeLeftStr('EXPIRED');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeDeadline]);

  const handleStartDeadManSwitch = () => {
    const deadline = Date.now() + switchDurationHours * 3600 * 1000;
    localStorage.setItem('outly_deadman_deadline', deadline.toString());
    setActiveDeadline(deadline);
  };

  const handleDisarm = () => {
    localStorage.removeItem('outly_deadman_deadline');
    setActiveDeadline(null);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSavingContact(true);
    await api.updateProfile(userProfile.id, {
      safety_contact_name: contactName.trim(),
      safety_contact_phone: contactPhone.trim(),
    });
    setSavingContact(false);
    onProfileUpdate();
  };

  const handleSendInstantSos = () => {
    const text = encodeURIComponent(
      `🚨 EMERGENCY ALERT: I am currently out at an Outly meetup and triggered a safety SOS. Please check in on me immediately.`
    );
    const target = contactPhone ? `https://wa.me/${contactPhone.replace(/\D/g, '')}?text=${text}` : `sms:?body=${text}`;
    window.open(target, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
      <div className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F7]">Safety & Check-In</h2>
              <span className="text-[11px] text-[#A1A1A6]">Dead Man's Switch & Emergency Protocols</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Dead Man's Switch */}
        <div className="p-4 rounded-2xl bg-[#08080A] border border-[#2A2A2E] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5E3A] flex items-center gap-1.5">
              <Clock size={13} /> Dead Man's Switch
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              activeDeadline ? 'bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30' : 'bg-[#1C1C1F] text-[#636366]'
            }`}>
              {activeDeadline ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="text-xs text-[#A1A1A6] mb-3 leading-relaxed">
            Going to an outing with new people? Arm a safety countdown. If you don't disarm it with "I'm Safe", Outly prepares an SOS broadcast.
          </p>

          {activeDeadline ? (
            <div className="p-3 rounded-xl bg-[#1C1C1F] border border-[#2A2A2E] flex flex-col items-center gap-2">
              <span className="text-[11px] text-[#A1A1A6]">Time Remaining:</span>
              <span className="text-3xl font-mono font-black text-white tracking-widest">{timeLeftStr}</span>
              <button
                onClick={handleDisarm}
                className="w-full mt-2 py-3 rounded-xl bg-[#1DB954] text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-lg shadow-[#1DB954]/20"
              >
                <ShieldCheck size={16} /> I'm Safe — Disarm Switch
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {[2, 3, 4, 6].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setSwitchDurationHours(hours)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      switchDurationHours === hours
                        ? 'bg-[#FF5E3A] border-[#FF5E3A] text-white'
                        : 'bg-[#121214] border-[#2A2A2E] text-[#A1A1A6]'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
              <button
                onClick={handleStartDeadManSwitch}
                className="w-full py-3 rounded-xl bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-[#FF5E3A]/40 text-[#FF5E3A] font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <Clock size={14} /> Arm Switch for {switchDurationHours} Hours
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Trusted Emergency Contact */}
        <form onSubmit={handleSaveContact} className="p-4 rounded-2xl bg-[#08080A] border border-[#2A2A2E] mb-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] flex items-center gap-1.5">
              <Phone size={13} className="text-[#1DB954]" /> Trusted Emergency Contact
            </span>
          </div>

          <div>
            <label className="text-[11px] text-[#636366] block mb-1">Contact Name</label>
            <input
              type="text"
              placeholder="e.g. Mom, Best Friend, Roommate"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#1DB954]"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#636366] block mb-1">Phone / WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#1DB954]"
            />
          </div>

          <button
            type="submit"
            disabled={savingContact}
            className="w-full py-2.5 rounded-xl bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#F5F5F7] font-semibold text-xs active:scale-95 transition-transform"
          >
            {savingContact ? 'Saving...' : 'Save Emergency Contact'}
          </button>
        </form>

        {/* Section 3: Instant 1-Tap SOS */}
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className="font-bold text-xs text-red-200 block">Instant SOS Trigger</span>
              <span className="text-[10px] text-red-300/70">Discreetly alert emergency contact</span>
            </div>
          </div>
          <button
            onClick={handleSendInstantSos}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-transform shadow-lg shadow-red-600/30"
          >
            <Send size={13} /> Send SOS
          </button>
        </div>

      </div>
    </div>
  );
}
