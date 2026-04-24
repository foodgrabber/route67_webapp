'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield67 } from '@/components/ui/Shield67';

type Status = 'idle' | 'github' | 'magic' | 'sent' | 'error';
type Stage = 'hero' | 'auth' | 'email';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('hero');

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
    <main className="relative min-h-screen overflow-hidden bg-login-bg text-white font-body flex flex-col">
      {/* tiled 67 background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07]">
        {Array.from({ length: 40 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const left = `${col * 22 + (row % 2) * 11 - 10}%`;
          const top = `${row * 14 - 5}%`;
          const rot = `${((i * 37) % 40) - 20}deg`;
          return (
            <div
              key={i}
              className="absolute font-display text-[80px] leading-none text-white tracking-tight select-none"
              style={{ left, top, transform: `rotate(${rot})` }}
            >
              67
            </div>
          );
        })}
      </div>

      {/* Grab-green glow */}
      <div aria-hidden className="pointer-events-none absolute -left-[20%] -top-[20%] h-[80%] w-[140%] r67-wordmark-bg" />

      {/* HERO */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-7 pt-20 pb-4 overflow-y-auto">
        <Shield67 size={112} />

        <div className="relative mt-3">
          <div className="font-display text-[128px] leading-[0.9] tracking-tight text-primary drop-shadow-[0_8px_40px_rgba(0,177,79,0.6)] r67-logo-pulse">
            67
          </div>
          <div className="absolute top-10 -right-10 rotate-[8deg] rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-accent/40">
            Certified Sigma
          </div>
        </div>

        <div className="mt-2 font-display text-3xl leading-none tracking-tight text-center">
          FoodGrabber
        </div>

        <p className="mt-5 max-w-[280px] text-center text-sm leading-relaxed text-mint">
          hunt every <b className="text-white">67</b> spot in the city.<br />
          climb the board. <i>touch grass responsibly.</i>
        </p>

        {/* stats strip */}
        <div className="mt-5 flex gap-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          {[
            { n: '2,847', l: 'hunters' },
            { n: '14k+', l: "67s found" },
            { n: '67', l: 'districts' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-xl leading-none tracking-tight text-white">
                {s.n}
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-mint">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA STACK */}
      <div className="relative z-10 px-7 pb-8 pt-3">
        {stage === 'hero' && status !== 'sent' && (
          <div className="flex flex-col gap-2 r67-slide-up">
            <button
              type="button"
              onClick={() => setStage('auth')}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-accent/40 hover:brightness-110 active:brightness-95 transition"
            >
              Enter the 67verse <span className="text-lg">→</span>
            </button>
            <div className="text-center text-[10px] leading-relaxed text-white/50">
              by vibing you agree to the <u>chill ToS</u> · <u>no-drip policy</u>
            </div>
          </div>
        )}

        {stage === 'auth' && status !== 'sent' && (
          <div className="flex flex-col gap-2.5 r67-slide-up">
            <div className="text-center text-[11px] font-bold uppercase tracking-widest text-white/75">
              sign in to start hunting
            </div>

            <button
              type="button"
              onClick={handleGitHub}
              disabled={busy}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-text font-bold text-sm shadow-lg shadow-black/20 hover:brightness-95 active:brightness-90 disabled:opacity-60 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54 0-.27-.01-.97-.02-1.9-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.17 1.73 1.17 1.01 1.73 2.64 1.23 3.28.94.1-.73.39-1.23.71-1.51-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.11 1.15.9-.25 1.87-.37 2.83-.38.96 0 1.93.13 2.83.38 2.16-1.46 3.11-1.15 3.11-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.78.54 4.47-1.49 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5z" />
              </svg>
              {status === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
            </button>

            <button
              type="button"
              onClick={() => setStage('email')}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/25 bg-white/10 text-white font-bold text-sm hover:bg-white/15 transition"
            >
              <span className="text-base">✉️</span> Send me a magic link
            </button>

            <button
              type="button"
              onClick={() => {
                setStage('hero');
                setErrorMsg(null);
              }}
              className="mt-1 py-1.5 text-center text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-white/70"
            >
              ← back
            </button>

            {errorMsg && (
              <div className="rounded-xl bg-accent/10 ring-1 ring-accent/30 px-3 py-2 text-xs text-accent font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {stage === 'email' && status !== 'sent' && (
          <div className="r67-slide-up rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="text-sm font-bold text-white">Magic link time</div>
            <div className="mb-3 mt-0.5 text-[11px] text-white/70">
              Drop your email — we&apos;ll send a 67-second login link.
            </div>
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMagicLink();
              }}
              placeholder="you@skibidi.co"
              className="h-12 w-full rounded-xl border border-white/15 bg-black/30 px-4 text-sm font-semibold text-white placeholder:text-white/40 outline-none focus:border-primary"
              autoComplete="email"
              inputMode="email"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setStage('auth')}
                className="h-11 flex-1 rounded-xl border border-white/15 bg-transparent text-mint font-bold text-xs uppercase tracking-widest hover:bg-white/5"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={!emailValid || busy}
                className="h-11 flex-[2] rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition"
              >
                {status === 'magic' ? 'Sending…' : 'Send link →'}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-xl bg-accent/15 ring-1 ring-accent/30 px-3 py-2 text-xs text-accent font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {status === 'sent' && (
          <div className="r67-slide-up rounded-2xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur">
            <div className="text-4xl">✉️</div>
            <div className="mt-2 font-display text-xl leading-none tracking-tight text-white">
              Link sent
            </div>
            <div className="mt-2 text-[11px] text-white/70">
              Check your inbox at <span className="font-semibold text-white">{email}</span>.
              <br />
              Also check spam, skibidi.
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setErrorMsg(null);
                setStage('email');
              }}
              className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
