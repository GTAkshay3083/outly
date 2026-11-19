import { useState, useEffect } from 'react';
import { X, Send, Check, Crown, UserX, AlertTriangle, IndianRupee, ShieldCheck, Camera, MapPin, CheckCircle2 } from 'lucide-react';
import type { OutingPlan, Request, Message } from '../types';
import { api } from '../api';
import { getReputationTier } from '../utils/reputation';

interface Props {
  plan: OutingPlan;
  currentUserId: string;
  onClose: () => void;
  onPlanUpdated: () => void;
  onOpenUserProfile?: (user: any) => void;
  onOpenStoryStudio?: (plan: OutingPlan) => void;
}

export default function SquadRoomModal({ plan, currentUserId, onClose, onPlanUpdated, onOpenUserProfile, onOpenStoryStudio }: Props) {
  const isHost = plan.host_id === currentUserId;
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'requests'>('chat');
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    return Boolean(localStorage.getItem(`outly_checked_in_${plan.id}_${currentUserId}`));
  });
  const [checkingIn, setCheckingIn] = useState(false);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.checkInMember(plan.id, currentUserId);
      setIsCheckedIn(true);
      localStorage.setItem(`outly_checked_in_${plan.id}_${currentUserId}`, 'true');
      fetchSquadData();
      onPlanUpdated();
      alert('You have verified your arrival! Attendance recorded on your Outly profile.');
    } catch (err: any) {
      alert('Check-in error: ' + (err.message || 'Could not verify location'));
    } finally {
      setCheckingIn(false);
    }
  };

  const fetchSquadData = async () => {
    try {
      const [reqs, msgs] = await Promise.all([
        api.getPlanRequests(plan.id),
        api.getPlanMessages(plan.id),
      ]);
      setRequests(reqs);
      setMessages(msgs);
    } catch (e) {
      console.warn('Failed to fetch squad data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquadData();
    // Live polling for squad room coordination
    const interval = setInterval(fetchSquadData, 2500);
    return () => clearInterval(interval);
  }, [plan.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    await api.sendMessage(plan.id, currentUserId, newChatMessage.trim());
    setNewChatMessage('');
    fetchSquadData();
  };

  const handleAcceptRequest = async (requestId: string) => {
    await api.acceptRequest(requestId);
    fetchSquadData();
    onPlanUpdated();
  };

  const handleRemoveMember = async (requestId: string) => {
    if (!confirm('Are you sure you want to remove this member from the squad?')) return;
    await api.declineRequest(requestId);
    fetchSquadData();
    onPlanUpdated();
  };

  const triggerUpiPayment = (amount: number, title: string) => {
    const upiUrl = `upi://pay?pa=akshay@oksbi&pn=Akshay&am=${amount}&cu=INR&tn=Outly%20Share%20for%20${encodeURIComponent(title)}`;
    window.location.href = upiUrl;
  };

  const acceptedMembers = requests.filter((r) => r.status === 'accepted');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="fixed inset-0 bg-[#08080A] z-50 flex justify-center animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full flex flex-col bg-[#08080A] border-x border-[#1C1C1F]">
        
        {/* Top Squad Bar */}
        <header className="px-5 pt-12 pb-3 border-b border-[#1C1C1F] flex items-center justify-between bg-[#121214]">
          <div className="flex-1 truncate mr-3">
            <span className="text-[10px] text-[#FF5E3A] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={11} className="text-[#1DB954]" /> Active Ephemeral Squad
            </span>
            <h2 className="text-base font-bold text-white truncate">{plan.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenStoryStudio?.(plan)}
              className="px-2.5 py-1.5 rounded-full bg-[#FF5E3A]/20 border border-[#FF5E3A]/40 text-xs font-bold text-white flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Camera size={13} className="text-[#FF5E3A]" /> Story
            </button>
            <button
              onClick={() => triggerUpiPayment(250, plan.title)}
              className="px-2.5 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-[#1DB954] flex items-center gap-1 active:scale-95"
            >
              <IndianRupee size={12} /> Pay Split
            </button>
            <button onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* 3-Way Tab Strip */}
        <div className="flex border-b border-[#1C1C1F] text-xs font-semibold bg-[#0D0D0F]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'chat' ? 'text-white border-b-2 border-[#FF5E3A]' : 'text-[#636366]'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'members' ? 'text-white border-b-2 border-[#FF5E3A]' : 'text-[#636366]'
            }`}
          >
            Squad ({1 + acceptedMembers.length})
          </button>
          {isHost && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 text-center transition-colors relative ${
                activeTab === 'requests' ? 'text-white border-b-2 border-[#FF5E3A]' : 'text-[#636366]'
              }`}
            >
              Requests ({pendingRequests.length})
              {pendingRequests.length > 0 && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#FF5E3A]" />
              )}
            </button>
          )}
        </div>

        {/* TAB 1: MEMBERS ROSTER */}
        {activeTab === 'members' ? (
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            <div className="text-[11px] text-[#A1A1A6] font-semibold uppercase tracking-wider mb-2">
              Confirmed Attendants ({1 + acceptedMembers.length} / {plan.slots_total})
            </div>

            {/* Geofenced Arrival Check-In Banner (Feature 3) */}
            <div className="p-4 rounded-2xl bg-[#121214] border border-[#2A2A2E] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#FF5E3A]" /> Venue Arrival Radar
                </span>
                <span className="text-[10px] text-[#1DB954] font-bold bg-[#1DB954]/10 px-2 py-0.5 rounded-full border border-[#1DB954]/20">
                  {isCheckedIn ? 'Verified Present 📍' : 'Ready to Check In'}
                </span>
              </div>

              {isCheckedIn ? (
                <div className="p-2.5 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 text-center">
                  <span className="font-extrabold text-xs text-[#1DB954] flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} /> You're checked in! Attendance credited.
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1db954]/90 text-black font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md shadow-[#1DB954]/20 disabled:opacity-50"
                >
                  <MapPin size={14} />
                  <span>{checkingIn ? 'Verifying Location...' : "I'm Here! Check In at Venue"}</span>
                </button>
              )}
            </div>

            {/* The Host */}
            <div 
              onClick={() => plan.host && onOpenUserProfile?.(plan.host)}
              className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] hover:border-[#FF5E3A]/40 flex items-center justify-between cursor-pointer transition-colors group"
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
                    <span className="font-bold text-sm text-[#F5F5F7] group-hover:text-[#FF5E3A] transition-colors">{plan.host?.full_name || 'Host'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#FF5E3A]/20 text-[#FF5E3A] flex items-center gap-0.5">
                      <Crown size={9} /> Host
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A1A1A6] flex items-center gap-1">
                    Organized this plan • <span className="text-[#FF5E3A] underline decoration-dotted font-semibold">View Profile</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Accepted Members */}
            {acceptedMembers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#1C1C1F] text-xs text-[#636366]">
                No other members have joined yet. Share your plan link to fill spots!
              </div>
            ) : (
              acceptedMembers.map((req) => {
                const attended = req.applicant?.outings_attended || 0;
                const flaked = req.applicant?.outings_flaked || 0;
                const strikes = req.applicant?.strike_count || 0;
                const memberTier = getReputationTier(attended, flaked, strikes);

                return (
                  <div key={req.id} className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] hover:border-[#2A2A2E] flex items-center justify-between transition-colors">
                    <div 
                      onClick={() => req.applicant && onOpenUserProfile?.(req.applicant)}
                      className="flex items-center gap-3 cursor-pointer group flex-1"
                    >
                      <div className="h-10 w-10 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] flex items-center justify-center font-bold text-white uppercase overflow-hidden group-hover:scale-105 transition-transform">
                        {req.applicant?.avatar_url ? (
                          <img src={req.applicant.avatar_url} alt={req.applicant.full_name} className="h-full w-full object-cover" />
                        ) : (
                          (req.applicant?.full_name || 'M')[0]
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#F5F5F7] group-hover:text-[#FF5E3A] transition-colors block">
                          {req.applicant?.full_name || 'Member'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase flex items-center gap-1 ${memberTier.badgeClass}`}
                          >
                            <span>{memberTier.emoji}</span>
                            <span>{memberTier.title}</span>
                          </span>
                          {req.checked_in && (
                            <span className="text-[9px] font-bold text-[#1DB954] flex items-center gap-0.5 bg-[#1DB954]/10 px-1.5 py-0.5 rounded-full border border-[#1DB954]/20">
                              <CheckCircle2 size={9} /> Arrived
                            </span>
                          )}
                          <span className="text-[10px] text-[#636366] group-hover:text-[#A1A1A6]">
                            • Tap for Profile
                          </span>
                        </div>
                      </div>
                    </div>

                    {isHost && (
                      <button
                        onClick={() => handleRemoveMember(req.id)}
                        className="p-2 rounded-xl bg-[#1C1C1F] hover:bg-red-950/40 text-[#A1A1A6] hover:text-red-400 border border-[#2A2A2E] active:scale-95 transition-colors"
                        title="Remove member"
                      >
                        <UserX size={15} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === 'requests' && isHost ? (
          /* TAB 2: PENDING JOIN REQUESTS */
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-xs text-[#636366] text-center py-12">No pending join requests.</p>
            ) : (
              pendingRequests.map((req) => {
                const attended = req.applicant?.outings_attended || 0;
                const flaked = req.applicant?.outings_flaked || 0;
                const strikes = req.applicant?.strike_count || 0;
                const applicantTier = getReputationTier(attended, flaked, strikes);

                return (
                  <div key={req.id} className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div 
                        onClick={() => req.applicant && onOpenUserProfile?.(req.applicant)}
                        className="cursor-pointer group flex-1"
                      >
                        <span className="font-bold text-sm text-[#F5F5F7] group-hover:text-[#FF5E3A] transition-colors block">
                          {req.applicant?.full_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase flex items-center gap-1 ${applicantTier.badgeClass}`}
                          >
                            <span>{applicantTier.emoji}</span>
                            <span>{applicantTier.title}</span>
                          </span>
                          <span className="text-[10px] text-[#A1A1A6] underline decoration-dotted">
                            View Profile
                          </span>
                          {strikes > 0 && (
                            <span className="text-[10px] text-[#FF5E3A] flex items-center gap-0.5 font-bold">
                              <AlertTriangle size={10} /> {strikes} strike(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#A1A1A6] italic mt-1">"{req.pitch_message}"</p>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="flex-1 py-2.5 rounded-xl bg-[#1DB954] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <Check size={14} /> Accept into Squad
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* TAB 3: REAL-TIME COORDINATION CHAT */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              <div className="p-3 rounded-2xl bg-[#1C1C1F]/40 border border-[#2A2A2E]/50 text-center text-[11px] text-[#A1A1A6]">
                🔒 <strong>Private Squad Coordination:</strong> Only confirmed members can view this thread. It automatically self-destructs after the plan.
              </div>

              {loading ? (
                <div className="text-center py-8 text-xs text-[#636366]">Loading squad chat...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#636366]">
                  No messages yet. Drop a greeting and coordinate where to meet!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span 
                        onClick={() => !isMe && msg.sender && onOpenUserProfile?.(msg.sender)}
                        className={`text-[10px] px-2 mb-0.5 ${!isMe && msg.sender ? 'cursor-pointer text-[#A1A1A6] hover:text-[#FF5E3A] transition-colors' : 'text-[#636366]'}`}
                      >
                        {isMe ? 'You' : `${msg.sender?.full_name || 'Member'} • View Profile`}
                      </span>
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs ${
                          isMe
                            ? 'bg-[#FF5E3A] text-white rounded-br-none shadow-md shadow-[#FF5E3A]/10'
                            : 'bg-[#121214] border border-[#2A2A2E] text-[#F5F5F7] rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1C1C1F] bg-[#121214] flex gap-2">
              <input
                type="text"
                placeholder="Coordinate meeting spot..."
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                className="flex-1 bg-[#08080A] border border-[#2A2A2E] rounded-full px-4 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
