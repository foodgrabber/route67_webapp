'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Status = 'idle' | 'github' | 'magic' | 'sent' | 'error';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const busy = status === 'github' || status === 'magic';

  async function handleGitHub() {
    setStatus('github');
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
    // On success the browser is redirected, so no further state needed.
  }

  async function handleMagicLink() {
    if (!emailValid) return;
    setStatus('magic');
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  }

  return (
    <main className="min-h-screen bg-[#F7F9F5] font-body flex items-center justify-center px-6 py-12 text-[#0A3A1F]">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 p-8 flex flex-col items-center gap-6">
        {/* 67 Shield */}
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-[#00B14F] shadow-lg shadow-[#00B14F]/30 flex items-center justify-center">
            <span className="font-display text-white text-4xl leading-none tracking-tight">
              67
            </span>
          </div>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF3D8A] ring-2 ring-white" />
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl tracking-tight">FoodGrabber</h1>
          <p className="mt-1 text-sm text-[#0A3A1F]/70">
            67 spots near you. Go grab them.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="w-full rounded-2xl bg-[#F7F9F5] ring-1 ring-black/5 p-5 text-center">
            <div className="text-3xl">✉️</div>
            <div className="mt-2 font-display text-lg">Check your inbox</div>
            <div className="mt-1 text-sm text-[#0A3A1F]/70">
              We sent a magic link to{' '}
              <span className="font-semibold">{email}</span>.
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setErrorMsg(null);
              }}
              className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#0A3A1F]/60 hover:text-[#0A3A1F]"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            {/* GitHub */}
            <button
              type="button"
              onClick={handleGitHub}
              disabled={busy}
              className="h-12 rounded-2xl bg-[#0A3A1F] text-white font-semibold shadow-lg shadow-black/20 hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54 0-.27-.01-.97-.02-1.9-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.17 1.73 1.17 1.01 1.73 2.64 1.23 3.28.94.1-.73.39-1.23.71-1.51-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.11 1.15.9-.25 1.87-.37 2.83-.38.96 0 1.93.13 2.83.38 2.16-1.46 3.11-1.15 3.11-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.78.54 4.47-1.49 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5z"/>
              </svg>
              {status === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#0A3A1F]/40">
              <span className="flex-1 h-px bg-black/10" />
              or
              <span className="flex-1 h-px bg-black/10" />
            </div>

            {/* Magic link */}
            <label className="text-xs font-semibold uppercase tracking-wider text-[#0A3A1F]/60">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMagicLink();
              }}
              className="h-12 rounded-2xl bg-[#F7F9F5] px-4 ring-1 ring-black/10 focus:ring-2 focus:ring-[#00B14F] outline-none font-body text-sm"
            />
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={!emailValid || busy}
              className="h-12 rounded-2xl bg-[#0A3A1F] text-white font-semibold hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {status === 'magic' ? 'Sending…' : 'Send magic link'}
            </button>

            {errorMsg && (
              <div className="rounded-xl bg-[#FF3D8A]/10 ring-1 ring-[#FF3D8A]/30 px-3 py-2 text-xs text-[#FF3D8A] font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-[#0A3A1F]/50 text-center leading-relaxed">
          By continuing you agree to play nice.
        </p>
      </div>
    </main>
  );
}
