import { useState, useRef } from 'react';
import { X, Camera, Upload, Trash2, Check, Sparkles, User } from 'lucide-react';
import { api } from '../api';
import type { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onClose: () => void;
  onSaved: (updatedUser: UserProfile) => void;
}

const PRESET_AVATARS = [
  { id: 'legend', label: '👑 Legend', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Legend' },
  { id: 'spark', label: '⚡ Pulse', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spark' },
  { id: 'shadow', label: '🦊 Shadow', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow' },
  { id: 'destiny', label: '🍿 Cinephile', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny' },
  { id: 'aiden', label: '🎧 Neon DJ', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aiden' },
  { id: 'felix', label: '☕ Chai Vibe', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 'zoe', label: '🚀 Explorer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe' },
  { id: 'striker', label: '⚽ Striker', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Striker' },
];

const BIO_SUGGESTIONS = [
  'Always ready for 70mm IMAX and chai ☕',
  'Morning 6 AM turf football striker ⚽',
  'Hunting down midnight biryani across TN 🍗',
  'Board games, arcades & late-night drives 🎮',
  'Weekend treks, filter coffee & acoustic gigs 🎸',
];

export default function EditProfileModal({ user, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter your name.');
      return;
    }

    setSaving(true);
    try {
      const cleanUsername = username.trim().replace(/^@+/, '').toLowerCase();
      const updated = await api.updateProfile(user.id, {
        full_name: fullName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        avatar_url: avatarUrl,
      });

      onSaved(updated);
      onClose();
    } catch (err: any) {
      alert('Error updating profile: ' + (err.message || 'Unknown error'));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end">
      <form
        onSubmit={handleSave}
        className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5E3A] flex items-center gap-1">
              <User size={12} /> Identity & Persona
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">Edit Profile</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#A1A1A6] p-1.5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-[#1C1C1F] border-2 border-[#FF5E3A]/40 overflow-hidden flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#FF5E3A]/10">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                (fullName || 'U')[0]
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 h-9 w-9 rounded-2xl bg-[#FF5E3A] text-white flex items-center justify-center border-2 border-[#121214] active:scale-95 shadow-lg"
              title="Upload photo"
            >
              <Camera size={16} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-xs font-bold text-white hover:border-[#FF5E3A] flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Upload size={12} className="text-[#FF5E3A]" />
              <span>Upload Custom Photo</span>
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="p-1.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2E] text-[#A1A1A6] hover:text-red-400 active:scale-95"
                title="Remove photo"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Preset Signatures Carousel */}
          <div className="w-full mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#636366] block mb-2 text-center">
              Or pick an instant signature avatar
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {PRESET_AVATARS.map((av) => {
                const isSelected = avatarUrl === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`h-11 w-11 rounded-2xl p-1 shrink-0 border transition-all active:scale-95 ${
                      isSelected
                        ? 'border-[#FF5E3A] bg-[#FF5E3A]/20 scale-105'
                        : 'border-[#2A2A2E] bg-[#08080A] hover:border-[#3E3E42]'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="h-full w-full object-contain" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#A1A1A6] block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Akshay Kumar"
              required
              className="w-full bg-[#08080A] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#A1A1A6] block mb-1">
              Username Handle
            </label>
            <div className="flex items-center bg-[#08080A] border border-[#2A2A2E] focus-within:border-[#FF5E3A] rounded-2xl px-4 py-3">
              <span className="text-sm font-bold text-[#FF5E3A] mr-1">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="akshay"
                required
                className="bg-transparent text-sm text-white font-bold w-full focus:outline-none"
              />
            </div>
          </div>

          {/* BIO SECTION */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#A1A1A6] flex items-center gap-1">
                <Sparkles size={12} className="text-[#1DB954]" /> 1-Line Vibe / Bio
              </label>
              <span className="text-[10px] text-[#636366]">
                {bio.length}/150
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Always ready for 70mm IMAX and chai."
              className="w-full bg-[#08080A] border border-[#2A2A2E] focus:border-[#1DB954] rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none resize-none"
            />

            {/* Quick Bio Suggestion Chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-semibold text-[#636366] block">
                Quick vibes (tap to autofill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BIO_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setBio(suggestion)}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-[#08080A] border border-[#2A2A2E] text-[#A1A1A6] hover:text-white hover:border-[#1DB954] active:scale-95 transition-all text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-6 py-4 rounded-2xl bg-[#FF5E3A] text-white font-extrabold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#FF5E3A]/20 disabled:opacity-50"
        >
          {saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <Check size={16} strokeWidth={3} />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
