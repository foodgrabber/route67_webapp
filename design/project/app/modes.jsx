/* global React, Icon, Pill */
// Mode picker — entry screen when user taps the 67 FAB. Two hunt modes + speedrun toggle.

window.HUNT_MODES = [
  {
    id: 'along',
    name: 'Detour Gang',
    tagline: 'Hunt along the way',
    blurb: 'Pick A → B. We inflate the corridor and grab every 67 that fits the detour.',
    emoji: '🛣️',
    accent: '#00B14F',
    bestFor: 'commuting · going somewhere anyway',
    stats: [{ k: 'Avg', v: '8 spots' }, { k: 'Typical', v: '25 min' }],
  },
  {
    id: 'radius',
    name: '67 Lockdown',
    tagline: 'Hunt in this radius',
    blurb: 'Lock a radius around you. We plot the optimal loop through every 67 inside.',
    emoji: '🎯',
    accent: '#FF3D8A',
    bestFor: 'free time · max collection',
    stats: [{ k: 'Avg', v: '12 spots' }, { k: 'Typical', v: '45 min' }],
  },
];

window.SPEEDRUNS = [
  { id: 'none',  label: 'Free hunt',        mins: null, emoji: '∞',  desc: 'No clock. Vibe.' },
  { id: 's15',   label: 'Rapid 67',         mins: 15,   emoji: '⚡', desc: 'Quick in-and-out.' },
  { id: 's30',   label: 'Skibidi Sprint',   mins: 30,   emoji: '🏃', desc: 'Half-hour dash.' },
  { id: 's67',   label: '67-Minute Mile',   mins: 67,   emoji: '🎯', desc: 'The meme run.' },
  { id: 's120',  label: 'Gyatt-Dash Marathon', mins: 120, emoji: '🔥', desc: 'Go off.' },
];

function ModePickerScreen({ theme, onCancel, onPick }) {
  const T = theme;
  const [modeId, setModeId] = React.useState('along');
  const [speedId, setSpeedId] = React.useState('none');
  const mode = window.HUNT_MODES.find((m) => m.id === modeId);
  const speed = window.SPEEDRUNS.find((s) => s.id === speedId);

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, paddingTop: 50, paddingBottom: 24, overflowY: 'auto', position: 'relative' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 4px' }}>
        <button onClick={onCancel} style={{
          width: 36, height: 36, borderRadius: 10, background: T.surface,
          border: `1px solid ${T.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.close(T.text)}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 26, color: T.text, letterSpacing: -0.8, lineHeight: 1 }}>
            Pick your hunt
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Two modes · five speedruns · one meme</div>
        </div>
      </div>

      {/* mode cards */}
      <div style={{ padding: '14px 16px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {window.HUNT_MODES.map((m) => {
          const active = modeId === m.id;
          return (
            <div key={m.id} onClick={() => setModeId(m.id)} style={{
              position: 'relative', cursor: 'pointer',
              background: active ? T.surface : T.surface,
              borderRadius: 18, padding: 14,
              border: `2px solid ${active ? m.accent : T.border}`,
              boxShadow: active ? `0 10px 30px ${m.accent}33` : 'none',
              transition: 'all 0.15s',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -18, right: -8,
                fontSize: 92, opacity: active ? 0.25 : 0.1, lineHeight: 1,
              }}>{m.emoji}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, position: 'relative' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: active ? m.accent : T.surfaceAlt,
                  color: active ? '#fff' : T.textMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{m.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 18, color: T.text, letterSpacing: -0.4 }}>{m.name}</span>
                    {active && <Pill bg={m.accent} color="#fff" size={9}>Selected</Pill>}
                  </div>
                  <div style={{ fontSize: 12, color: m.accent, fontWeight: 800, letterSpacing: 0.2, marginTop: 1 }}>{m.tagline}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, lineHeight: 1.4 }}>{m.blurb}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'flex-end' }}>
                    {m.stats.map((st) => (
                      <div key={st.k} style={{ flexShrink: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{st.k}</div>
                        <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 14, color: T.text, letterSpacing: -0.2, marginTop: 1, whiteSpace: 'nowrap' }}>{st.v}</div>
                      </div>
                    ))}
                    <div style={{ flex: 1, minWidth: 4 }}/>
                    <div style={{ fontSize: 10, color: T.textFaint, fontStyle: 'italic', textAlign: 'right', maxWidth: 110, lineHeight: 1.3 }}>
                      Best for<br/>{m.bestFor}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* speedrun */}
      <div style={{ padding: '16px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: T.textFaint, letterSpacing: 0.8, textTransform: 'uppercase' }}>Speedrun</div>
          <div style={{ flex: 1, height: 1, background: T.border }}/>
          {speed.mins && <Pill bg={T.text} color={T.surface} size={10}>⏱ {speed.mins} min</Pill>}
        </div>
      </div>
      <div style={{ padding: '8px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {window.SPEEDRUNS.map((s) => {
          const active = speedId === s.id;
          return (
            <div key={s.id} onClick={() => setSpeedId(s.id)} style={{
              flexShrink: 0, cursor: 'pointer', padding: '10px 12px',
              background: active ? T.text : T.surface,
              color: active ? T.surface : T.text,
              borderRadius: 14,
              border: `1px solid ${active ? T.text : T.border}`,
              minWidth: 110, textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>{s.emoji}</div>
              <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 13, letterSpacing: -0.2, marginTop: 6, whiteSpace: 'nowrap' }}>{s.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* leaderboard teaser for speedrun */}
      {speed.mins && (
        <div style={{
          margin: '14px 16px 0',
          padding: '10px 14px',
          background: T.primaryTint,
          border: `1px solid ${T.primary}44`,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 22 }}>🏆</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>This counts toward the {speed.label} board</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>Current record: <b>skibidi.map · 14 spots</b></div>
          </div>
        </div>
      )}

      {/* Continue */}
      <div style={{ padding: '18px 16px 0' }}>
        <button onClick={() => onPick(modeId, speedId)} style={{
          width: '100%', height: 52, borderRadius: 14,
          background: mode.accent, color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 900, letterSpacing: 0.3,
          fontFamily: window.TOKENS.fontBody,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 10px 28px ${mode.accent}55`,
        }}>
          Continue as {mode.name}{speed.mins ? ` · ${speed.mins} min` : ''} {Icon.chevR('#fff')}
        </button>
      </div>
    </div>
  );
}

// Compact HUD that appears on top of nav when speedrun is active
function SpeedrunHUD({ theme, mins, onEnd }) {
  const T = theme;
  const [remaining, setRemaining] = React.useState(mins * 60);
  React.useEffect(() => {
    if (remaining <= 0) return;
    const i = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(i);
  }, []);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const pct = (remaining / (mins * 60)) * 100;
  const urgent = remaining < mins * 60 * 0.2;
  return (
    <div style={{
      position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
      zIndex: 40,
      background: urgent ? '#FF3D55' : T.text, color: urgent ? '#fff' : T.surface,
      padding: '4px 14px', borderRadius: 999,
      fontFamily: window.TOKENS.fontDisplay, fontSize: 16, letterSpacing: -0.3,
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: urgent ? 'pulse 0.8s infinite' : 'none',
    }}>
      ⏱ {mm}:{ss}
      <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#fff', transition: 'width 1s linear' }}/>
      </div>
    </div>
  );
}

Object.assign(window, { ModePickerScreen, SpeedrunHUD });
