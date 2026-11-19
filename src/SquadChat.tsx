import React, { useState, useEffect } from 'react';
import { X, Send, Check, IndianRupee } from 'lucide-react';
import { supabase } from './supabase';

interface Request {
  id: string;
  applicant_id: string;
  pitch_message: string;
  status: string;
  applicant?: {
    full_name: string;
    username: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string;
  };
}

interface Props {
  planId: string;
  planTitle: string;
  isHost: boolean;
  currentUserId: string;
  onClose: () => void;
}

export default function SquadChat({ planId, planTitle, isHost, currentUserId, onClose }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'requests'>('chat');

  // Load requests (for Host)
  const fetchRequests = async () => {
    const { data } = await supabase
      .from('plan_requests')
      .select('*, applicant:profiles(full_name, username)')
      .eq('plan_id', planId);
    if (data) setRequests(data as Request[]);
  };

  // Load squad messages
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('plan_messages')
      .select('*, sender:profiles(full_name)')
      .eq('plan_id', planId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  useEffect(() => {
    fetchRequests();
    fetchMessages();

    // Subscribe to real-time chat messages
    const channel = supabase
      .channel(`plan-chat-${planId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'plan_messages', filter: `plan_id=eq.${planId}` },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [planId]);

  const handleAcceptRequest = async (requestId: string) => {
    await supabase.from('plan_requests').update({ status: 'accepted' }).eq('id', requestId);
    // Increment claimed slots
    await supabase.rpc('increment_plan_slots', { p_id: planId });
    fetchRequests();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('plan_messages').insert({
      plan_id: planId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    setNewMessage('');
    fetchMessages();
  };

  // Deep-link UPI split
  const triggerUpiPayment = (amount: number) => {
    const upiUrl = `upi://pay?pa=akshay@oksbi&pn=Akshay&am=${amount}&cu=INR&tn=Outly%20Share%20for%20${encodeURIComponent(planTitle)}`;
    window.location.href = upiUrl;
  };

  return (
    <div className="fixed inset-0 bg-[#08080A] z-50 flex justify-center">
      <div className="w-full max-w-md h-full flex flex-col bg-[#08080A] border-x border-[#1C1C1F]">
        
        {/* Top Chat Bar */}
        <header className="px-5 pt-12 pb-3 border-b border-[#1C1C1F] flex items-center justify-between bg-[#121214]">
          <div className="flex-1 truncate mr-3">
            <span className="text-[10px] text-[#FF5E3A] font-bold uppercase tracking-wider">Active Squad</span>
            <h2 className="text-base font-bold text-white truncate">{planTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => triggerUpiPayment(250)}
              title="Split Share"
              className="px-2.5 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-[#1DB954] flex items-center gap-1 active:scale-95"
            >
              <IndianRupee size={12} /> Pay Split
            </button>
            <button onClick={onClose} className="text-[#A1A1A6] p-1">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Tab Toggle if Host */}
        {isHost && (
          <div className="flex border-b border-[#1C1C1F] text-xs font-semibold bg-[#0D0D0F]">
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`flex-1 py-3 text-center transition-colors ${activeTab === 'chat' ? 'text-white border-b-2 border-[#FF5E3A]' : 'text-[#636366]'}`}
            >
              Coordination Chat
            </button>
            <button 
              onClick={() => setActiveTab('requests')} 
              className={`flex-1 py-3 text-center transition-colors ${activeTab === 'requests' ? 'text-white border-b-2 border-[#FF5E3A]' : 'text-[#636366]'}`}
            >
              Join Requests ({requests.filter(r => r.status === 'pending').length})
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'requests' && isHost ? (
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {requests.length === 0 ? (
              <p className="text-xs text-[#636366] text-center py-10">No join requests yet.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#F5F5F7]">{req.applicant?.full_name || 'Anonymous'}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      req.status === 'accepted' ? 'bg-[#1DB954]/20 text-[#1DB954]' : 'bg-[#FF5E3A]/20 text-[#FF5E3A]'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1A6] italic">"{req.pitch_message}"</p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        className="flex-1 py-2 rounded-xl bg-[#1DB954] text-black font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Check size={14} /> Accept into Squad
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              <div className="p-3 rounded-2xl bg-[#1C1C1F]/40 border border-[#2A2A2E]/50 text-center text-[11px] text-[#A1A1A6]">
                🔒 <strong>Ephemeral Squad:</strong> This thread is only visible to confirmed members and self-destructs after the outing.
              </div>

              {messages.map(msg => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-[#636366] px-2 mb-0.5">
                      {isMe ? 'You' : msg.sender?.full_name || 'Member'}
                    </span>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs ${
                      isMe 
                        ? 'bg-[#FF5E3A] text-white rounded-br-none' 
                        : 'bg-[#121214] border border-[#2A2A2E] text-[#F5F5F7] rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1C1C1F] bg-[#121214] flex gap-2">
              <input 
                type="text" 
                placeholder="Coordinate meeting spot..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 bg-[#08080A] border border-[#2A2A2E] rounded-full px-4 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
              />
              <button 
                type="submit" 
                className="h-9 w-9 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center shrink-0 active:scale-95"
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