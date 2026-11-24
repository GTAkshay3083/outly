import { Compass, Calendar, MessageSquare, User, Plus, ShieldCheck } from 'lucide-react';
import type { TabType } from '../types';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCreateModal: () => void;
  onOpenSafetyModal: () => void;
  hasActiveSafetyTimer?: boolean;
  theme?: 'dark' | 'light';
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  onOpenSafetyModal,
  hasActiveSafetyTimer,
  theme = 'dark',
}: Props) {
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pointer-events-none z-30">
      
      {/* Floating Safety Trigger */}
      <div className="flex justify-end mb-2 pointer-events-auto">
        <button
          onClick={onOpenSafetyModal}
          className={`px-3 py-1.5 rounded-full backdrop-blur-xl border text-[11px] font-extrabold flex items-center gap-1.5 shadow-xl active:scale-95 transition-all ${
            hasActiveSafetyTimer
              ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] animate-pulse'
              : isDark
                ? 'bg-[#121214]/90 border-[#2A2A2E] text-[#A1A1A6] hover:text-white'
                : 'bg-white/95 border-black/[0.08] text-[#71717A] hover:text-black shadow-md'
          }`}
        >
          <ShieldCheck size={14} className={hasActiveSafetyTimer ? 'text-[#1DB954]' : 'text-[#1DB954]'} />
          <span>{hasActiveSafetyTimer ? 'Safety Switch Active' : 'Safety Check'}</span>
        </button>
      </div>

      {/* Main Glass Nav Dock */}
      <div className={`pointer-events-auto w-full flex items-center justify-between backdrop-blur-xl border px-4 py-2 rounded-full shadow-2xl transition-colors ${
        isDark ? 'bg-[#121214]/90 border-[#2A2A2E]' : 'bg-white/95 border-black/[0.08] shadow-lg'
      }`}>
        
        {/* Discover Tab */}
        <button
          onClick={() => onTabChange('discover')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'discover' 
              ? 'text-[#FF5E3A]' 
              : isDark ? 'text-[#636366] hover:text-[#A1A1A6]' : 'text-[#A1A1AA] hover:text-[#71717A]'
          }`}
        >
          <Compass size={20} />
          <span className="text-[10px] font-bold">Discover</span>
        </button>

        {/* My Plans Tab */}
        <button
          onClick={() => onTabChange('my_plans')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'my_plans' 
              ? 'text-[#FF5E3A]' 
              : isDark ? 'text-[#636366] hover:text-[#A1A1A6]' : 'text-[#A1A1AA] hover:text-[#71717A]'
          }`}
        >
          <Calendar size={20} />
          <span className="text-[10px] font-bold">My Plans</span>
        </button>

        {/* Center Create Button */}
        <button
          onClick={onOpenCreateModal}
          className="h-11 w-11 -mt-5 rounded-full bg-[#FF5E3A] text-white flex items-center justify-center shadow-lg shadow-[#FF5E3A]/40 active:scale-90 transition-transform"
          aria-label="Start an Outing"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>

        {/* Squads Tab */}
        <button
          onClick={() => onTabChange('squads')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'squads' 
              ? 'text-[#FF5E3A]' 
              : isDark ? 'text-[#636366] hover:text-[#A1A1A6]' : 'text-[#A1A1AA] hover:text-[#71717A]'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-bold">Squads</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile' 
              ? 'text-[#FF5E3A]' 
              : isDark ? 'text-[#636366] hover:text-[#A1A1A6]' : 'text-[#A1A1AA] hover:text-[#71717A]'
          }`}
        >
          <User size={20} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>

      </div>
    </div>
  );
}
