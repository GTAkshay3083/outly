import { useState } from 'react';
import { X, Film, Coffee, Trophy, Music, Gamepad2, Compass, Palette, Calendar, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { TAMIL_NADU_DISTRICTS } from '../utils/locations';

interface Props {
  currentUserId: string;
  defaultCity?: string;
  defaultState?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 'screen_stage', label: 'Screen & Stage', icon: Film },
  { id: 'food_cafes', label: 'Food & Cafes', icon: Coffee },
  { id: 'sports_turf', label: 'Sports & Turf', icon: Trophy },
  { id: 'gigs_nightlife', label: 'Gigs & Night', icon: Music },
  { id: 'arcades_gaming', label: 'Arcades', icon: Gamepad2 },
  { id: 'outdoors_trips', label: 'Outdoors', icon: Compass },
  { id: 'expos_culture', label: 'Culture & Expos', icon: Palette },
];

export default function CreatePlanModal({
  currentUserId,
  defaultCity = 'Chennai',
  defaultState = 'Tamil Nadu',
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('screen_stage');
  const [venue, setVenue] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState(defaultCity === 'All Tamil Nadu' ? 'Chennai' : defaultCity);
  const [state, setState] = useState(defaultState);
  const [slots, setSlots] = useState(3);
  const [splitVibe, setSplitVibe] = useState('Split equally');
  const [hoursAhead, setHoursAhead] = useState(3);
  const [isBeacon, setIsBeacon] = useState(false);
  const [squadType, setSquadType] = useState<'all' | 'girls_only' | 'balanced'>('all');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !area.trim()) {
      alert('Please fill out the plan title, venue, and area.');
      return;
    }

    setSubmitting(true);
    const scheduledTime = new Date(Date.now() + (isBeacon ? 0.5 : hoursAhead) * 3600 * 1000).toISOString();
    const expiresAt = isBeacon ? new Date(Date.now() + 2 * 3600 * 1000).toISOString() : undefined;

    try {
      await api.createPlan({
        host_id: currentUserId,
        title: title.trim(),
        category,
        venue: venue.trim(),
        area_neighborhood: area.trim(),
        city,
        state,
        scheduled_time: scheduledTime,
        slots_total: Number(slots),
        split_vibe: splitVibe,
        is_beacon: isBeacon,
        expires_at: expiresAt,
        squad_type: squadType,
      });
      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      alert('Failed to publish outing: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] tracking-widest font-extrabold text-[#FF5E3A] uppercase">Anchor a Meetup</span>
            <h2 className="text-xl font-bold text-[#F5F5F7]">Start an Outing</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[#A1A1A6] font-semibold block mb-1">What's the plan?</label>
            <input
              type="text"
              placeholder="e.g. Dune Part Two IMAX, Turf Football, Late-night Biryani"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-xl p-3 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
            />
          </div>

          <div>
            <label className="text-[#A1A1A6] font-semibold block mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#1C1C1F] border-[#FF5E3A] text-white shadow-sm'
                        : 'bg-[#08080A] border-[#2A2A2E] text-[#A1A1A6]'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-[#FF5E3A]' : 'text-[#636366]'} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#A1A1A6] font-semibold block mb-1 flex items-center gap-1">
                <MapPin size={11} className="text-[#FF5E3A]" /> District / City
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setState('Tamil Nadu');
                }}
                className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-xl p-3 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.isMajor ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[#A1A1A6] font-semibold block mb-1">Area / Neighborhood</label>
              <input
                type="text"
                placeholder="e.g. Vadapalani / RS Puram"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-xl p-3 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#A1A1A6] font-semibold block mb-1">Venue Name</label>
            <input
              type="text"
              placeholder="e.g. Palazzo Cinemas, Decathlon Turf, Chai Galli"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-xl p-3 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#A1A1A6] font-semibold block mb-1">Total Spots</label>
              <input
                type="number"
                min="2"
                max="12"
                value={slots}
                onChange={(e) => setSlots(Number(e.target.value))}
                className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-xl p-3 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
              />
            </div>
            <div>
              <label className="text-[#A1A1A6] font-semibold block mb-1">Bill Vibe</label>
              <select
                value={splitVibe}
                onChange={(e) => setSplitVibe(e.target.value)}
                className="w-full bg-[#08080A] border border-[#2A2A2E] rounded-xl p-3 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#FF5E3A]"
              >
                <option value="Split equally">Split equally</option>
                <option value="Self pay">Self pay</option>
                <option value="Host treats">Host treats</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#A1A1A6] font-semibold block mb-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-[#FF5E3A]" /> When is it happening?
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'In 2 hrs', hours: 2 },
                { label: 'In 4 hrs', hours: 4 },
                { label: 'Tonight', hours: 6 },
                { label: 'Tomorrow', hours: 24 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setHoursAhead(preset.hours)}
                  className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                    hoursAhead === preset.hours
                      ? 'bg-[#FF5E3A] text-white border-[#FF5E3A]'
                      : 'bg-[#08080A] text-[#A1A1A6] border-[#2A2A2E]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spontaneous 2-Hour Beacon Toggle (Feature 2) */}
          <div 
            onClick={() => {
              setIsBeacon(!isBeacon);
              if (!isBeacon) {
                setHoursAhead(1.5);
                setSlots(3);
              }
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              isBeacon 
                ? 'bg-[#FF5E3A]/15 border-[#FF5E3A] text-white shadow-lg shadow-[#FF5E3A]/15' 
                : 'bg-[#08080A] border-[#2A2A2E] text-[#A1A1A6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                isBeacon ? 'bg-[#FF5E3A] text-white' : 'bg-[#1C1C1F] text-[#636366]'
              }`}>
                <Zap size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  ⚡ 2-Hour Spontaneous Beacon
                </span>
                <span className="text-[10px] text-[#A1A1A6]">
                  "Who's down right now?" Live city radar with countdown
                </span>
              </div>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${
              isBeacon ? 'bg-[#FF5E3A]' : 'bg-[#2A2A2E]'
            }`}>
              <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                isBeacon ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Squad Atmosphere & Safety Selector (Feature 4) */}
          <div>
            <label className="text-[#A1A1A6] font-semibold block mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#1DB954]" /> Squad Atmosphere & Safety
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'all', label: '👥 Open Squad', desc: 'All welcomed' },
                { id: 'girls_only', label: '🌸 Girls-Only', desc: 'Verified women' },
                { id: 'balanced', label: '⚖️ 50/50 Balanced', desc: 'Equal co-ed' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSquadType(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    squadType === opt.id
                      ? opt.id === 'girls_only'
                        ? 'bg-pink-500/15 border-pink-500 text-pink-300'
                        : 'bg-[#FF5E3A]/15 border-[#FF5E3A] text-white'
                      : 'bg-[#08080A] border-[#2A2A2E] text-[#A1A1A6]'
                  }`}
                >
                  <span className="font-bold text-[11px] block">{opt.label}</span>
                  <span className="text-[9px] text-[#636366] block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-4 rounded-2xl bg-[#FF5E3A] text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[#FF5E3A]/20 disabled:opacity-50"
          >
            {submitting ? 'Publishing Outing...' : isBeacon ? '⚡ Drop Live Beacon Pin' : 'Publish Outing'}
          </button>
        </div>
      </form>
    </div>
  );
}
