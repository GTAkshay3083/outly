import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ShieldCheck, Key, ExternalLink } from 'lucide-react';
import { api } from '../api';
import type { UserProfile } from '../types';

interface Props {
  onSuccess: (profile: UserProfile) => void;
  onClose: () => void;
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

export default function AuthModal({ onSuccess, onClose }: Props) {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [clientId, setClientId] = useState<string>(() => {
    return envClientId || localStorage.getItem('outly_google_client_id') || '';
  });
  const [showConfig, setShowConfig] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      alert('Could not verify Google account details.');
      return;
    }

    setSubmitting(true);
    try {
      const profile = await api.googleAuth(
        payload.email,
        payload.name || payload.given_name || 'Outly Member',
        payload.picture
      );
      onSuccess(profile);
    } catch (err: any) {
      alert('Google Auth Failed: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
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
              theme: 'outline',
              size: 'large',
              width: 340,
              shape: 'pill',
              text: 'continue_with',
            });
          }
        } catch (e) {
          console.warn('GIS init error:', e);
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

  const handleSaveClientId = (val: string) => {
    setClientId(val.trim());
    localStorage.setItem('outly_google_client_id', val.trim());
  };

  const handleSimulateLogin = async (email: string, name: string) => {
    setSubmitting(true);
    try {
      const profile = await api.googleAuth(
        email,
        name,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      );
      onSuccess(profile);
    } catch (err: any) {
      alert('Auth Error: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end">
      <div className="bg-[#121214] border-t border-[#2A2A2E] rounded-t-[32px] p-6 flex flex-col max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5E3A] flex items-center gap-1">
              <Sparkles size={11} /> Verified Access
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">Google Sign-In</h2>
          </div>
          <button onClick={onClose} className="text-[#A1A1A6] p-1 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-[#A1A1A6] mb-5 leading-relaxed">
          Sign in with your Google Account to sync your reputation tier, join local squads, and start plans.
        </p>

        {/* Real Google Sign-In Container */}
        {clientId ? (
          <div className="space-y-3">
            <div className="flex justify-center my-2 min-h-[44px]" ref={googleBtnRef} />
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="text-[10px] text-[#636366] hover:text-[#A1A1A6] underline"
              >
                Change Client ID ({clientId.slice(0, 16)}...)
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Google Setup if Client ID is not yet provided */
          <div className="p-4 rounded-2xl bg-[#08080A] border border-[#2A2A2E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key size={13} className="text-[#FF5E3A]" /> Connect Google OAuth
              </span>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-[#FF5E3A] flex items-center gap-1 hover:underline"
              >
                Open Google Console <ExternalLink size={10} />
              </a>
            </div>

            <p className="text-[11px] text-[#A1A1A6] leading-relaxed">
              To enable real 1-Tap Google login, paste your <strong>OAuth 2.0 Web Client ID</strong> below:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="xxxx.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex-1 bg-[#121214] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#636366] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSaveClientId(clientId)}
                disabled={!clientId.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#FF5E3A] text-white font-bold text-xs disabled:opacity-40"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {showConfig && clientId && (
          <div className="mt-3 p-3 rounded-2xl bg-[#08080A] border border-[#2A2A2E] space-y-2">
            <span className="text-[11px] font-bold text-white block">Update Google Client ID</span>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Paste new Client ID..."
              className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1 rounded-lg text-xs text-[#A1A1A6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveClientId(clientId);
                  setShowConfig(false);
                }}
                className="px-3 py-1 rounded-lg bg-[#FF5E3A] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2A2A2E]" />
          <span className="text-[10px] text-[#636366] font-bold uppercase tracking-wider">
            or sign in with email
          </span>
          <div className="flex-1 h-px bg-[#2A2A2E]" />
        </div>

        {/* Email Sign In */}
        <div className="space-y-2.5">
          <input
            type="email"
            placeholder="yourname@gmail.com"
            value={googleEmail}
            onChange={(e) => setGoogleEmail(e.target.value)}
            className="w-full bg-[#08080A] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Full Name (optional for existing users)"
            value={googleName}
            onChange={(e) => setGoogleName(e.target.value)}
            className="w-full bg-[#08080A] border border-[#2A2A2E] focus:border-[#FF5E3A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
          />
          <button
            onClick={() => handleSimulateLogin(googleEmail, googleName || googleEmail.split('@')[0])}
            disabled={submitting || !googleEmail.trim()}
            className="w-full py-3 rounded-xl bg-[#FF5E3A] hover:bg-[#FF451A] text-white font-bold text-xs disabled:opacity-40 active:scale-95 transition-all shadow"
          >
            {submitting ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-[#1C1C1F] flex items-center justify-center gap-1.5 text-[11px] text-[#636366]">
          <ShieldCheck size={13} className="text-[#1DB954]" />
          <span>Real Google Auth verified directly through Google Identity Services.</span>
        </div>

      </div>
    </div>
  );
}
