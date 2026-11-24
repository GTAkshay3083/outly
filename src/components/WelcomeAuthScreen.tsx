import { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, ShieldCheck, Zap, Users, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { UserProfile } from '../types';

interface Props {
  onAuthenticated: (profile: UserProfile) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function WelcomeAuthScreen({ onAuthenticated }: Props) {
  const [authMode, setAuthMode] = useState<'welcome' | 'email'>('welcome');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('outly_google_client_id') || '';

  // Handle Google OAuth response if configured
  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      setErrorMsg('Could not verify Google account details.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const profile = await api.googleAuth(
        payload.email,
        payload.name || payload.given_name || 'Outly Member',
        payload.picture
      );
      localStorage.setItem('outly_current_user_id', profile.id);
      localStorage.setItem('outly_user_email', profile.email || payload.email);
      onAuthenticated(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth failed. Try email sign-in.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId.trim(),
            callback: handleCredentialResponse,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_black',
              size: 'large',
              width: 320,
              shape: 'pill',
              text: 'continue_with',
            });
          }
        } catch (e) {
          console.warn('GIS error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [clientId]);

  // Handle Email / Gmail Sign-In (Works for both new and recurring users)
  const handleEmailSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Default name from email if not given
      const name = fullName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`;

      const profile = await api.googleAuth(cleanEmail, name, avatarUrl);
      localStorage.setItem('outly_current_user_id', profile.id);
      localStorage.setItem('outly_user_email', cleanEmail);
      onAuthenticated(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F7] flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#FF5E3A]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Brand Hero */}
      <div className="pt-12 flex flex-col items-center text-center z-10">
        <div className="w-16 h-16 rounded-2xl bg-[#121214] border border-white/10 p-2 shadow-xl shadow-[#FF5E3A]/10 flex items-center justify-center mb-4">
          <img src="/outly-logo.png" alt="Outly" className="w-12 h-12 object-contain" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white lowercase">outly</h1>
        <p className="text-xs font-semibold text-[#FF5E3A] tracking-wider uppercase mt-1">
          Real Plans • Zero Flakes
        </p>

        <p className="text-xs text-[#A1A1A6] max-w-[280px] mt-2.5 leading-relaxed">
          The plan-first social network. Step out with verified local squads who actually show up.
        </p>
      </div>

      {/* Feature Highlights */}
      {authMode === 'welcome' && (
        <div className="my-6 space-y-2.5 z-10">
          <div className="p-3.5 rounded-2xl bg-[#121214]/80 border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5E3A]/10 flex items-center justify-center text-[#FF5E3A] shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Spontaneous Beacons</span>
              <span className="text-[11px] text-[#8E8E93]">Broadcast 2-hr meetups for chai, turf, or movies</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121214]/80 border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">100% Pull-Up Score</span>
              <span className="text-[11px] text-[#8E8E93]">Geofenced check-ins keep flakers away</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121214]/80 border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <Users size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Squad Rooms & Stories</span>
              <span className="text-[11px] text-[#8E8E93]">Secret chat rooms & 9:16 story stickers</span>
            </div>
          </div>
        </div>
      )}

      {/* Auth Actions Section */}
      <div className="pb-8 space-y-3.5 z-10">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {authMode === 'welcome' ? (
          <>
            {/* Google One-Tap Container (if configured) */}
            {clientId && (
              <div className="flex justify-center mb-1">
                <div ref={googleBtnRef} />
              </div>
            )}

            {/* Native Continue with Google button */}
            <button
              onClick={() => {
                // If GIS is ready, trigger it; else open email mode prefilled with @gmail.com
                if (window.google?.accounts?.id && clientId) {
                  window.google.accounts.id.prompt();
                } else {
                  setAuthMode('email');
                }
              }}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#F5F5F7] hover:bg-white text-[#08080A] font-bold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Continue with Email */}
            <button
              onClick={() => setAuthMode('email')}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#121214] hover:bg-[#1C1C1F] border border-white/[0.08] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Mail size={15} className="text-[#FF5E3A]" />
              <span>Continue with Email or Gmail</span>
            </button>
          </>
        ) : (
          /* Email / Gmail Form */
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1A6] mb-1 block">
                  Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636366]" />
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121214] border border-white/[0.1] focus:border-[#FF5E3A] rounded-xl pl-9 pr-3.5 py-3 text-xs text-white placeholder-[#636366] focus:outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1A6] mb-1 block">
                  Full Name <span className="text-[#636366] font-normal">(for new members)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Akshay Rathinam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.1] focus:border-[#FF5E3A] rounded-xl px-3.5 py-3 text-xs text-white placeholder-[#636366] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#FF451A] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-[#FF5E3A]/20"
            >
              <span>{loading ? 'Signing in...' : 'Sign In / Register'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('welcome');
                setErrorMsg(null);
              }}
              className="w-full py-2 text-center text-xs text-[#8E8E93] hover:text-white transition-colors"
            >
              ← Back to options
            </button>
          </form>
        )}

        <p className="text-[10px] text-center text-[#636366] leading-relaxed pt-1">
          By signing in, you agree to show up to outings you claim or receive flake strikes.
        </p>
      </div>
    </div>
  );
}
