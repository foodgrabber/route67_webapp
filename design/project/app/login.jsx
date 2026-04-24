/* global React */
// Login + onboarding — meme-first. Three-step flow:
//   1. LoginScreen   — big 67 logo, "Enter the 67verse", Google + magic link
//   2. PermissionStep — location permission explainer
//   3. ProfileStep   — pick username + avatar + home village

window.SG_VILLAGES = [
  { id: 'bishan', name: 'Bishan', sub: 'Braddell MRT · 67 Bishan St', emoji: '🌳' },
  { id: 'clementi', name: 'Clementi', sub: 'Clementi Mall · Block 67', emoji: '🏫' },
  { id: 'kentridge', name: 'Kent Ridge', sub: 'NUS · PGP', emoji: '🎓' },
  { id: 'tiong', name: 'Tiong Bahru', sub: 'Seng Poh · old-school', emoji: '🥟' },
  { id: 'pasir', name: 'Pasir Ris', sub: 'beach + NTUC', emoji: '🏖️' },
  { id: 'ang', name: 'Ang Mo Kio', sub: 'AMK hub · 67 vibes', emoji: '🏙️' },
  { id: 'jurong', name: 'Jurong East', sub: 'JEM · Westgate', emoji: '🏢' },
  { id: 'tampines', name: 'Tampines', sub: 'Our Tampines Hub', emoji: '🏬' },
  { id: 'yishun', name: 'Yishun', sub: 'Chaotic good', emoji: '🌀' },
  { id: 'toa', name: 'Toa Payoh', sub: 'Dragon playground', emoji: '🐉' },
  { id: 'woodlands', name: 'Woodlands', sub: 'Causeway-adjacent', emoji: '🌲' },
  { id: 'punggol', name: 'Punggol', sub: 'Waterway', emoji: '🌊' },
];

window.AVATAR_OPTIONS = [
  { id: 'a1', bg: '#FF3D8A', fg: '#FFE9F2', glyph: '67' },
  { id: 'a2', bg: '#00B14F', fg: '#E6FBF0', glyph: '🫡' },
  { id: 'a3', bg: '#2A7FFF', fg: '#E9F0FF', glyph: '🗿' },
  { id: 'a4', bg: '#FFB020', fg: '#2A1500', glyph: '🎯' },
  { id: 'a5', bg: '#8B5CF6', fg: '#F0EAFF', glyph: '👑' },
  { id: 'a6', bg: '#0A3A1F', fg: '#E6FBF0', glyph: '🧃' },
  { id: 'a7', bg: '#FF5555', fg: '#FFECEC', glyph: '🔥' },
  { id: 'a8', bg: '#1A1A1A', fg: '#F5D742', glyph: '⚡' },
];

// ───────────────────────────────────────────
// LOGIN SCREEN — meme-first entry
// ───────────────────────────────────────────
function LoginScreen({ theme, onEnter }) {
  const T = theme;
  // stage: 'hero' → 'auth' → (magic) 'email' → 'sent'
  const [stage, setStage] = React.useState('hero');
  const [loading, setLoading] = React.useState(null); // 'google' | 'send'
  const [email, setEmail] = React.useState('');
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const enterVerse = () => {
    setStage('auth');
  };

  const clickGoogle = () => {
    setLoading('google');
    setTimeout(() => {
      setLoading(null);
      onEnter();
    }, 900);
  };

  const sendMagic = () => {
    if (!emailValid) return;
    setLoading('send');
    setTimeout(() => {
      setLoading(null);
      setStage('sent');
      setTimeout(onEnter, 1400);
    }, 900);
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#0A3A1F',
      color: '#fff',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(env(safe-area-inset-top, 60px), 72px)',
    }}>
      {/* background: tiled 67 pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.07, overflow: 'hidden' }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${col * 22 + (row % 2) * 11 - 10}%`,
              top: `${row * 14 - 5}%`,
              fontFamily: window.TOKENS.fontDisplay,
              fontSize: 80, color: '#fff', letterSpacing: -3,
              transform: `rotate(${(i * 37) % 40 - 20}deg)`,
            }}>67</div>
          );
        })}
      </div>

      {/* Grab-green glow */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '80%',
        background: `radial-gradient(ellipse at 30% 40%, #00B14F55 0%, transparent 60%)`,
        pointerEvents: 'none',
      }}/>

      {/* HERO */}
      <div style={{
        position: 'relative', zIndex: 2, flex: 1, minHeight: 0,
        padding: '24px 28px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflowY: 'auto',
      }}>
        <div style={{ flexShrink: 0, width: 90, height: 95 }}>
          <window.Shield67 size={90}/>
        </div>

        <div style={{ position: 'relative', marginTop: 8 }}>
          <div style={{
            fontFamily: window.TOKENS.fontDisplay, fontSize: 140, color: '#00B14F',
            letterSpacing: -8, lineHeight: 0.9, textShadow: '0 8px 40px #00B14F99',
            animation: 'logoPulse 3s ease-in-out infinite',
          }}>67</div>
          <div style={{
            position: 'absolute', top: 40, right: -40,
            background: '#FF3D8A', color: '#fff',
            padding: '4px 10px', borderRadius: 999,
            fontSize: 11, fontWeight: 900, letterSpacing: 0.5,
            transform: 'rotate(8deg)',
            boxShadow: '0 4px 14px #FF3D8A66',
          }}>CERTIFIED SIGMA</div>
        </div>

        <div style={{
          fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: '#fff',
          letterSpacing: -1, marginTop: 4, textAlign: 'center', lineHeight: 1,
        }}>Route 67</div>

        <div style={{
          fontSize: 14, color: '#B6D9C4', marginTop: 18, textAlign: 'center',
          maxWidth: 280, lineHeight: 1.5,
        }}>
          hunt every <b style={{ color: '#fff' }}>67</b> in the city.<br/>
          climb the board. <i>touch grass responsibly.</i>
        </div>

        {/* stats strip */}
        <div style={{
          marginTop: 12, display: 'flex', gap: 20,
          padding: '12px 18px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
        }}>
          {[
            { n: '2,847', l: 'hunters' },
            { n: '14k+', l: "67's found" },
            { n: '67', l: 'districts' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 20, color: '#fff', letterSpacing: -0.5, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 9, color: '#B6D9C4', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA STACK */}
      <div style={{
        position: 'relative', zIndex: 2, flexShrink: 0,
        padding: '12px 28px 28px',
        minHeight: 220,
      }}>
        {/* STAGE: HERO — just "Enter the 67verse" */}
        <div key="hero" style={{
          position: stage === 'hero' ? 'relative' : 'absolute',
          inset: stage === 'hero' ? 'auto' : '12px 28px 28px',
          opacity: stage === 'hero' ? 1 : 0,
          transform: stage === 'hero' ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: stage === 'hero' ? 'auto' : 'none',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <button onClick={enterVerse} style={{
            height: 60, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: '#FF3D8A', color: '#fff',
            fontFamily: window.TOKENS.fontBody, fontSize: 16, fontWeight: 900, letterSpacing: 0.4,
            boxShadow: '0 10px 30px #FF3D8A66',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            textTransform: 'uppercase',
          }}>
            Enter the 67verse <span style={{ fontSize: 20 }}>→</span>
          </button>
          <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.5 }}>
            by vibing you agree to the <u>chill ToS</u> · <u>no-drip policy</u>
          </div>
        </div>

        {/* STAGE: AUTH — pick Google or Magic link */}
        <div key="auth" style={{
          position: stage === 'auth' ? 'relative' : 'absolute',
          inset: stage === 'auth' ? 'auto' : '12px 28px 28px',
          opacity: stage === 'auth' ? 1 : 0,
          transform: stage === 'auth' ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: stage === 'auth' ? 'auto' : 'none',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>
            sign in to start hunting
          </div>

          <button onClick={clickGoogle} style={{
            height: 54, borderRadius: 14, cursor: 'pointer',
            background: '#fff', color: '#1A1A1A',
            border: 'none', fontFamily: window.TOKENS.fontBody, fontSize: 14, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          }}>
            {loading === 'google' ? <LoadDots dark/> : <><GoogleG/> Continue with Google</>}
          </button>

          <button onClick={() => setStage('email')} style={{
            height: 54, borderRadius: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.25)',
            fontFamily: window.TOKENS.fontBody, fontSize: 14, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>✉️</span> Send me a magic link
          </button>

          <button onClick={() => setStage('hero')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
            marginTop: 2, padding: 6,
          }}>
            ← back
          </button>
        </div>

        {/* STAGE: EMAIL — enter email for magic link */}
        <div key="email" style={{
          position: stage === 'email' ? 'relative' : 'absolute',
          inset: stage === 'email' ? 'auto' : '12px 28px 28px',
          opacity: stage === 'email' ? 1 : 0,
          transform: stage === 'email' ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: stage === 'email' ? 'auto' : 'none',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16, padding: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Magic link time</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: 10 }}>
              drop your email — we'll send a 67-second login link
            </div>
            <input
              autoFocus
              type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMagic(); }}
              placeholder="you@skibidi.co"
              style={{
                width: '100%', height: 46, borderRadius: 10, padding: '0 14px',
                background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: window.TOKENS.fontBody, fontSize: 14, fontWeight: 600,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setStage('auth')} style={{
                flex: 1, height: 44, borderRadius: 10, cursor: 'pointer',
                background: 'transparent', color: '#B6D9C4', border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: window.TOKENS.fontBody, fontSize: 13, fontWeight: 700,
              }}>Back</button>
              <button onClick={sendMagic} disabled={!emailValid || loading === 'send'} style={{
                flex: 2, height: 44, borderRadius: 10, cursor: emailValid ? 'pointer' : 'not-allowed',
                background: emailValid ? '#00B14F' : 'rgba(255,255,255,0.1)',
                color: '#fff', border: 'none',
                fontFamily: window.TOKENS.fontBody, fontSize: 13, fontWeight: 800, letterSpacing: 0.3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: emailValid ? 1 : 0.6,
              }}>
                {loading === 'send' ? <LoadDots/> : <>Send link →</>}
              </button>
            </div>
          </div>
        </div>

        {/* STAGE: SENT — confirmation */}
        <div key="sent" style={{
          position: stage === 'sent' ? 'relative' : 'absolute',
          inset: stage === 'sent' ? 'auto' : '12px 28px 28px',
          opacity: stage === 'sent' ? 1 : 0,
          transform: stage === 'sent' ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: stage === 'sent' ? 'auto' : 'none',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16, padding: 20, textAlign: 'center',
          }}>
            <div style={{ fontSize: 38 }}>✉️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 6 }}>
              Link sent to {email || 'your inbox'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              check your spam folder, skibidi. redirecting you in…
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes logoPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }`}</style>
    </div>
  );
}

function LoadDots({ dark }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dark ? '#1A1A1A' : '#fff',
          animation: `bounceDot 1.2s ${i * 0.15}s infinite`,
        }}/>
      ))}
      <style>{`@keyframes bounceDot { 0%,80%,100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-4px); } }`}</style>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ───────────────────────────────────────────
// PERMISSION STEP
// ───────────────────────────────────────────
function PermissionStep({ theme, onNext, onBack }) {
  const T = theme;
  const [granting, setGranting] = React.useState(false);

  const grant = () => {
    setGranting(true);
    setTimeout(onNext, 900);
  };

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, position: 'relative', paddingTop: 50, display: 'flex', flexDirection: 'column' }}>
      <OnboardingHeader theme={T} step={1} total={2} onBack={onBack}/>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* animated radar */}
        <div style={{ position: 'relative', width: 180, height: 180, marginTop: 12 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px dashed ${T.primary}66`,
            animation: 'spin 20s linear infinite',
          }}/>
          <div style={{
            position: 'absolute', inset: 20, borderRadius: '50%',
            background: `${T.primary}1a`,
            animation: 'pulse 2s infinite',
          }}/>
          <div style={{
            position: 'absolute', inset: 50, borderRadius: '50%',
            background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, color: '#fff',
          }}>📍</div>
          {/* scatter of 67 pins */}
          {[[20, 30], [80, 15], [25, 75], [78, 70], [50, 10]].map(([x, y], i) => (
            <div key={i} style={{
              position: 'absolute', left: `${x}%`, top: `${y}%`,
              fontFamily: window.TOKENS.fontDisplay, fontSize: 16,
              color: T.primary, letterSpacing: -0.3,
              animation: `popIn 0.6s ${i * 0.12}s backwards`,
            }}>67</div>
          ))}
        </div>

        <div style={{
          fontFamily: window.TOKENS.fontDisplay, fontSize: 28, color: T.text,
          letterSpacing: -0.8, marginTop: 24, lineHeight: 1.05,
        }}>where you at?</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 10, maxWidth: 300, lineHeight: 1.55 }}>
          We need your location to pin you on the map and find 67s nearby. No 67, no gyatt.
        </div>

        <div style={{
          marginTop: 20, padding: 14, borderRadius: 14,
          background: T.surface, border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', width: '100%',
        }}>
          {[
            { ic: '🎯', t: 'Route you through nearby 67s', s: 'Optimal paths within your radius' },
            { ic: '🏅', t: 'Check in to claim XP', s: 'Geo-verified, no cheese' },
            { ic: '🔒', t: "We don't sell your data", s: 'Only used in-app, pinky promise' },
          ].map((it) => (
            <div key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, background: T.surfaceAlt,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}>{it.ic}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>{it.t}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1, lineHeight: 1.3 }}>{it.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 24px 20px' }}>
        <button onClick={grant} style={{
          width: '100%', height: 52, borderRadius: 14, cursor: 'pointer',
          background: T.primary, color: '#fff', border: 'none',
          fontFamily: window.TOKENS.fontBody, fontSize: 15, fontWeight: 900, letterSpacing: 0.3,
          boxShadow: `0 8px 24px ${T.primary}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {granting ? <LoadDots/> : <>Allow precise location <span style={{ fontSize: 18 }}>→</span></>}
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: T.textFaint, marginTop: 8 }}>
          can deny but fr the app is like 12% as fun
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// PROFILE STEP
// ───────────────────────────────────────────
function ProfileStep({ theme, onDone, onBack }) {
  const T = theme;
  const [username, setUsername] = React.useState('');
  const [avatarId, setAvatarId] = React.useState('a1');
  const [villageId, setVillageId] = React.useState('bishan');
  const [checking, setChecking] = React.useState(false);

  const avatar = window.AVATAR_OPTIONS.find((a) => a.id === avatarId);
  const village = window.SG_VILLAGES.find((v) => v.id === villageId);

  const canSubmit = username.length >= 3 && avatar && village;

  const submit = () => {
    if (!canSubmit) return;
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      onDone({ username, avatar, village });
    }, 600);
  };

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, position: 'relative', paddingTop: 50, display: 'flex', flexDirection: 'column' }}>
      <OnboardingHeader theme={T} step={2} total={2} onBack={onBack}/>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 24px' }}>
        <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 28, color: T.text, letterSpacing: -0.8, lineHeight: 1.05 }}>
          build your hunter
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
          pick a handle, an avatar, and your home village
        </div>

        {/* preview card */}
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 16,
          background: `linear-gradient(135deg, ${avatar.bg} 0%, ${avatar.bg}CC 100%)`,
          color: avatar.fg,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: `0 12px 36px ${avatar.bg}44`,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: avatar.fg, color: avatar.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: window.TOKENS.fontDisplay, fontSize: avatar.glyph.length > 2 ? 22 : 26,
            letterSpacing: -0.5, flexShrink: 0,
          }}>{avatar.glyph}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>@{username || 'yourhandle'}</div>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 22, letterSpacing: -0.5, lineHeight: 1.1, marginTop: 1 }}>
              {village?.emoji} {village?.name || 'Pick a village'}
            </div>
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 3, fontWeight: 700 }}>Rookie hunter · 0 XP · 🇸🇬 Singapore</div>
          </div>
        </div>

        {/* username */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>Username</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: '0 12px', height: 48,
          }}>
            <span style={{ color: T.textMuted, fontSize: 15, fontWeight: 800 }}>@</span>
            <input
              value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').slice(0, 18))}
              placeholder="skibidi.dev"
              style={{
                flex: 1, height: '100%', border: 'none', outline: 'none', background: 'transparent',
                color: T.text, fontFamily: window.TOKENS.fontBody, fontSize: 15, fontWeight: 700,
              }}
            />
            {username.length >= 3 && <span style={{ color: '#00B14F', fontSize: 16 }}>✓</span>}
          </div>
          <div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>3–18 chars · no spaces · can't change later fr</div>
        </div>

        {/* avatar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>Avatar</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {window.AVATAR_OPTIONS.map((a) => {
              const active = a.id === avatarId;
              return (
                <div key={a.id} onClick={() => setAvatarId(a.id)} style={{
                  aspectRatio: '1', borderRadius: 14, cursor: 'pointer',
                  background: a.bg, color: a.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: window.TOKENS.fontDisplay, fontSize: a.glyph.length > 2 ? 18 : 22,
                  border: `3px solid ${active ? T.text : 'transparent'}`,
                  boxShadow: active ? `0 0 0 2px ${T.bg}, 0 6px 20px ${a.bg}55` : 'none',
                  transition: 'all 0.15s',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                }}>{a.glyph}</div>
              );
            })}
          </div>
        </div>

        {/* village */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>Home village</div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, margin: '0 -20px', padding: '0 20px 4px' }}>
            {window.SG_VILLAGES.map((v) => {
              const active = v.id === villageId;
              return (
                <div key={v.id} onClick={() => setVillageId(v.id)} style={{
                  flexShrink: 0, cursor: 'pointer',
                  padding: '8px 12px', borderRadius: 12,
                  background: active ? T.text : T.surface,
                  color: active ? T.surface : T.text,
                  border: `1px solid ${active ? T.text : T.border}`,
                  minWidth: 110,
                }}>
                  <div style={{ fontSize: 18 }}>{v.emoji}</div>
                  <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 13, letterSpacing: -0.2, marginTop: 3, whiteSpace: 'nowrap' }}>{v.name}</div>
                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1, whiteSpace: 'nowrap' }}>{v.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{
        flexShrink: 0, padding: '12px 20px 18px',
        borderTop: `1px solid ${T.border}`,
        background: T.bg,
      }}>
        <button onClick={submit} disabled={!canSubmit} style={{
          width: '100%', height: 52, borderRadius: 14, cursor: canSubmit ? 'pointer' : 'not-allowed',
          background: canSubmit ? T.primary : T.border,
          color: '#fff', border: 'none',
          fontFamily: window.TOKENS.fontBody, fontSize: 15, fontWeight: 900, letterSpacing: 0.3,
          boxShadow: canSubmit ? `0 8px 24px ${T.primary}55` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {checking ? <LoadDots/> : <>Start hunting · @{username || '…'} <span style={{ fontSize: 18 }}>→</span></>}
        </button>
      </div>
    </div>
  );
}

function OnboardingHeader({ theme, step, total, onBack }) {
  const T = theme;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, background: T.surface,
          border: `1px solid ${T.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{window.Icon.chevL(T.text)}</button>
      )}
      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < step ? T.primary : T.border,
          }}/>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
        {step}/{total}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, PermissionStep, ProfileStep });
