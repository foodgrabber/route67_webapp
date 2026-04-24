/* global React */
// Onboarding tour — shown AFTER auth/profile, BEFORE the map.
// 4 swipeable cards: welcome, game modes, ranks/XP, leaderboard.

window.RANK_TIERS = [
  { id: 'rookie',    name: 'Rookie',     xp: 0,     emoji: '🥚', color: '#94A3B8' },
  { id: 'scout',     name: 'Scout',      xp: 500,   emoji: '🐣', color: '#00B14F' },
  { id: 'hunter',    name: 'Hunter',     xp: 2000,  emoji: '🎯', color: '#2A7FFF' },
  { id: 'sigma',     name: 'Sigma',      xp: 5000,  emoji: '🗿', color: '#8B5CF6' },
  { id: 'legend',    name: 'Legend',     xp: 12000, emoji: '👑', color: '#FFB020' },
  { id: 'godrider',  name: 'God-Rider',  xp: 30000, emoji: '⚡', color: '#FF3D8A' },
];

function OnboardingTour({ theme, profile, onFinish }) {
  const T = theme;
  const [idx, setIdx] = React.useState(0);
  const slides = ['welcome', 'modes', 'ranks', 'leaderboard'];
  const isLast = idx === slides.length - 1;
  const next = () => isLast ? onFinish() : setIdx(idx + 1);
  const back = () => idx > 0 && setIdx(idx - 1);

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      {/* soft bg pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const r = Math.floor(i / 4), c = i % 4;
          return <div key={i} style={{
            position: 'absolute', left: `${c * 28 + (r % 2) * 14 - 10}%`, top: `${r * 25 - 5}%`,
            fontFamily: window.TOKENS.fontDisplay, fontSize: 80, color: T.text, letterSpacing: -3,
            transform: `rotate(${(i * 23) % 30 - 15}deg)`,
          }}>67</div>;
        })}
      </div>

      {/* header: progress + skip */}
      <div style={{ position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= idx ? T.primary : T.border,
              transition: 'all 0.3s',
            }}/>
          ))}
        </div>
        <button onClick={onFinish} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: T.textMuted, fontSize: 12, fontWeight: 800, letterSpacing: 0.3,
          padding: '6px 4px',
        }}>skip</button>
      </div>

      {/* slides */}
      <div style={{ position: 'absolute', inset: '90px 0 110px', overflow: 'hidden' }}>
        <div key={idx} style={{ width: '100%', height: '100%', animation: 'slideTour 0.35s ease' }}>
          {slides[idx] === 'welcome'     && <SlideWelcome T={T} profile={profile}/>}
          {slides[idx] === 'modes'       && <SlideModes T={T}/>}
          {slides[idx] === 'ranks'       && <SlideRanks T={T}/>}
          {slides[idx] === 'leaderboard' && <SlideLeaderboard T={T} profile={profile}/>}
        </div>
      </div>

      {/* footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 20px', display: 'flex', gap: 8 }}>
        {idx > 0 && (
          <button onClick={back} style={{
            flex: 1, height: 52, borderRadius: 14, cursor: 'pointer',
            background: T.surface, color: T.text, border: `1px solid ${T.border}`,
            fontFamily: window.TOKENS.fontBody, fontSize: 14, fontWeight: 800,
          }}>Back</button>
        )}
        <button onClick={next} style={{
          flex: 2, height: 52, borderRadius: 14, cursor: 'pointer',
          background: T.primary, color: '#fff', border: 'none',
          fontFamily: window.TOKENS.fontBody, fontSize: 15, fontWeight: 900, letterSpacing: 0.3,
          boxShadow: `0 8px 24px ${T.primary}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {isLast ? <>Let's hunt 🫡</> : <>Next <span style={{ fontSize: 18 }}>→</span></>}
        </button>
      </div>

      <style>{`@keyframes slideTour { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}

// ───────────── SLIDE 1: welcome ─────────────
function SlideWelcome({ T, profile }) {
  const av = profile?.avatar || { bg: '#FF3D8A', fg: '#fff', glyph: '67' };
  const village = profile?.village || { name: 'Singapore', emoji: '🇸🇬' };
  const username = profile?.username || 'hunter';
  return (
    <div style={{ padding: '0 24px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{
        width: 110, height: 110, borderRadius: 26,
        background: `linear-gradient(135deg, ${av.bg} 0%, ${av.bg}CC 100%)`,
        color: av.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: window.TOKENS.fontDisplay, fontSize: av.glyph.length > 2 ? 38 : 52,
        boxShadow: `0 16px 40px ${av.bg}55`,
        animation: 'popIn 0.6s ease',
      }}>{av.glyph}</div>
      <div style={{ marginTop: 24, fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>
        welcome, new hunter
      </div>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 34, color: T.text, letterSpacing: -1, marginTop: 8, lineHeight: 1 }}>
        @{username}
      </div>
      <div style={{ fontSize: 14, color: T.textMuted, marginTop: 8 }}>
        {village.emoji} {village.name} · 🇸🇬 Singapore
      </div>
      <div style={{
        marginTop: 26, padding: '14px 18px', borderRadius: 16,
        background: T.surface, border: `1px solid ${T.border}`,
        maxWidth: 300, textAlign: 'left',
      }}>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55 }}>
          quick tour — 3 things:<br/>
          <b>how to hunt</b> · <b>how ranks work</b> · <b>how to top the board</b>
        </div>
      </div>
    </div>
  );
}

// ───────────── SLIDE 2: game modes ─────────────
function SlideModes({ T }) {
  return (
    <div style={{ padding: '0 20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>01 · modes</div>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 28, color: T.text, letterSpacing: -0.8, lineHeight: 1.05, marginTop: 4 }}>
        two ways to<br/>catch 67s.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        <ModeMini T={T} icon="🛣️" accent="#00B14F" name="Detour Gang" tagline="Hunt along the way"
                  desc="Pick A → B. We inflate the corridor and scoop every 67 on your route. Perfect for commutes."/>
        <ModeMini T={T} icon="🎯" accent="#FF3D8A" name="67 Lockdown" tagline="Hunt in this radius"
                  desc="Stand somewhere. Lock a radius. We plot the optimal loop through every 67 inside."/>
      </div>
      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 12,
        background: T.surfaceAlt, border: `1px dashed ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 22 }}>⏱️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>+ speedruns</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>stack a timer on either mode · 15 / 30 / 67 / 120 min</div>
        </div>
      </div>
    </div>
  );
}

function ModeMini({ T, icon, accent, name, tagline, desc }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 14, padding: 12, display: 'flex', gap: 10,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
        background: `${accent}22`, color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 17, color: T.text, letterSpacing: -0.3 }}>{name}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: 0.2, marginTop: 1 }}>{tagline}</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

// ───────────── SLIDE 3: ranks ─────────────
function SlideRanks({ T }) {
  return (
    <div style={{ padding: '0 20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>02 · ranks & xp</div>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 28, color: T.text, letterSpacing: -0.8, lineHeight: 1.05, marginTop: 4 }}>
        climb from<br/>🥚 to ⚡.
      </div>

      {/* xp-per-rarity strip */}
      <div style={{
        marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
      }}>
        {[
          { l: 'Common', xp: 50,  c: T.textMuted, e: '🔹' },
          { l: 'Rare',   xp: 150, c: '#8B5CF6',   e: '💎' },
          { l: 'Legend', xp: 500, c: '#FFB020',   e: '⭐' },
        ].map((x) => (
          <div key={x.l} style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16 }}>{x.e}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 }}>{x.l}</div>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 16, color: x.c, letterSpacing: -0.2, marginTop: 2 }}>+{x.xp}</div>
          </div>
        ))}
      </div>

      {/* rank ladder */}
      <div style={{ marginTop: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 10 }}>
        {window.RANK_TIERS.map((r, i) => {
          const current = r.id === 'rookie';
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 6px',
              background: current ? `${T.primary}15` : 'transparent',
              borderRadius: 8,
              borderBottom: i < window.RANK_TIERS.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: `${r.color}22`, color: r.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                border: current ? `2px solid ${T.primary}` : 'none',
              }}>{r.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 15, color: T.text, letterSpacing: -0.3, lineHeight: 1 }}>{r.name}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{r.xp === 0 ? 'start here' : `${r.xp.toLocaleString()} XP`}</div>
              </div>
              {current && (
                <div style={{ padding: '3px 8px', borderRadius: 999, background: T.primary, color: '#fff', fontSize: 9, fontWeight: 900, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>YOU</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────── SLIDE 4: leaderboard ─────────────
function SlideLeaderboard({ T, profile }) {
  const username = profile?.username || 'you';
  return (
    <div style={{ padding: '0 20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>03 · the board</div>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 28, color: T.text, letterSpacing: -0.8, lineHeight: 1.05, marginTop: 4 }}>
        climb 4 boards<br/>at once.
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, lineHeight: 1.5 }}>
        every check-in ranks you globally, in 🇸🇬 SG, in your district, and vs. friends.
      </div>

      {/* fake leaderboard card */}
      <div style={{ marginTop: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '10px 12px', gap: 6, borderBottom: `1px solid ${T.border}` }}>
          {['Global', 'SG', 'Bishan', 'Friends'].map((s, i) => (
            <div key={s} style={{
              padding: '4px 10px', borderRadius: 999,
              background: i === 0 ? T.primary : T.surfaceAlt,
              color: i === 0 ? '#fff' : T.textMuted,
              fontSize: 10, fontWeight: 800, letterSpacing: 0.3, whiteSpace: 'nowrap',
            }}>{s}</div>
          ))}
        </div>
        {[
          { r: 1, n: 'sigma.grindset', f: '🇸🇬', xp: 28450, c: '#FFB020' },
          { r: 2, n: 'skibidi.dev',    f: '🇲🇾', xp: 19870, c: '#B0B0B0' },
          { r: 3, n: 'gyatt.master',   f: '🇮🇩', xp: 14210, c: '#CD7F32' },
          { r: 4120, n: '@' + username, f: '🇸🇬', xp: 0, you: true, c: T.textMuted },
        ].map((u, i) => (
          <div key={i} style={{
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
            background: u.you ? T.primaryTint : 'transparent',
            borderLeft: u.r <= 3 ? `3px solid ${u.c}` : '3px solid transparent',
          }}>
            <div style={{ width: 32, textAlign: 'center', fontFamily: window.TOKENS.fontDisplay, fontSize: 14, color: u.you ? T.primary : u.c, letterSpacing: -0.3 }}>
              {u.r > 99 ? '#' + u.r : u.r}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{u.f} {u.n}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{u.xp.toLocaleString()} XP</div>
            </div>
            {u.you && <div style={{ fontSize: 9, fontWeight: 900, color: T.primary, letterSpacing: 0.5 }}>YOU</div>}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 12,
        background: `${T.primary}15`, border: `1px solid ${T.primary}44`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 22 }}>🎁</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>weekly resets → prizes</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>top 67 players each week get GrabRewards</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingTour });
