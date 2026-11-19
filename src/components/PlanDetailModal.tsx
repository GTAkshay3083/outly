import { useState } from 'react';
import { X, MapPin, Users, IndianRupee, ShieldCheck, Clock, Send } from 'lucide-react';
import type { OutingPlan } from '../types';
import { api } from '../api';
import { getReputationTier } from '../utils/reputation';

interface Props {
  plan: OutingPlan;
  currentUserId: string;
  userRequestStatus?: 'pending' | 'accepted' | 'declined';
  onClose: () => void;
  onOpenSquad: (plan: OutingPlan) => void;
  onRequestSubmitted: () => void;
  isSuspended: boolean;
  onOpenUserProfile?: (user: any) => void;
}

export default function PlanDetailModal({
  plan,
  currentUserId,
  userRequestStatus,
  onClose,
  onOpenSquad,
  onRequestSubmitted,
  isSuspended,
  onOpenUserProfile,
}: Props) {
  const [pitchText, setPitchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isHost = plan.host_id === currentUserId;
  const isAccepted = userRequestStatus === 'accepted';
  const isPending = userRequestStatus === 'pending';

  const formatPlanTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'Upcoming';
    }
  };

  const handleJoinRequest = async () => {
    if (isSuspended) return;
    if (!pitchText.trim()) {
      alert('Please write a quick pitch message before requesting to join!');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitJoinRequest(plan.id, currentUserId, pitchText.trim());
      setSubmitting(false);
      alert('Join request sent to the host!');
      onRequestSubmitted();
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      alert('Error requesting to join: ' + (err.message || 'Unknown error'));
    }
  };

  const hostAttended = plan.host?.outings_attended || 0;
  const hostFlaked = plan.host?.outings_flaked || 0;
  const hostTier = getReputationTier(hostAttended, hostFlaked);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[85vh] overflow-y-auto"
      >
        
        <div className="w-12 h-1 bg-[#2A2A2E] rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-[#FF5E3A] uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} /> {formatPlanTime(plan.scheduled_time)}
          </span>
          <button onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <h2 className="text-2xl font-black mt-1 text-[#F5F5F7] tracking-tight">{plan.title}</h2>
        
        <p className="text-xs text-[#A1A1A6] mt-1.5 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#FF5E3A] shrink-0" />
          <span>{plan.venue} • {plan.area_neighborhood}</span>
        </p>

        {/* Host Vibe Badge */}
        <div 
          onClick={() => plan.host && onOpenUserProfile?.(plan.host)}
          className="mt-4 p-3.5 rounded-2xl bg-[#08080A] border border-[#2A2A2E] hover:border-[#FF5E3A]/40 transition-colors cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#FF5E3A]/20 border border-[#FF5E3A]/40 flex items-center justify-center font-bold text-[#FF5E3A] overflow-hidden group-hover:scale-105 transition-transform">
              {plan.host?.avatar_url ? (
                <img src={plan.host.avatar_url} alt={plan.host.full_name} className="h-full w-full object-cover" />
              ) : (
                (plan.host?.full_name || 'H')[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#F5F5F7] group-hover:text-[#FF5E3A] transition-colors">{plan.host?.full_name || 'Host'}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase flex items-center gap-1 ${hostTier.badgeClass}`}>
                  <span>{hostTier.emoji}</span>
                  <span>{hostTier.title}</span>
                </span>
              </div>
              <span className="text-[11px] text-[#A1A1A6]">
                {hostTier.score}% Pull-up • <span className="text-[#FF5E3A] font-semibold underline decoration-dotted">View Profile</span>
              </span>
              {plan.host?.bio && (
                <p className="text-[10px] text-[#636366] italic mt-0.5 max-w-[200px] truncate">
                  "{plan.host.bio}"
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#636366] block">Safety Protocol</span>
            <span className="text-[11px] font-semibold text-[#1DB954] flex items-center gap-1">
              <ShieldCheck size={12} /> Public Venue
            </span>
          </div>
        </div>

        {/* Spots & Split Info */}
        <div className="my-4 p-4 rounded-2xl bg-[#1C1C1F] border border-[#2A2A2E]/60 text-xs text-[#A1A1A6] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-[#A1A1A6]" />
            <span>Spots: <strong className="text-white">{plan.slots_claimed} / {plan.slots_total}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee size={14} className="text-[#1DB954]" />
            <span>Bill Vibe: <strong className="text-white">{plan.split_vibe}</strong></span>
          </div>
        </div>

        {/* Context-aware Actions */}
        {isHost ? (
          <button
            onClick={() => onOpenSquad(plan)}
            className="w-full py-4 rounded-2xl bg-[#FF5E3A] text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[#FF5E3A]/20"
          >
            Manage Squad & Requests
          </button>
        ) : isAccepted ? (
          <button
            onClick={() => onOpenSquad(plan)}
            className="w-full py-4 rounded-2xl bg-[#1DB954] text-black font-extrabold text-sm active:scale-95 transition-transform shadow-lg shadow-[#1DB954]/20"
          >
            Enter Squad Chat
          </button>
        ) : isPending ? (
          <div className="p-4 rounded-2xl bg-[#1C1C1F] text-center text-xs text-[#A1A1A6] border border-[#2A2A2E]">
            ⏳ Your join request is currently pending host approval. The private squad chat opens once accepted.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-[#A1A1A6] font-semibold block mb-1.5">
                Pitch yourself to the host in 1 line
              </label>
              <textarea
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                rows={2}
                placeholder="e.g. 'Huge Nolan fan, grabbing center seats!' or 'Playing midfield, bringing extra gear'"
                className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-2xl p-3.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A] placeholder-[#636366] resize-none"
              />
            </div>

            <button
              onClick={handleJoinRequest}
              disabled={submitting || isSuspended}
              className="w-full py-4 rounded-2xl bg-[#FF5E3A] text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[#FF5E3A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{submitting ? 'Sending Request...' : 'Request to Join Squad'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
