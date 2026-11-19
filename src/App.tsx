import { useState, useEffect } from 'react';
import { 
  Film, 
  Coffee, 
  Trophy, 
  Music, 
  Gamepad2, 
  Compass, 
  Palette, 
  Sparkles, 
  MapPin, 
  Users, 
  Clock, 
  MessageSquare, 
  Lock, 
  Star,
  ChevronRight,
  Crown,
  Zap,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { api } from './api';
import type { OutingPlan, UserProfile, TabType } from './types';
import { initNativeStatusBar, registerPushNotifications } from './services/nativeService';
import BottomNav from './components/BottomNav';
import CreatePlanModal from './components/CreatePlanModal';
import PlanDetailModal from './components/PlanDetailModal';
import SquadRoomModal from './components/SquadRoomModal';
import SafetyModal from './components/SafetyModal';
import ProfileView from './components/ProfileView';
import RatingModal from './components/RatingModal';
import OnboardingFlow from './components/OnboardingFlow';
import AuthModal from './components/AuthModal';
import CitySelectorModal from './components/CitySelectorModal';
import PublicProfileModal, { type PublicUserSummary } from './components/PublicProfileModal';
import StoryStudioModal from './components/StoryStudioModal';
import { getReputationTier } from './utils/reputation';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'beacons', label: '⚡ Beacons Now', icon: Zap },
  { id: 'girls_only', label: '🌸 Girls-Only', icon: ShieldCheck },
  { id: 'screen_stage', label: 'Screen & Stage', icon: Film },
  { id: 'food_cafes', label: 'Food & Cafes', icon: Coffee },
  { id: 'sports_turf', label: 'Sports & Turf', icon: Trophy },
  { id: 'gigs_nightlife', label: 'Gigs & Night', icon: Music },
  { id: 'arcades_gaming', label: 'Arcades', icon: Gamepad2 },
  { id: 'outdoors_trips', label: 'Outdoors', icon: Compass },
  { id: 'expos_culture', label: 'Culture & Expos', icon: Palette },
];

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('outly_current_user_id') || '00000000-0000-0000-0000-000000000001';
  });

  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [plans, setPlans] = useState<OutingPlan[]>([]);
  const [userRequests, setUserRequests] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Modals state
  const [selectedPlan, setSelectedPlan] = useState<OutingPlan | null>(null);
  const [activeSquadPlan, setActiveSquadPlan] = useState<OutingPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [inspectedUser, setInspectedUser] = useState<PublicUserSummary | null>(null);
  const [storyStudioPlan, setStoryStudioPlan] = useState<OutingPlan | null | 'blank'>(null);
  const [ratingTarget, setRatingTarget] = useState<{ planTitle: string; memberId: string; memberName: string } | null>(null);

  // Safety timer state for badge
  const [hasActiveSafetyTimer, setHasActiveSafetyTimer] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('outly_deadman_deadline'));
  });

  const fetchPlansAndPermissions = async (overrideCity?: string, overrideState?: string) => {
    setLoading(true);

    try {
      const profileData = await api.getProfile(currentUserId);
      setCurrentUserProfile(profileData);

      const city = overrideCity !== undefined ? overrideCity : (profileData?.city || 'Chennai');
      const state = overrideState !== undefined ? overrideState : (profileData?.state || 'Tamil Nadu');

      const [plansData, requestsMapping] = await Promise.all([
        api.getPlans(activeCategory, city, state),
        api.getUserRequests(currentUserId),
      ]);

      setPlans(plansData);
      setUserRequests(requestsMapping);
    } catch (err) {
      console.warn('Error fetching data from Django backend:', err);
    } finally {
      setLoading(false);
      setHasActiveSafetyTimer(Boolean(localStorage.getItem('outly_deadman_deadline')));
    }
  };

  useEffect(() => {
    initNativeStatusBar();
  }, []);

  useEffect(() => {
    fetchPlansAndPermissions();
    registerPushNotifications(currentUserId, (planId) => {
      const match = plans.find((p) => p.id === planId);
      if (match) setActiveSquadPlan(match);
    });
  }, [currentUserId]);

  const handleSwitchUser = (newUserId: string) => {
    localStorage.setItem('outly_current_user_id', newUserId);
    setCurrentUserId(newUserId);
  };

  const handleLocationSelect = async (newCity: string, newState: string) => {
    if (!currentUserProfile) return;
    try {
      const updated = await api.updateProfile(currentUserId, { city: newCity, state: newState });
      setCurrentUserProfile(updated);
      fetchPlansAndPermissions(newCity, newState);
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  const isUserSuspended = (): boolean => {
    if (!currentUserProfile?.suspended_until) return false;
    const suspensionEnd = new Date(currentUserProfile.suspended_until).getTime();
    return suspensionEnd > Date.now();
  };

  const checkSuspensionAlert = (): boolean => {
    if (!isUserSuspended()) return false;
    const suspensionEnd = new Date(currentUserProfile!.suspended_until!).getTime();
    const hoursLeft = Math.ceil((suspensionEnd - Date.now()) / (1000 * 60 * 60));
    alert(
      `🚫 Account Suspended\n\nYou currently have strikes for flaking on outings.\nCooldown lifts in approximately ${hoursLeft} hour(s).`
    );
    return true;
  };

  const formatPlanTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'Upcoming';
    }
  };

  // Filtered plans
  const filteredPlans = plans.filter((p) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'beacons') return p.is_beacon;
    if (activeCategory === 'girls_only') return p.squad_type === 'girls_only';
    return p.category === activeCategory;
  });

  const hostedPlans = plans.filter((p) => p.host_id === currentUserId);
  const acceptedPlans = plans.filter((p) => userRequests[p.id] === 'accepted');
  const pendingPlans = plans.filter((p) => userRequests[p.id] === 'pending');
  const unlockedSquads = plans.filter((p) => p.host_id === currentUserId || userRequests[p.id] === 'accepted');

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F7] flex justify-center selection:bg-[#FF5E3A] selection:text-white">
      <div className="w-full max-w-md min-h-screen flex flex-col border-x border-[#1C1C1F] relative pb-28 shadow-2xl bg-[#08080A]">
        
        {/* Top Header */}
        <header className="px-5 pt-12 pb-3 flex items-center justify-between sticky top-0 bg-[#08080A]/95 backdrop-blur-md z-20 border-b border-[#1C1C1F]">
          <div className="flex items-center gap-2.5">
            <img src="/outly-logo.png" alt="outly" className="w-8 h-8 rounded-xl object-contain shadow-md shadow-[#FF5E3A]/10 border border-white/5" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white lowercase">outly</span>
                <span className="text-[9px] tracking-widest font-extrabold text-[#FF5E3A] uppercase bg-[#FF5E3A]/10 px-1.5 py-0.5 rounded border border-[#FF5E3A]/20">
                  {activeTab === 'discover' && 'City Live'}
                  {activeTab === 'my_plans' && 'Schedule'}
                  {activeTab === 'squads' && 'Squads'}
                  {activeTab === 'profile' && 'Account'}
                </span>
              </div>
              <h1 className="text-xs font-semibold text-[#A1A1A6] tracking-tight">
                {activeTab === 'profile'
                  ? currentUserProfile?.full_name || 'My Profile'
                  : `${currentUserProfile?.city || 'Chennai'} Feed`}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStoryStudioPlan('blank')}
              className="px-2.5 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-white flex items-center gap-1 hover:border-[#FF5E3A] active:scale-95 transition-all shadow-sm"
              title="Open Story Studio"
            >
              <Camera size={13} className="text-[#FF5E3A]" />
              <span className="text-[11px]">Story</span>
            </button>

            <button
              onClick={() => setShowCityModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#121214] border border-[#2A2A2E] text-xs font-bold text-[#A1A1A6] hover:text-white active:scale-95 transition-all flex items-center gap-1.5 max-w-[140px]"
              title="Switch city or district"
            >
              <MapPin size={12} className="text-[#FF5E3A] shrink-0" />
              <span className="truncate">{currentUserProfile?.city || 'Chennai'}</span>
            </button>
          </div>
        </header>

        {/* TAB 1: DISCOVER FEED */}
        {activeTab === 'discover' && (
          <>
            {/* Category Carousel */}
            <nav aria-label="Categories" className="px-5 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 z-10 sticky top-[85px] bg-[#08080A]">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#F5F5F7] text-[#08080A] shadow-md'
                        : 'bg-[#121214] text-[#A1A1A6] border border-[#2A2A2E] hover:border-[#3E3E42]'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-[#08080A]' : 'text-[#A1A1A6]'} />
                    {cat.label}
                  </button>
                );
              })}
            </nav>

            {/* Plans List */}
            <main className="flex-1 px-5 flex flex-col gap-4 pt-3">
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-24 text-xs text-[#636366]">
                  Loading active outings...
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-sm font-semibold text-[#A1A1A6]">No active outings in this category.</p>
                  <p className="text-xs text-[#636366] mt-1">Tap + below to start one!</p>
                </div>
              ) : (
                filteredPlans.map((plan) => {
                  const spotsLeft = plan.slots_total - plan.slots_claimed;
                  const isHost = plan.host_id === currentUserId;
                  const requestStatus = userRequests[plan.id];
                  const isAccepted = requestStatus === 'accepted';
                  const canAccessSquad = isHost || isAccepted;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`group relative bg-[#121214] border ${
                        plan.is_beacon 
                          ? 'border-[#FF5E3A]/70 shadow-lg shadow-[#FF5E3A]/15 ring-1 ring-[#FF5E3A]/30' 
                          : 'border-[#1C1C1F] hover:border-[#2A2A2E]'
                      } rounded-3xl p-5 flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer overflow-hidden shadow-lg`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
                            plan.is_beacon 
                              ? 'bg-[#FF5E3A] text-white shadow-md shadow-[#FF5E3A]/30 animate-pulse' 
                              : 'bg-[#1C1C1F] text-[#FF5E3A] border border-[#FF5E3A]/20'
                          }`}>
                            {plan.is_beacon ? <Zap size={12} /> : <Clock size={12} />}
                            {plan.is_beacon ? '⚡ Live Beacon' : formatPlanTime(plan.scheduled_time)}
                          </span>

                          {plan.squad_type === 'girls_only' && (
                            <span className="px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-[10px] font-bold text-pink-300 flex items-center gap-1">
                              🌸 Girls-Only
                            </span>
                          )}

                          {plan.squad_type === 'balanced' && (
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                              ⚖️ 50/50
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-0.5 rounded-full border border-[#1DB954]/20">
                          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left` : 'Full'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#F5F5F7] tracking-tight leading-snug group-hover:text-white transition-colors">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-[#A1A1A6]">
                          <MapPin size={13} className="text-[#FF5E3A] shrink-0" />
                          <span className="truncate">{plan.venue} • {plan.area_neighborhood}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#1C1C1F] flex items-center justify-between text-xs text-[#636366]">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (plan.host) setInspectedUser(plan.host);
                          }}
                          className="flex items-center gap-2 cursor-pointer group/host hover:opacity-90 transition-opacity"
                        >
                          <div className="h-6 w-6 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden group-hover/host:border-[#FF5E3A] transition-colors">
                            {plan.host?.avatar_url ? (
                              <img src={plan.host.avatar_url} alt={plan.host.full_name} className="h-full w-full object-cover" />
                            ) : (
                              (plan.host?.full_name || 'Host')[0]
                            )}
                          </div>
                          <span className="text-[#A1A1A6] font-medium flex items-center gap-1 group-hover/host:text-white transition-colors">
                            <span>{isHost ? 'You' : plan.host?.full_name || 'Host'}</span>
                            <span className="text-[10px]">{getReputationTier(plan.host?.outings_attended, plan.host?.outings_flaked).emoji}</span>
                          </span>
                        </div>

                        {/* Squad button or status */}
                        <div className="flex items-center gap-2">
                          {canAccessSquad ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSquadPlan(plan);
                              }}
                              className="px-3 py-1 rounded-full bg-[#FF5E3A]/15 border border-[#FF5E3A]/30 text-[11px] font-bold text-[#FF5E3A] hover:bg-[#FF5E3A]/25 flex items-center gap-1.5 active:scale-95 transition-all"
                            >
                              <MessageSquare size={12} /> Squad
                            </button>
                          ) : requestStatus === 'pending' ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-[10px] font-medium text-[#A1A1A6] flex items-center gap-1">
                              <Lock size={11} className="text-[#636366]" /> Requested
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-[10px] font-medium text-[#636366] flex items-center gap-1">
                              <Lock size={11} /> Locked
                            </span>
                          )}

                          <div className="flex items-center gap-1 font-semibold text-[#F5F5F7] pl-1">
                            <Users size={12} className="text-[#A1A1A6]" />
                            <span>{plan.slots_claimed}/{plan.slots_total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </main>
          </>
        )}

        {/* TAB 2: MY PLANS */}
        {activeTab === 'my_plans' && (
          <main className="flex-1 px-5 pt-3 pb-24 space-y-5">
            {/* Hosting Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5E3A] flex items-center gap-1.5">
                  <Crown size={13} /> Hosting ({hostedPlans.length})
                </span>
              </div>
              {hostedPlans.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1C1C1F] text-center text-xs text-[#636366]">
                  You are not hosting any outings right now. Tap + to start one!
                </div>
              ) : (
                <div className="space-y-3">
                  {hostedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setActiveSquadPlan(plan)}
                      className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] hover:border-[#2A2A2E] flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-[#F5F5F7]">{plan.title}</h4>
                        <span className="text-xs text-[#A1A1A6]">{plan.venue} • {formatPlanTime(plan.scheduled_time)}</span>
                      </div>
                      <button className="px-3 py-1.5 rounded-full bg-[#FF5E3A] text-white text-xs font-bold flex items-center gap-1">
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed Attending */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1DB954] flex items-center gap-1.5">
                  <Users size={13} /> Joined Squads ({acceptedPlans.length})
                </span>
              </div>
              {acceptedPlans.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1C1C1F] text-center text-xs text-[#636366]">
                  No accepted squads yet. Discover plans and pitch yourself!
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setActiveSquadPlan(plan)}
                      className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] hover:border-[#2A2A2E] flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-[#F5F5F7]">{plan.title}</h4>
                        <span className="text-xs text-[#A1A1A6]">{plan.venue} • by {plan.host?.full_name || 'Host'}</span>
                      </div>
                      <button className="px-3 py-1.5 rounded-full bg-[#1DB954] text-black text-xs font-bold flex items-center gap-1">
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Waiting for Approval */}
            {pendingPlans.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] block mb-2">
                  Waiting For Host Approval ({pendingPlans.length})
                </span>
                <div className="space-y-2">
                  {pendingPlans.map((plan) => (
                    <div key={plan.id} className="p-4 rounded-2xl bg-[#08080A] border border-[#2A2A2E] flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-sm text-[#F5F5F7]">{plan.title}</h4>
                        <span className="text-[11px] text-[#A1A1A6]">{plan.venue} • {formatPlanTime(plan.scheduled_time)}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#1C1C1F] text-[#A1A1A6] text-[10px] font-semibold">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post-Outing Feedback Prompt */}
            <div className="p-4 rounded-3xl bg-[#121214] border border-[#FF5E3A]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#FF5E3A]/20 flex items-center justify-center text-[#FF5E3A]">
                  <Star size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#F5F5F7]">Finished an Outing?</h4>
                  <span className="text-[11px] text-[#A1A1A6]">Rate squad members anonymously</span>
                </div>
              </div>
              <button
                onClick={() => setRatingTarget({
                  planTitle: '6v6 Turf Football Game',
                  memberId: '11111111-1111-1111-1111-111111111111',
                  memberName: 'Siddharth R'
                })}
                className="px-3 py-1.5 rounded-xl bg-[#FF5E3A] text-white text-xs font-bold active:scale-95 transition-transform"
              >
                Rate Squad
              </button>
            </div>
          </main>
        )}

        {/* TAB 3: ACTIVE SQUADS */}
        {activeTab === 'squads' && (
          <main className="flex-1 px-5 pt-3 pb-24 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A6] block mb-1">
              Active Ephemeral Channels ({unlockedSquads.length})
            </span>
            {unlockedSquads.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#121214] border border-[#1C1C1F] text-center text-xs text-[#636366]">
                You don't have any active squad rooms yet. Request to join an outing or start your own!
              </div>
            ) : (
              unlockedSquads.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setActiveSquadPlan(plan)}
                  className="p-4 rounded-2xl bg-[#121214] border border-[#1C1C1F] hover:border-[#2A2A2E] flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#FF5E3A]/15 border border-[#FF5E3A]/30 flex items-center justify-center text-[#FF5E3A]">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#F5F5F7]">{plan.title}</h4>
                      <span className="text-xs text-[#A1A1A6] flex items-center gap-1">
                        <MapPin size={11} className="text-[#FF5E3A]" /> {plan.venue}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#636366]" />
                </div>
              ))
            )}
          </main>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            profile={currentUserProfile}
            currentUserId={currentUserId}
            onSwitchUser={handleSwitchUser}
            onCityChange={(c, s) => handleLocationSelect(c, s || 'Tamil Nadu')}
            onOpenSafetyModal={() => setShowSafetyModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onOpenCityModal={() => setShowCityModal(true)}
            onProfileUpdated={(updated) => {
              setCurrentUserProfile(updated);
              fetchPlansAndPermissions();
            }}
          />
        )}

        {/* Floating Bottom Dock */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCreateModal={() => {
            if (checkSuspensionAlert()) return;
            setShowCreateModal(true);
          }}
          onOpenSafetyModal={() => setShowSafetyModal(true)}
          hasActiveSafetyTimer={hasActiveSafetyTimer}
        />

        {/* MODALS */}
        {selectedPlan && (
          <PlanDetailModal
            plan={selectedPlan}
            currentUserId={currentUserId}
            userRequestStatus={userRequests[selectedPlan.id]}
            onClose={() => setSelectedPlan(null)}
            onOpenSquad={(plan) => {
              setSelectedPlan(null);
              setActiveSquadPlan(plan);
            }}
            onRequestSubmitted={fetchPlansAndPermissions}
            isSuspended={isUserSuspended()}
            onOpenUserProfile={(user) => setInspectedUser(user)}
          />
        )}

        {showCreateModal && (
          <CreatePlanModal
            currentUserId={currentUserId}
            defaultCity={currentUserProfile?.city || 'Chennai'}
            defaultState={currentUserProfile?.state || 'Tamil Nadu'}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchPlansAndPermissions}
          />
        )}

        {showCityModal && (
          <CitySelectorModal
            currentCity={currentUserProfile?.city || 'Chennai'}
            currentState={currentUserProfile?.state || 'Tamil Nadu'}
            onSelect={handleLocationSelect}
            onClose={() => setShowCityModal(false)}
          />
        )}

        {activeSquadPlan && (
          <SquadRoomModal
            plan={activeSquadPlan}
            currentUserId={currentUserId}
            onClose={() => setActiveSquadPlan(null)}
            onPlanUpdated={fetchPlansAndPermissions}
            onOpenUserProfile={(user) => setInspectedUser(user)}
            onOpenStoryStudio={(plan) => setStoryStudioPlan(plan)}
          />
        )}

        {showSafetyModal && (
          <SafetyModal
            userProfile={currentUserProfile}
            onClose={() => {
              setShowSafetyModal(false);
              setHasActiveSafetyTimer(Boolean(localStorage.getItem('outly_deadman_deadline')));
            }}
            onProfileUpdate={fetchPlansAndPermissions}
          />
        )}

        {ratingTarget && (
          <RatingModal
            planTitle={ratingTarget.planTitle}
            memberId={ratingTarget.memberId}
            memberName={ratingTarget.memberName}
            onClose={() => setRatingTarget(null)}
            onSubmit={async (att, vibe) => {
              console.log('Rated member:', ratingTarget.memberName, { att, vibe });
              await api.rateMember(ratingTarget.memberId, att, vibe);
              fetchPlansAndPermissions();
            }}
          />
        )}

        {/* 1-Tap Google Sign-In Modal */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={(profile) => {
              setCurrentUserId(profile.id);
              localStorage.setItem('outly_current_user_id', profile.id);
              setShowAuthModal(false);
              fetchPlansAndPermissions();
            }}
          />
        )}

        {/* First-Time Onboarding Flow */}
        {currentUserProfile && currentUserProfile.onboarded === false && (
          <OnboardingFlow
            user={currentUserProfile}
            onFinished={(updated) => {
              setCurrentUserProfile(updated);
              fetchPlansAndPermissions();
            }}
          />
        )}

        {/* Public User Profile Modal */}
        {inspectedUser && (
          <PublicProfileModal
            user={inspectedUser}
            onClose={() => setInspectedUser(null)}
          />
        )}

        {/* Outly Story Studio Modal (Instagram / WhatsApp Export) */}
        {storyStudioPlan !== null && (
          <StoryStudioModal
            plan={storyStudioPlan === 'blank' ? null : storyStudioPlan}
            onClose={() => setStoryStudioPlan(null)}
          />
        )}

      </div>
    </div>
  );
}
