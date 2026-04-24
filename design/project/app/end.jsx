/* global React */
// End-of-hunt screens (4 variants: complete / ended-early / timer-out / speedrun-PB)
// + SkipSpotModal (small confirm + reroute toast)

window.END_VARIANTS = {
  complete: {
    id: 'complete',
    hero: 'CERTIFIED SIGMA',
    headline: 'hunt complete fr',
    sub: 'every 67 in the radius: collected',
    emoji: '🫡', accent: '#00B14F', confetti: true, rain: true,
    ribbon: 'W'
  },
  'ended-early': {
    id: 'ended-early',
    hero: 'LOW TAPER FADE',
    headline: 'you dipped early',
    sub: 'no shame. the 67s will wait.',
    emoji: '🫤', accent: '#FFB020', confetti: false, rain: false,
    ribbon: 'L'
  },
  'timer-out': {
    id: 'timer-out',
    hero: "CLOCK'S COOKED",
    headline: "time's up, chief",
    sub: "the clock ran out on you. gyatt.",
    emoji: '⏰', accent: '#FF3D55', confetti: false, rain: true,
    ribbon: 'TIMEOUT'
  },
  'speedrun-pb': {
    id: 'speedrun-pb',
    hero: 'PERSONAL BEST',
    headline: 'NEW RECORD',
    sub: 'skibidi-fast. board is trembling.',
    emoji: '🏆', accent: '#FFB020', confetti: true, rain: true,
    ribbon: 'PB'
  },
};

function EndScreen({ theme, variant, stats, onLeaderboard, onHome, onRetry }) {
  const T = theme;
  const V = window.END_VARIANTS[variant] || window.END_VARIANTS.complete;
  const [replayT, setReplayT] = React.useState(0);
  const [shared, setShared] = React.useState(false);

  // animate replay progress once on mount
  React.useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / 2200);
      setReplayT(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const s = stats || {};
  const visited = s.visited ?? 8;
  const skipped = s.skipped ?? 1;
  const total = s.total ?? 10;
  const xp = s.xp ?? 950;
  const timeMin = s.timeMin ?? 42;
  const avgSec = Math.round((timeMin * 60) / Math.max(1, visited));
  const rankDelta = s.rankDelta ?? 12;
  const newRank = s.newRank ?? 847;
  const breakdown = s.breakdown ?? { legendary: 1, rare: 3, common: 4 };

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      {/* top hero gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 380,
        background: `linear-gradient(180deg, ${V.accent} 0%, ${V.accent}CC 50%, ${T.bg} 100%)`,
      }}/>

      {/* 67 rain (soft, behind content) */}
      {V.rain && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.18 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, left: `${(i * 37) % 100}%`,
              fontFamily: window.TOKENS.fontDisplay, color: '#fff',
              fontSize: 22 + (i % 5) * 8, letterSpacing: -1,
              animation: `fallRain ${4 + (i % 4)}s linear ${i * 0.25}s infinite`,
            }}>67</div>
          ))}
        </div>
      )}

      {/* scrollable content */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto', paddingTop: 50, paddingBottom: 140 }}>
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', color: '#fff' }}>
          <button onClick={onHome} style={{
            width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900,
          }}>×</button>
          <div style={{ flex: 1 }}/>
          <div style={{
            padding: '5px 10px', borderRadius: 999,
            background: 'rgba(0,0,0,0.25)', color: '#fff',
            fontSize: 10, fontWeight: 900, letterSpacing: 0.8, whiteSpace: 'nowrap',
          }}>{V.ribbon}</div>
        </div>

        {/* hero */}
        <div style={{ padding: '12px 24px 0', textAlign: 'center', color: '#fff' }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px',
            background: 'rgba(0,0,0,0.25)', borderRadius: 999,
            fontSize: 11, fontWeight: 900, letterSpacing: 1, whiteSpace: 'nowrap',
          }}>{V.hero}</div>
          <div style={{ fontSize: 72, lineHeight: 1, marginTop: 14 }}>{V.emoji}</div>
          <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 36, letterSpacing: -1.2, lineHeight: 1, marginTop: 12 }}>
            {V.headline}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 8, fontStyle: 'italic' }}>{V.sub}</div>

          {/* XP hero */}
          <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, opacity: 0.85 }}>+</span>
            <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 92, letterSpacing: -3, lineHeight: 1, textShadow: '0 6px 24px rgba(0,0,0,0.25)' }}>
              {xp}
            </span>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1 }}>XP</span>
          </div>
        </div>

        {/* CARD STACK */}
        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* stops summary */}
          <Card T={T}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <Stat T={T} big={String(visited)} label="visited" color="#00B14F"/>
              <Div T={T}/>
              <Stat T={T} big={String(skipped)} label="skipped" color="#FF3D55"/>
              <Div T={T}/>
              <Stat T={T} big={`${visited}/${total}`} label="completion"/>
            </div>
          </Card>

          {/* route replay */}
          <Card T={T} title="Route replay">
            <ReplayMap T={T} accent={V.accent} progress={replayT}/>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 8, fontSize: 11, color: T.textMuted,
            }}>
              <span style={{ fontWeight: 700 }}>{timeMin} min · {(visited * 0.3).toFixed(1)} km</span>
              <span>avg <b style={{ color: T.text }}>{Math.floor(avgSec / 60)}m {avgSec % 60}s</b> / stop</span>
            </div>
          </Card>

          {/* rarity breakdown */}
          <Card T={T} title="Rarity breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <RarityBar T={T} label="Legendary" count={breakdown.legendary} total={visited} color="#FFB020" emoji="⭐"/>
              <RarityBar T={T} label="Rare"      count={breakdown.rare}      total={visited} color="#8B5CF6" emoji="💎"/>
              <RarityBar T={T} label="Common"    count={breakdown.common}    total={visited} color={T.textMuted} emoji="🔹"/>
            </div>
          </Card>

          {/* leaderboard delta */}
          <Card T={T}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: T.primaryTint, color: T.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: window.TOKENS.fontDisplay, fontSize: 28, letterSpacing: -0.5,
              }}>↑{rankDelta}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' }}>Global rank</div>
                <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 22, color: T.text, letterSpacing: -0.5, marginTop: 1 }}>
                  #{newRank.toLocaleString()} <span style={{ color: '#00B14F', fontSize: 13 }}>↑{rankDelta}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>you passed <b style={{ color: T.text }}>skibidi.dev</b> and 11 others</div>
              </div>
              <button onClick={onLeaderboard} style={{
                padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: T.text, color: T.surface,
                fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
                fontFamily: window.TOKENS.fontBody, whiteSpace: 'nowrap',
              }}>View →</button>
            </div>
          </Card>

          {/* share card */}
          <Card T={T}>
            <div style={{
              borderRadius: 12, padding: 14,
              background: `linear-gradient(135deg, ${V.accent} 0%, ${V.accent}AA 100%)`,
              color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0.85 }}>
                <window.Shield67 size={54}/>
              </div>
              <div style={{ fontSize: 32 }}>{V.emoji}</div>
              <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 22, letterSpacing: -0.6, lineHeight: 1.1, marginTop: 4 }}>
                I bagged {visited} 67s
              </div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>route67.app · #67hunt</div>
            </div>
            <button onClick={() => { setShared(true); setTimeout(() => setShared(false), 1800); }} style={{
              width: '100%', marginTop: 8, height: 42, borderRadius: 10, cursor: 'pointer',
              background: 'transparent', color: T.text, border: `1.5px solid ${T.border}`,
              fontSize: 12, fontWeight: 800, letterSpacing: 0.3,
              fontFamily: window.TOKENS.fontBody,
            }}>
              {shared ? '✓ Copied to clipboard' : '📸 Share screenshot'}
            </button>
          </Card>
        </div>
      </div>

      {/* footer CTAs */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 18px',
        background: `linear-gradient(180deg, ${T.bg}00 0%, ${T.bg} 40%)`,
        display: 'flex', gap: 8,
      }}>
        <button onClick={onRetry} style={{
          flex: 1, height: 50, borderRadius: 14, cursor: 'pointer',
          background: T.surface, color: T.text, border: `1px solid ${T.border}`,
          fontFamily: window.TOKENS.fontBody, fontSize: 13, fontWeight: 800,
        }}>Hunt again</button>
        <button onClick={onLeaderboard} style={{
          flex: 2, height: 50, borderRadius: 14, cursor: 'pointer',
          background: V.accent, color: '#fff', border: 'none',
          fontFamily: window.TOKENS.fontBody, fontSize: 14, fontWeight: 900, letterSpacing: 0.3,
          boxShadow: `0 8px 24px ${V.accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          🏆 See the board
        </button>
      </div>
    </div>
  );
}

function Card({ T, title, children }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: 14,
    }}>
      {title && (
        <div style={{ fontSize: 10, fontWeight: 900, color: T.textFaint, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      )}
      {children}
    </div>
  );
}
const Div = ({ T }) => <div style={{ width: 1, alignSelf: 'stretch', background: T.border }}/>;

function Stat({ T, big, label, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 28, color: color || T.text, letterSpacing: -0.5, lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

function RarityBar({ T, label, count, total, color, emoji }) {
  const pct = total === 0 ? 0 : (count / total) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.text, flex: 1 }}>{label}</span>
        <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 14, color, letterSpacing: -0.2 }}>{count}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: T.surfaceAlt, marginTop: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }}/>
      </div>
    </div>
  );
}

function ReplayMap({ T, accent, progress }) {
  // synthesized polyline for the replay
  const pts = [
    [20, 80], [30, 62], [48, 58], [60, 42], [74, 48],
    [82, 32], [68, 22], [50, 28], [34, 20], [22, 36],
  ];
  const W = 300, H = 140;
  const pathStr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p[0] / 100) * W} ${(p[1] / 100) * H}`).join(' ');
  // animate visibility by dashoffset
  const total = 500;
  const offset = total * (1 - progress);
  const visibleStops = Math.floor(progress * pts.length);

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden', background: T.mapLand,
      border: `1px solid ${T.border}`, position: 'relative',
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
        {/* grid */}
        <defs>
          <pattern id="replayGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={T.border} strokeOpacity="0.5" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#replayGrid)"/>
        {/* road-ish lines */}
        <path d={`M 0 100 Q 80 85 160 95 T 300 100`} stroke={T.mapRoadMajor} strokeWidth="4" fill="none" opacity="0.7"/>
        <path d={`M 60 0 Q 70 50 90 80 T 110 140`} stroke={T.mapRoadMajor} strokeWidth="4" fill="none" opacity="0.7"/>
        {/* route */}
        <path d={pathStr} stroke={accent} strokeOpacity="0.2" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={pathStr} stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={total} strokeDashoffset={offset}/>
        {/* stops */}
        {pts.map((p, i) => {
          const shown = i < visibleStops;
          return (
            <g key={i} transform={`translate(${(p[0] / 100) * W} ${(p[1] / 100) * H})`} opacity={shown ? 1 : 0.15}>
              <circle r="6" fill="#fff" stroke={accent} strokeWidth="2.5"/>
              <text y="2.5" textAnchor="middle" fontSize="7" fontWeight="900" fill={accent}>{i + 1}</text>
            </g>
          );
        })}
        {/* you-are-here head */}
        {progress < 1 && pts.length > 1 && (() => {
          const idx = Math.min(pts.length - 1, Math.max(0, progress * (pts.length - 1)));
          const i0 = Math.floor(idx), i1 = Math.min(pts.length - 1, i0 + 1);
          const f = idx - i0;
          const x = ((pts[i0][0] * (1 - f) + pts[i1][0] * f) / 100) * W;
          const y = ((pts[i0][1] * (1 - f) + pts[i1][1] * f) / 100) * H;
          return <circle cx={x} cy={y} r="5" fill={accent}><animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite"/></circle>;
        })()}
      </svg>
    </div>
  );
}

// ───────────────────────────────────────────
// SKIP MODAL + REROUTE TOAST
// ───────────────────────────────────────────
function SkipSpotModal({ theme, spot, onCancel, onConfirm }) {
  const T = theme;
  if (!spot) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        width: '100%', background: T.surface, borderRadius: '20px 20px 0 0',
        padding: '14px 18px 18px',
        animation: 'slideUp 0.22s ease',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: `${window.TOKENS.rarity[spot.rarity].color}22`,
            border: `1.5px solid ${window.TOKENS.rarity[spot.rarity].color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>{spot.emoji || '📍'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 20, color: T.text, letterSpacing: -0.4, lineHeight: 1.1 }}>
              Skip {spot.name.replace(/^67 /, '')}?
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
              rerouting costs <b style={{ color: '#FF3D55' }}>-{spot.rarity === 'legendary' ? 500 : spot.rarity === 'rare' ? 150 : 50} XP</b>. you sure?
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={onCancel} style={{
            flex: 1, height: 46, borderRadius: 12, cursor: 'pointer',
            background: T.surfaceAlt, color: T.text, border: 'none',
            fontFamily: window.TOKENS.fontBody, fontSize: 13, fontWeight: 800,
          }}>nvm keep it</button>
          <button onClick={onConfirm} style={{
            flex: 1, height: 46, borderRadius: 12, cursor: 'pointer',
            background: '#FF3D55', color: '#fff', border: 'none',
            fontFamily: window.TOKENS.fontBody, fontSize: 13, fontWeight: 900, letterSpacing: 0.3,
          }}>skip fr</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

function RerouteToast({ theme, show }) {
  const T = theme;
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      background: T.text, color: T.surface,
      padding: '8px 14px', borderRadius: 999,
      fontSize: 12, fontWeight: 800, letterSpacing: 0.3, whiteSpace: 'nowrap',
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideDown 0.22s ease',
    }}>
      <span style={{ fontSize: 14 }}>🧭</span>
      Skipped — rerouted
      <style>{`@keyframes slideDown { from { transform: translate(-50%, -12px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
    </div>
  );
}

Object.assign(window, { EndScreen, SkipSpotModal, RerouteToast });
