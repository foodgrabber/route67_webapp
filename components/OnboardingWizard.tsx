'use client';

// First-time onboarding wizard.
// 5 steps: welcome → how it works → handle & avatar → location → finish.
// Ported copy from design/project/app/tour.jsx + design/project/app/login.jsx.
// Rendered by app/onboarding/page.tsx (not under the (app) route group, so the
// BottomNav is not shown).

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Shield67 } from '@/components/ui/Shield67';
import {
  checkUsernameAvailable,
  completeOnboarding,
} from '@/lib/onboarding';

type Step = 0 | 1 | 2 | 3 | 4;

// 12 emoji options — copy matches the design spec.
const EMOJI_OPTIONS = [
  '🏎️', '👑', '🦁', '🌺', '🦎', '🐉',
  '🍜', '🧔', '🎟️', '🌶️', '🍵', '🦄',
];

// 3-20 chars, alphanumeric + underscore. Mirrors lib/onboarding.ts.
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

type Props = {
  initialUsername: string;
  initialEmoji: string;
};

export function OnboardingWizard({ initialUsername, initialEmoji }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [username, setUsername] = useState(initialUsername);
  const [emoji, setEmoji] = useState(() =>
    EMOJI_OPTIONS.includes(initialEmoji) ? initialEmoji : EMOJI_OPTIONS[0],
  );
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalSteps = 5;
  const usernameValid = USERNAME_RE.test(username);

  const progressDots = useMemo(
    () => Array.from({ length: totalSteps }, (_, i) => i <= step),
    [step],
  );

  function goTo(next: Step) {
    setSubmitError(null);
    setStep(next);
  }

  function back() {
    if (step === 0) return;
    goTo((step - 1) as Step);
  }

  async function handleProfileNext() {
    setUsernameError(null);
    if (!usernameValid) {
      setUsernameError('3-20 chars · letters, numbers, underscores');
      return;
    }
    setCheckingUsername(true);
    try {
      const result = await checkUsernameAvailable(username);
      if (!result.available) {
        setUsernameError(result.reason);
        return;
      }
      goTo(3);
    } finally {
      setCheckingUsername(false);
    }
  }

  function requestLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationGranted(false);
      return;
    }
    setLocationBusy(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationGranted(true);
        setLocationBusy(false);
      },
      () => {
        setLocationGranted(false);
        setLocationBusy(false);
      },
      { timeout: 8000 },
    );
  }

  function finish() {
    setSubmitError(null);
    startTransition(async () => {
      const result = await completeOnboarding(username, emoji);
      if ('error' in result) {
        setSubmitError(result.error);
        // Rewind to the profile step if the error is about the handle.
        if (/taken|username|characters|letters/i.test(result.error)) {
          setStep(2);
          setUsernameError(result.error);
        }
        return;
      }
      router.replace('/home');
      router.refresh();
    });
  }

  // ───────────── Step-specific Next/primary action ─────────────

  function nextButton() {
    switch (step) {
      case 0:
        return (
          <PrimaryButton onClick={() => goTo(1)}>Get started →</PrimaryButton>
        );
      case 1:
        return (
          <PrimaryButton onClick={() => goTo(2)}>Sounds good →</PrimaryButton>
        );
      case 2:
        return (
          <PrimaryButton
            onClick={handleProfileNext}
            disabled={!usernameValid || checkingUsername}
          >
            {checkingUsername ? 'Checking…' : 'Next →'}
          </PrimaryButton>
        );
      case 3:
        return (
          <PrimaryButton onClick={() => goTo(4)}>
            {locationGranted === true ? 'Nice, onward →' : 'Continue →'}
          </PrimaryButton>
        );
      case 4:
        return (
          <PrimaryButton onClick={finish} disabled={isPending}>
            {isPending ? 'Saving…' : "Let's hunt 🫡"}
          </PrimaryButton>
        );
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-bg text-text">
      {/* Soft 67 wallpaper — pure decoration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]"
      >
        {Array.from({ length: 14 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          return (
            <div
              key={i}
              className="absolute font-display text-[80px] leading-none text-text tracking-tight"
              style={{
                left: `${col * 28 + (row % 2) * 14 - 10}%`,
                top: `${row * 25 - 5}%`,
                transform: `rotate(${(i * 23) % 30 - 15}deg)`,
              }}
            >
              67
            </div>
          );
        })}
      </div>

      {/* Header: progress dots + back. */}
      <header className="relative z-10 flex items-center gap-3 px-5 pt-10">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="h-9 w-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-alt transition"
          aria-label="Back"
        >
          ←
        </button>
        <div className="flex-1 flex gap-1.5" aria-hidden>
          {progressDots.map((active, i) => (
            <div
              key={i}
              className={[
                'flex-1 h-1 rounded-full transition-colors',
                active ? 'bg-primary' : 'bg-border',
              ].join(' ')}
            />
          ))}
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-faint w-10 text-right">
          {step + 1}/{totalSteps}
        </div>
      </header>

      {/* Body — each step owns its own scroll. */}
      <main className="relative z-10 flex-1 flex flex-col px-5 pt-6 pb-2 min-h-0">
        {step === 0 && <SlideWelcome emoji={emoji} />}
        {step === 1 && <SlideHowItWorks />}
        {step === 2 && (
          <SlideProfile
            username={username}
            setUsername={(v) => {
              setUsername(v);
              setUsernameError(null);
            }}
            emoji={emoji}
            setEmoji={setEmoji}
            usernameError={usernameError}
            usernameValid={usernameValid}
          />
        )}
        {step === 3 && (
          <SlideLocation
            granted={locationGranted}
            busy={locationBusy}
            onAllow={requestLocation}
            onSkip={() => goTo(4)}
          />
        )}
        {step === 4 && <SlideFinish username={username} emoji={emoji} />}
      </main>

      {/* Footer CTA. */}
      <footer className="relative z-10 px-5 pb-8 pt-3">
        {submitError && (
          <div className="mb-3 rounded-xl bg-accent/10 border border-accent/30 px-3 py-2 text-xs text-accent font-medium">
            {submitError}
          </div>
        )}
        {nextButton()}
      </footer>
    </div>
  );
}

// ───────────────────────────────────────────
// Shared bits
// ───────────────────────────────────────────

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_-4px_rgba(0,177,79,0.55)] hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// ───────────────────────────────────────────
// Step 0: welcome
// ───────────────────────────────────────────

function SlideWelcome({ emoji }: { emoji: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
      <div className="r67-pop-in">
        <Shield67 size={130} />
      </div>
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-faint">
        Welcome, new hunter
      </div>
      <h1 className="font-display text-4xl leading-[0.95] tracking-tight text-text">
        Hunt the 67.
      </h1>
      <p className="max-w-[300px] text-sm text-muted leading-relaxed">
        FoodGrabber surfaces <b className="text-text">67 spots</b> near you and
        turns visiting them into a competitive leaderboard.
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
        <span className="text-lg leading-none">{emoji}</span>
        <span>Your avatar. You can change it in a sec.</span>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// Step 1: how it works
// ───────────────────────────────────────────

function SlideHowItWorks() {
  const cards = [
    {
      icon: '🎯',
      extra: '🛣️',
      title: 'Pick a mode',
      sub: 'Lockdown a radius or hunt along a route',
      desc: 'Two ways to catch 67s: lock a radius around you, or plot a corridor between two points.',
    },
    {
      icon: '📍',
      title: 'Check in geofenced',
      sub: 'No cheese, no spoofing',
      desc: 'Stand inside the spot and tap check in. We verify you are where you say you are.',
    },
    {
      icon: '🏆',
      title: 'Climb the board',
      sub: 'Global · SG · district · friends',
      desc: 'Every check-in ranks you four ways. Weekly resets keep it fresh.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-faint">
          01 · how it works
        </div>
        <h2 className="font-display text-3xl leading-[1.02] tracking-tight text-text mt-1">
          Three moves,
          <br />
          one game.
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-3xl bg-surface border border-border p-4 flex gap-3 items-start"
          >
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary-tint text-primary flex items-center justify-center text-xl">
              {c.extra ? (
                <span className="flex items-center gap-0.5 text-lg">
                  {c.icon}
                  <span className="opacity-60">{c.extra}</span>
                </span>
              ) : (
                c.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg leading-tight text-text tracking-tight">
                {c.title}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-primary mt-0.5">
                {c.sub}
              </div>
              <div className="text-xs text-muted mt-1 leading-relaxed">
                {c.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// Step 2: profile (username + avatar)
// ───────────────────────────────────────────

function SlideProfile({
  username,
  setUsername,
  emoji,
  setEmoji,
  usernameError,
  usernameValid,
}: {
  username: string;
  setUsername: (v: string) => void;
  emoji: string;
  setEmoji: (v: string) => void;
  usernameError: string | null;
  usernameValid: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-faint">
          02 · pick your handle
        </div>
        <h2 className="font-display text-3xl leading-[1.02] tracking-tight text-text mt-1">
          Build your
          <br />
          hunter.
        </h2>
      </div>

      {/* Preview card */}
      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white p-4 flex items-center gap-3 shadow-[0_12px_36px_-6px_rgba(0,177,79,0.35)]">
        <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center text-3xl leading-none">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
            @{username || 'yourhandle'}
          </div>
          <div className="font-display text-xl leading-tight tracking-tight mt-0.5">
            Rookie hunter
          </div>
          <div className="text-[10px] font-semibold text-white/80 mt-1">
            0 XP · 🇸🇬 Singapore
          </div>
        </div>
      </div>

      {/* Username */}
      <div>
        <div className="text-[11px] font-black uppercase tracking-widest text-faint mb-2">
          Username
        </div>
        <div className="flex items-center gap-1 rounded-2xl bg-surface border border-border px-3 h-12 focus-within:border-primary transition-colors">
          <span className="text-muted text-sm font-bold">@</span>
          <input
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.replace(/\s/g, '').slice(0, 20))
            }
            placeholder="skibidi_dev"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 h-full bg-transparent outline-none border-none text-text text-sm font-semibold placeholder:text-faint"
            aria-invalid={usernameError ? 'true' : 'false'}
            aria-describedby="username-hint"
          />
          {usernameValid && !usernameError && (
            <span className="text-primary text-base leading-none">✓</span>
          )}
        </div>
        <div
          id="username-hint"
          className={[
            'text-[11px] mt-1.5',
            usernameError ? 'text-accent font-semibold' : 'text-faint',
          ].join(' ')}
        >
          {usernameError ?? '3-20 chars · letters, numbers, underscores'}
        </div>
      </div>

      {/* Avatar grid */}
      <div>
        <div className="text-[11px] font-black uppercase tracking-widest text-faint mb-2">
          Avatar
        </div>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_OPTIONS.map((e) => {
            const active = e === emoji;
            return (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={[
                  'aspect-square rounded-2xl flex items-center justify-center text-2xl leading-none transition',
                  active
                    ? 'bg-primary-tint ring-2 ring-primary scale-105'
                    : 'bg-surface border border-border hover:bg-surface-alt',
                ].join(' ')}
                aria-pressed={active}
                aria-label={`Avatar ${e}`}
              >
                {e}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// Step 3: location permission
// ───────────────────────────────────────────

function SlideLocation({
  granted,
  busy,
  onAllow,
  onSkip,
}: {
  granted: boolean | null;
  busy: boolean;
  onAllow: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center text-center gap-4 overflow-y-auto">
      {/* Radar */}
      <div className="relative w-44 h-44 mt-2">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40 animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-5 rounded-full bg-primary/10 animate-pulse" />
        <div className="absolute inset-[3rem] rounded-full bg-primary flex items-center justify-center text-4xl text-white">
          📍
        </div>
        {[
          [20, 30],
          [80, 15],
          [25, 75],
          [78, 70],
          [50, 10],
        ].map(([x, y], i) => (
          <div
            key={i}
            className="absolute font-display text-base text-primary tracking-tight"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            67
          </div>
        ))}
      </div>

      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-faint">
        03 · location
      </div>
      <h2 className="font-display text-3xl leading-[1.02] tracking-tight text-text">
        Where you at?
      </h2>
      <p className="max-w-[300px] text-sm text-muted leading-relaxed">
        We need your location to pin you on the map and find 67s nearby. No 67,
        no gyatt.
      </p>

      <div className="w-full rounded-3xl bg-surface border border-border p-3 flex flex-col gap-2.5 text-left">
        {[
          { ic: '🎯', t: 'Route you through nearby 67s', s: 'Optimal paths within your radius' },
          { ic: '🏅', t: 'Check in to claim XP', s: 'Geo-verified, no cheese' },
          { ic: '🔒', t: "We don't sell your data", s: 'Only used in-app, pinky promise' },
        ].map((it) => (
          <div key={it.t} className="flex items-center gap-3">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-base">
              {it.ic}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-text leading-tight">
                {it.t}
              </div>
              <div className="text-[11px] text-muted mt-0.5 leading-snug">
                {it.s}
              </div>
            </div>
          </div>
        ))}
      </div>

      {granted === true && (
        <div className="w-full rounded-2xl bg-primary-tint border border-primary/30 px-3 py-2 text-xs text-primary-dark font-semibold">
          ✓ Location granted. You&apos;re set.
        </div>
      )}
      {granted === false && (
        <div className="w-full rounded-2xl bg-surface-alt border border-border px-3 py-2 text-xs text-muted font-medium">
          No location — the app still works, just less fun. You can enable it
          later in your device settings.
        </div>
      )}

      <div className="w-full flex flex-col gap-2 mt-1">
        <button
          type="button"
          onClick={onAllow}
          disabled={busy}
          className="w-full h-12 rounded-2xl bg-surface border border-border text-text font-bold text-sm hover:bg-surface-alt transition disabled:opacity-60"
        >
          {busy
            ? 'Waiting for browser…'
            : granted === true
              ? 'Re-check location'
              : 'Allow precise location'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-[11px] font-bold uppercase tracking-widest text-faint hover:text-muted"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// Step 4: finish
// ───────────────────────────────────────────

function SlideFinish({ username, emoji }: { username: string; emoji: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
      <div className="r67-pop-in">
        <Shield67 size={130} />
      </div>
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-faint">
        you&apos;re in
      </div>
      <h2 className="font-display text-4xl leading-[0.95] tracking-tight text-text">
        Let&apos;s hunt.
      </h2>
      <div className="flex items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-3">
        <div className="text-2xl leading-none">{emoji}</div>
        <div className="text-left">
          <div className="font-display text-lg leading-tight tracking-tight text-text">
            @{username}
          </div>
          <div className="text-[11px] text-muted">Rookie · 0 XP</div>
        </div>
      </div>
      <p className="max-w-[280px] text-sm text-muted leading-relaxed">
        Your board is empty. Go claim a <b className="text-text">67</b>.
      </p>
    </div>
  );
}
