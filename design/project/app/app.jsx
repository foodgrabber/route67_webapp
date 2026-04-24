/* global React, ReactDOM */
/* Main app orchestration */

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "light",
    "scope": "global",
    "routeViz": "numbered",
    "radiusKm": 2,
    "chaosMode": false
  }/*EDITMODE-END*/;
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const theme = window.TOKENS.themes[t.theme] || window.TOKENS.themes.light;

  const [tab, setTab] = React.useState('map');
  const [selectedId, setSelectedId] = React.useState(null);
  const [mode, setMode] = React.useState(null); // null | 'picker' | 'checkin' | 'nav' | 'results' | 'plan' | 'radius' | 'end'
  const [checkInSpot, setCheckInSpot] = React.useState(null);
  const [period, setPeriod] = React.useState('All-time');
  const [huntMode, setHuntMode] = React.useState('along');
  const [speedrun, setSpeedrun] = React.useState('none');
  const [authStep, setAuthStep] = React.useState('login'); // 'login' | 'perm' | 'profile' | 'tour' | 'done'
  const [profile, setProfile] = React.useState(null);
  const [endVariant, setEndVariant] = React.useState('complete');
  const [skipSpot, setSkipSpot] = React.useState(null);
  const [rerouteToast, setRerouteToast] = React.useState(false);

  const spots = window.SPOTS;
  const route = window.ROUTE_DEFAULT;
  const userPos = { x: 0.40, y: 0.50 };

  const onTab = (id) => {
    if (id === 'hunt') {
      setTab('map');
      setMode('picker');
    } else {
      setTab(id);
      setMode(null);
    }
  };

  const onPickMode = (modeId, speedId) => {
    setHuntMode(modeId);
    setSpeedrun(speedId);
    setMode(modeId === 'radius' ? 'radius' : 'plan');
  };

  const speedMins = (window.SPEEDRUNS || []).find((s) => s.id === speedrun)?.mins || null;

  // Auth / onboarding gate
  const renderAuth = () => {
    if (authStep === 'login') {
      return <window.LoginScreen theme={theme} onEnter={() => setAuthStep('perm')}/>;
    }
    if (authStep === 'perm') {
      return <window.PermissionStep theme={theme} onNext={() => setAuthStep('profile')} onBack={() => setAuthStep('login')}/>;
    }
    if (authStep === 'profile') {
      return <window.ProfileStep theme={theme} onBack={() => setAuthStep('perm')} onDone={(p) => { setProfile(p); setAuthStep('tour'); }}/>;
    }
    if (authStep === 'tour') {
      return <window.OnboardingTour theme={theme} profile={profile} onFinish={() => setAuthStep('done')}/>;
    }
    return null;
  };

  const renderScreen = () => {
    if (authStep !== 'done') {
      return renderAuth();
    }
    if (mode === 'picker') {
      return <window.ModePickerScreen theme={theme} onCancel={() => setMode(null)} onPick={onPickMode}/>;
    }
    if (mode === 'checkin' && checkInSpot) {
      return <window.CheckInScreen theme={theme} spot={checkInSpot} onDone={() => { setMode(null); setSelectedId(null); }} onCancel={() => setMode(null)}/>;
    }
    if (mode === 'nav') {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <window.NavScreen theme={theme} spots={spots} route={route} onExit={() => { setEndVariant('ended-early'); setMode('end'); }} userPos={userPos} radiusKm={t.radiusKm} dark={t.theme === 'dark'} onSkip={(sp) => setSkipSpot(sp)} onFinish={() => { setEndVariant(speedMins ? 'speedrun-pb' : 'complete'); setMode('end'); }}/>
          {speedMins && <window.SpeedrunHUD theme={theme} mins={speedMins} onEnd={() => { setEndVariant('timer-out'); setMode('end'); }}/>}
          <window.RerouteToast theme={theme} show={rerouteToast}/>
          <window.SkipSpotModal theme={theme} spot={skipSpot} onCancel={() => setSkipSpot(null)} onConfirm={() => { setSkipSpot(null); setRerouteToast(true); setTimeout(() => setRerouteToast(false), 1800); }}/>
        </div>
      );
    }
    if (mode === 'end') {
      return <window.EndScreen theme={theme} variant={endVariant} stats={null}
                onLeaderboard={() => { setMode(null); setTab('board'); }}
                onHome={() => { setMode(null); setTab('map'); }}
                onRetry={() => setMode('picker')}/>;
    }
    if (mode === 'plan') {
      return <window.PlanRouteScreen theme={theme} onCancel={() => setMode('picker')} onStart={() => setMode('nav')}/>;
    }
    if (mode === 'radius') {
      return <window.RadiusHuntScreen theme={theme} onCancel={() => setMode('picker')} onStart={() => setMode('nav')}/>;
    }
    if (tab === 'map') {
      return <window.MapScreen
        theme={theme} spots={spots} route={route}
        selectedId={selectedId} onSelect={setSelectedId}
        onCheckIn={(s) => { setCheckInSpot(s); setMode('checkin'); }}
        onNavigate={() => setMode('nav')}
        onPlan={() => setMode('plan')}
        userPos={userPos} radiusKm={t.radiusKm} dark={t.theme === 'dark'}
        routeViz={t.routeViz}
      />;
    }
    if (tab === 'spots') {
      return <window.SpotsList theme={theme} spots={spots} onSelect={(id) => { setTab('map'); setSelectedId(id); }}/>;
    }
    if (tab === 'board') {
      return <window.Leaderboard theme={theme} scope={t.scope} setScope={(s) => setTweak('scope', s)} period={period} setPeriod={setPeriod}/>;
    }
    if (tab === 'me') {
      return <window.Profile theme={theme}/>;
    }
    return null;
  };

  // responsive: phone on mobile, side-by-side on desktop
  const [wide, setWide] = React.useState(window.innerWidth > 1000);
  React.useEffect(() => {
    const onR = () => setWide(window.innerWidth > 1000);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  const pagebg = wide
    ? `radial-gradient(ellipse at 20% 20%, ${theme.primary}11 0%, transparent 40%), radial-gradient(ellipse at 80% 80%, ${theme.accent}0a 0%, transparent 40%), ${theme.bg}`
    : theme.bg;

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: pagebg,
      fontFamily: window.TOKENS.fontBody,
      color: theme.text,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {wide && <DesktopHeader theme={theme}/>}
      <div style={{
        flex: 1, display: 'flex', alignItems: wide ? 'flex-start' : 'stretch',
        justifyContent: 'center', gap: wide ? 32 : 0,
        padding: wide ? '24px 40px 60px' : 0,
      }}>
        {/* Phone */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          width: wide ? 'auto' : '100%',
        }}>
          {wide ? (
            <window.PhoneFrame theme={theme} width={390} height={820} dark={t.theme === 'dark'}>
              <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {renderScreen()}
                {!mode && authStep === 'done' && <window.TabBar tab={tab} onTab={onTab} theme={theme}/>}
              </div>
            </window.PhoneFrame>
          ) : (
            <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
              {renderScreen()}
              {!mode && authStep === 'done' && <window.TabBar tab={tab} onTab={onTab} theme={theme}/>}
            </div>
          )}
          {wide && <PhoneCaption theme={theme} mode={mode} tab={tab}/>}
        </div>

        {/* Desktop side panel */}
        {wide && (
          <DesktopSide theme={theme} spots={spots} selectedId={selectedId} onSelect={setSelectedId}
                      scope={t.scope} setScope={(s) => setTweak('scope', s)} period={period} setPeriod={setPeriod}/>
        )}
      </div>

      {/* chaos mode: rain of 67s */}
      {t.chaosMode && <ChaosRain/>}

      <window.TweaksPanel>
        <window.TweakSection label="Theme"/>
        <window.TweakRadio label="Mode" value={t.theme} options={['light', 'dark', 'meme']}
                           onChange={(v) => setTweak('theme', v)}/>
        <window.TweakSection label="Map"/>
        <window.TweakRadio label="Route style" value={t.routeViz}
          options={[{value: 'numbered', label: 'Numbered'}, {value: 'polyline', label: 'Plain'}, {value: 'heatmap', label: 'Heatmap'}]}
          onChange={(v) => setTweak('routeViz', v)}/>
        <window.TweakSlider label="Inflation radius" value={t.radiusKm} min={0.5} max={5} step={0.5} unit="km"
                            onChange={(v) => setTweak('radiusKm', v)}/>
        <window.TweakSection label="Leaderboard"/>
        <window.TweakRadio label="Scope" value={t.scope}
          options={['global', 'country', 'city', 'friends']}
          onChange={(v) => setTweak('scope', v)}/>
        <window.TweakSection label="Surprise"/>
        <window.TweakToggle label="Chaos mode 🙏" value={t.chaosMode}
                            onChange={(v) => setTweak('chaosMode', v)}/>
      </window.TweaksPanel>

      <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fallRain { 0% { transform: translateY(-60px) rotate(-10deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(110vh) rotate(20deg); opacity: 0.2; } }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
      `}</style>
    </div>
  );
}

function DesktopHeader({ theme }) {
  const T = theme;
  return (
    <div style={{
      padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: `1px solid ${T.border}`,
      background: T.surface + 'AA', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <window.Shield67 size={38}/>
      <div>
        <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 20, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>Route 67</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, fontWeight: 600, letterSpacing: 0.3 }}>ROUTE 67 × MAPS API HACKATHON · SINGAPORE '26</div>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', gap: 8 }}>
        <window.Pill bg={T.primaryTint} color={T.primary} size={11}>● Live demo</window.Pill>
        <window.Pill bg={T.surfaceAlt} color={T.textMuted} size={11}>v0.67.1</window.Pill>
      </div>
    </div>
  );
}

function PhoneCaption({ theme, mode, tab }) {
  const T = theme;
  let label = 'Map';
  if (mode === 'picker') label = 'Mode picker · detour vs lockdown';
  else if (mode === 'checkin') label = 'Check-in flow';
  else if (mode === 'nav') label = 'Turn-by-turn navigation';
  else if (mode === 'plan') label = 'Detour Gang · plan A→B hunt';
  else if (mode === 'radius') label = '67 Lockdown · radius hunt';
  else if (tab === 'spots') label = 'Nearby spots list';
  else if (tab === 'board') label = 'Global leaderboard';
  else if (tab === 'me') label = 'Profile & badges';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.primary }}/>
      {label}
    </div>
  );
}

function DesktopSide({ theme, spots, selectedId, onSelect, scope, setScope, period, setPeriod }) {
  const T = theme;
  const [pane, setPane] = React.useState('board'); // board | spots
  const data = window.LEADERBOARD[scope] || window.LEADERBOARD.global;

  return (
    <div style={{
      width: 420, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 44, color: T.text, letterSpacing: -1.5, lineHeight: 1 }}>
            find every 67.
          </div>
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, marginTop: 10, lineHeight: 1.5 }}>
          Grab's maps API routes you through the optimal loop of <b style={{ color: T.text }}>67-themed spots</b> within a {2}km radius. Check in, climb the global board, collect legendaries.
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <window.Pill bg={T.primaryTint} color={T.primary}>Maps API</window.Pill>
          <window.Pill bg="#2A7FFF22" color="#2A7FFF">Routes Optimization</window.Pill>
          <window.Pill bg="#FF3D8A22" color="#FF3D8A">Places Nearby</window.Pill>
          <window.Pill bg={T.surfaceAlt} color={T.textMuted}>Geofencing</window.Pill>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setPane('board')} style={{
          flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
          background: pane === 'board' ? T.text : T.surface,
          color: pane === 'board' ? T.surface : T.text,
          border: `1px solid ${T.border}`,
          fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
          fontFamily: window.TOKENS.fontBody,
        }}>🏆 Leaderboard</button>
        <button onClick={() => setPane('spots')} style={{
          flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
          background: pane === 'spots' ? T.text : T.surface,
          color: pane === 'spots' ? T.surface : T.text,
          border: `1px solid ${T.border}`,
          fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
          fontFamily: window.TOKENS.fontBody,
        }}>📍 Spots near you</button>
      </div>

      {pane === 'board' ? (
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 20, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['global', 'country', 'city', 'friends'].map((s) => (
              <button key={s} onClick={() => setScope(s)} style={{
                padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
                background: scope === s ? T.primary : T.surfaceAlt,
                color: scope === s ? '#fff' : T.text,
                border: 'none', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
              }}>{s}</button>
            ))}
            <div style={{ flex: 1 }}/>
            {['Weekly', 'All-time'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
                background: period === p ? T.text : 'transparent',
                color: period === p ? T.surface : T.textMuted,
                border: 'none', fontSize: 11, fontWeight: 700,
              }}>{p}</button>
            ))}
          </div>
          <div style={{ padding: '8px 0' }}>
            {data.map((u) => (
              <div key={u.rank} style={{
                padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12,
                background: u.you ? T.primaryTint : 'transparent',
                borderLeft: u.rank === 1 ? `3px solid #FFB020` : u.rank === 2 ? `3px solid #B0B0B0` : u.rank === 3 ? `3px solid #CD7F32` : '3px solid transparent',
              }}>
                <div style={{ width: 28, textAlign: 'center', fontFamily: window.TOKENS.fontDisplay, fontSize: 16, color: u.rank <= 3 ? T.text : T.textMuted, letterSpacing: -0.3 }}>{u.rank}</div>
                <window.Avatar name={u.name} bg={u.avatar} size={36} you={u.you}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>{u.flag} {u.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{u.delta} this week · {u.visited} spots</div>
                </div>
                <div style={{
                  width: 40, height: 6, background: T.surfaceAlt, borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{ width: `${(u.visited / 900) * 100}%`, height: '100%', background: T.primary }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 20, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>12 spots within 2km</div>
            <div style={{ flex: 1 }}/>
            <window.Pill bg={T.surfaceAlt} color={T.textMuted}>Kent Ridge</window.Pill>
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {spots.map((s) => {
              const r = window.TOKENS.rarity[s.rarity];
              const active = s.id === selectedId;
              return (
                <div key={s.id} onClick={() => onSelect(active ? null : s.id)} style={{
                  padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer',
                  background: active ? T.primaryTint : 'transparent',
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${r.color}22`, border: `1.5px solid ${r.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{s.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{s.place}</div>
                  </div>
                  <window.RarityChip rarity={s.rarity}/>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChaosRain() {
  const items = React.useMemo(() => (
    Array.from({ length: 24 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 5,
      dur: 4 + Math.random() * 4,
      size: 22 + Math.random() * 40,
      rot: (Math.random() - 0.5) * 60,
    }))
  ), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2147483645, overflow: 'hidden' }}>
      {items.map((it, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: `${it.left}%`,
          fontFamily: window.TOKENS.fontDisplay, color: '#00B14F',
          fontSize: it.size, letterSpacing: -2,
          animation: `fallRain ${it.dur}s linear ${it.delay}s infinite`,
          textShadow: '0 2px 6px rgba(0,0,0,0.1)',
          transform: `rotate(${it.rot}deg)`,
        }}>67</div>
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
