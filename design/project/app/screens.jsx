/* global React, MapNUS, Icon, Pill, RarityChip, Avatar, Logo67, Card, Stat, TabBar */

// ─────────────────────────────────────────────────────────────
// MAP / HOME SCREEN
// ─────────────────────────────────────────────────────────────
function MapScreen({ theme, spots, route, selectedId, onSelect, onCheckIn, onNavigate, onPlan, userPos, radiusKm, dark, routeViz }) {
  const T = theme;
  const selected = spots.find((s) => s.id === selectedId);
  const spotsInRadius = spots.length;
  const routeDist = (spotsInRadius * 0.32).toFixed(1);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapNUS
          theme={T} spots={spots} route={route}
          selectedId={selectedId} onSelect={onSelect}
          userPos={userPos} radiusKm={radiusKm} dark={dark}
          showRoute={routeViz !== 'heatmap'}
          showRadius={routeViz !== 'numbered-only'}
          showHeatmap={routeViz === 'heatmap'}
          showNumbers={routeViz === 'numbered' || routeViz === 'numbered-only'}
        />
      </div>

      {/* TOP: search + filters */}
      <div style={{
        position: 'absolute', top: 54, left: 12, right: 12, zIndex: 10,
        display: 'flex', gap: 8,
      }}>
        <div style={{
          flex: 1, height: 44, borderRadius: 14,
          background: T.surface + 'F0', backdropFilter: 'blur(10px)',
          border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
          boxShadow: '0 4px 14px rgba(10,58,31,0.08)',
        }}>
          {Icon.search(T.textMuted)}
          <input placeholder="Search 67 spots…" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: T.text, fontFamily: window.TOKENS.fontBody,
          }}/>
          <Logo67 size={24}/>
        </div>
        <button style={{
          width: 44, height: 44, borderRadius: 14,
          background: T.surface + 'F0', backdropFilter: 'blur(10px)',
          border: `1px solid ${T.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(10,58,31,0.08)',
        }}>{Icon.layers(T.text)}</button>
      </div>

      {/* HUNT CTA / route banner */}
      {!selected && (
        <div style={{
          position: 'absolute', top: 108, left: 12, right: 12, zIndex: 10,
          background: T.surface + 'F5', backdropFilter: 'blur(10px)',
          borderRadius: 14, padding: '10px 12px',
          border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 14px rgba(10,58,31,0.08)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: T.primaryTint, color: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.nav(T.primary)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: window.TOKENS.fontBody }}>
              Optimal 67-loop · {spotsInRadius} stops
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
              {routeDist} km · ~{Math.round(spotsInRadius * 8)} min walk · within {radiusKm}km
            </div>
          </div>
          <button onClick={onPlan} style={{
            background: T.primary, color: '#fff', border: 'none', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 10, fontWeight: 800, fontSize: 12,
            fontFamily: window.TOKENS.fontBody, letterSpacing: 0.2,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>Plan hunt</button>
        </div>
      )}

      {/* SELECTED SPOT bottom sheet */}
      {selected && (
        <SpotSheet theme={T} spot={selected} onCheckIn={onCheckIn} onClose={() => onSelect(null)} onNavigate={onNavigate}/>
      )}

      {/* locate-me btn */}
      <button style={{
        position: 'absolute', right: 12, bottom: selected ? 260 : 170, zIndex: 10,
        width: 44, height: 44, borderRadius: '50%',
        background: T.surface, border: `1px solid ${T.border}`,
        boxShadow: '0 4px 14px rgba(10,58,31,0.12)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{Icon.target(T.primary)}</button>
    </div>
  );
}

function SpotSheet({ theme, spot, onCheckIn, onClose, onNavigate }) {
  const T = theme;
  const r = window.TOKENS.rarity[spot.rarity];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
      background: T.surface,
      borderRadius: '22px 22px 0 0',
      padding: '10px 16px 100px',
      boxShadow: '0 -10px 40px rgba(10,58,31,0.15)',
      animation: 'slideUp 0.25s ease-out',
    }}>
      <div style={{ width: 44, height: 5, borderRadius: 3, background: T.border, margin: '0 auto 12px' }}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: `linear-gradient(135deg, ${r.color}22 0%, ${r.color}11 100%)`,
          border: `2px solid ${r.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, flexShrink: 0,
        }}>{spot.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            <RarityChip rarity={spot.rarity}/>
            <Pill bg={T.primaryTint} color={T.primary}>0.4 km</Pill>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody, lineHeight: 1.2 }}>
            {spot.name}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{spot.place}</div>
        </div>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: '50%', background: T.surfaceAlt,
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{Icon.close(T.textMuted)}</button>
      </div>
      {spot.note && <div style={{ fontSize: 13, color: T.textMuted, marginTop: 10, lineHeight: 1.45 }}>"{spot.note}"</div>}
      <div style={{
        marginTop: 12, display: 'flex', gap: 10, padding: '10px 12px',
        background: T.surfaceAlt, borderRadius: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: T.textFaint, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Visitors</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>{spot.visitors.toLocaleString()}</div>
        </div>
        <div style={{ width: 1, background: T.border }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: T.textFaint, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Last claim</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>{spot.claim}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onNavigate} style={{
          flex: 1, height: 46, borderRadius: 12,
          background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: window.TOKENS.fontBody,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>{Icon.nav(T.text)} Route here</button>
        <button onClick={() => onCheckIn(spot)} style={{
          flex: 1.4, height: 46, borderRadius: 12,
          background: T.primary, color: '#fff', border: 'none',
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          fontFamily: window.TOKENS.fontBody, letterSpacing: 0.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 4px 14px rgba(0,177,79,0.35)',
        }}>{Icon.camera('#fff')} Check in</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SPOTS LIST
// ─────────────────────────────────────────────────────────────
function SpotsList({ theme, spots, onSelect }) {
  const T = theme;
  const [filter, setFilter] = React.useState('all');
  const visible = filter === 'all' ? spots : spots.filter((s) => s.rarity === filter);
  const filters = ['all', 'common', 'rare', 'legendary'];
  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, paddingTop: 50, paddingBottom: 100, overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: T.text, letterSpacing: -0.8, lineHeight: 1 }}>
          Nearby 67s
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{spots.length} within 2km · Kent Ridge</div>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
              background: active ? T.text : T.surface,
              color: active ? T.surface : T.text,
              border: `1px solid ${active ? T.text : T.border}`,
              fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
              textTransform: 'uppercase', whiteSpace: 'nowrap',
              fontFamily: window.TOKENS.fontBody,
            }}>{f}</button>
          );
        })}
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map((s, i) => {
          const r = window.TOKENS.rarity[s.rarity];
          return (
            <div key={s.id} onClick={() => onSelect(s.id)} style={{
              background: T.surface, borderRadius: 16, padding: 12,
              border: `1px solid ${T.border}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `linear-gradient(135deg, ${r.color}22 0%, ${r.color}11 100%)`,
                border: `2px solid ${r.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>{s.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody, lineHeight: 1.25 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, lineHeight: 1.3 }}>{s.place} · {(0.2 + i * 0.12).toFixed(1)} km</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <RarityChip rarity={s.rarity}/>
                  <Pill bg={T.surfaceAlt} color={T.textMuted}>{s.visitors.toLocaleString()} visited</Pill>
                </div>
              </div>
              {Icon.chevR(T.textFaint)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHECK-IN FLOW
// ─────────────────────────────────────────────────────────────
function CheckInScreen({ theme, spot, onDone, onCancel }) {
  const T = theme;
  const [step, setStep] = React.useState(0); // 0: camera, 1: verifying, 2: success
  const r = window.TOKENS.rarity[spot.rarity];

  React.useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (step === 2) {
    return (
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        background: `radial-gradient(circle at 50% 30%, ${r.color}33 0%, ${T.bg} 60%)`,
        display: 'flex', flexDirection: 'column', paddingTop: 50, paddingBottom: 100,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56, boxShadow: `0 20px 50px ${T.primary}66`,
            animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>✓</div>
          <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 42, color: T.text, letterSpacing: -1.5, marginTop: 24, lineHeight: 1 }}>
            CLAIMED!
          </div>
          <div style={{ fontSize: 16, color: T.textMuted, marginTop: 6 }}>
            {spot.name}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <RarityChip rarity={spot.rarity} size={13}/>
            <Pill bg={T.primaryTint} color={T.primary} size={13}>+{spot.rarity === 'legendary' ? 500 : spot.rarity === 'rare' ? 150 : 50} XP</Pill>
          </div>
          <div style={{
            marginTop: 28, padding: '14px 20px', background: T.surface, borderRadius: 14,
            border: `1px solid ${T.border}`, display: 'flex', gap: 14, alignItems: 'center',
          }}>
            {Icon.flame()}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>Streak extended! Day 13</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>+1 bonus spot tomorrow</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', gap: 10 }}>
          <button onClick={onDone} style={{
            flex: 1, height: 52, borderRadius: 14,
            background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: window.TOKENS.fontBody,
          }}>Back to map</button>
          <button onClick={onDone} style={{
            flex: 1.3, height: 52, borderRadius: 14,
            background: T.primary, color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: window.TOKENS.fontBody,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 8px 20px ${T.primary}55`,
          }}>{Icon.share('#fff')} Share flex</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: '#0A0A0A', overflow: 'hidden',
    }}>
      {/* fake viewfinder: gradient to imply camera feed */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 40% 55%, ${r.color}44 0%, #1a2a1e 30%, #0A0A0A 80%)`,
      }}/>
      {/* "scene" placeholder with the spot emoji huge */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 180, opacity: 0.22, filter: 'blur(1px)',
      }}>{spot.emoji}</div>

      {/* viewfinder brackets */}
      {[
        { top: 130, left: 40, b: ['top', 'left'] },
        { top: 130, right: 40, b: ['top', 'right'] },
        { bottom: 220, left: 40, b: ['bottom', 'left'] },
        { bottom: 220, right: 40, b: ['bottom', 'right'] },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: 32, height: 32,
          ...c,
          borderTop: c.b.includes('top') ? `3px solid ${T.primary}` : 'none',
          borderBottom: c.b.includes('bottom') ? `3px solid ${T.primary}` : 'none',
          borderLeft: c.b.includes('left') ? `3px solid ${T.primary}` : 'none',
          borderRight: c.b.includes('right') ? `3px solid ${T.primary}` : 'none',
        }}/>
      ))}

      {/* top bar */}
      <div style={{ position: 'absolute', top: 56, left: 16, right: 16, display: 'flex', gap: 10, zIndex: 5, alignItems: 'center' }}>
        <button onClick={onCancel} style={{
          width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
          background: 'rgba(0,0,0,0.5)', border: 'none', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.close('#fff')}</button>
        <div style={{
          flex: 1, height: 40, borderRadius: 12,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', padding: '0 14px', color: '#fff',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: window.TOKENS.fontBody }}>{spot.name}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>GPS locked · within 8m</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.primary, boxShadow: `0 0 10px ${T.primary}`, animation: 'pulse 1.2s infinite' }}/>
        </div>
      </div>

      {/* prompt */}
      <div style={{
        position: 'absolute', top: 140, left: 16, right: 16, zIndex: 5, textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 22, letterSpacing: -0.5, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Snap the 67
        </div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>AI verifies it's the real thing</div>
      </div>

      {/* controls */}
      <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
        <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 22, backdropFilter: 'blur(8px)' }}>⚡</button>
        <button onClick={() => setStep(1)} disabled={step === 1} style={{
          width: 84, height: 84, borderRadius: '50%',
          background: step === 1 ? T.primary : '#fff',
          border: '4px solid rgba(255,255,255,0.4)',
          cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          transition: 'all 0.2s',
        }}>
          {step === 1 && <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', margin: 'auto' }}/>}
        </button>
        <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 20, backdropFilter: 'blur(8px)' }}>🔄</button>
      </div>

      {step === 1 && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, zIndex: 20, color: '#fff',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            border: `4px solid ${T.primary}`,
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}/>
          <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 20, letterSpacing: -0.5 }}>Verifying…</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Matching photo + GPS + AI</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TURN-BY-TURN NAV
// ─────────────────────────────────────────────────────────────
function NavScreen({ theme, spots, route, onExit, userPos, radiusKm, dark }) {
  const T = theme;
  const [stop, setStop] = React.useState(0);
  const currentSpot = spots.find((s) => s.id === route[stop]);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapNUS theme={T} spots={spots} route={route} selectedId={currentSpot?.id} userPos={userPos} radiusKm={radiusKm} dark={dark} showRoute showNumbers/>
      </div>

      {/* top turn-by-turn card */}
      <div style={{
        position: 'absolute', top: 48, left: 12, right: 12, zIndex: 10,
        background: T.text, color: T.surface,
        borderRadius: 18, padding: '16px 18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: T.primary, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M12 4l-6 6M12 4l6 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45, 12, 12)"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: 0.5, textTransform: 'uppercase' }}>In 120 m</div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: window.TOKENS.fontBody, marginTop: 1 }}>Turn right onto Clementi Rd</div>
          </div>
        </div>
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.surface}22`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 22 }}>{currentSpot?.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Next 67 · Stop {stop + 1} of {route.length}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{currentSpot?.name}</div>
          </div>
        </div>
      </div>

      {/* bottom summary */}
      <div style={{
        position: 'absolute', bottom: 100, left: 12, right: 12, zIndex: 10,
        background: T.surface, borderRadius: 18, padding: '14px 16px',
        border: `1px solid ${T.border}`,
        boxShadow: '0 -4px 20px rgba(10,58,31,0.1)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 22, color: T.text }}>{4 + stop * 2}</span>
            <span style={{ fontSize: 11, color: T.textFaint, fontWeight: 700 }}>MIN</span>
            <span style={{ fontSize: 11, color: T.textFaint }}>·</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{(2.5 + stop * 0.3).toFixed(1)} km</span>
          </div>
          <div style={{ fontSize: 11, color: T.textMuted }}>{route.length - stop} 67s left · arriving 3:42 PM</div>
        </div>
        <button onClick={() => stop + 1 < route.length ? setStop(stop + 1) : onExit()} style={{
          height: 44, padding: '0 16px', borderRadius: 12,
          background: T.primary, color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 800, fontFamily: window.TOKENS.fontBody,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>Next stop {Icon.chevR('#fff')}</button>
        <button onClick={onExit} style={{
          width: 44, height: 44, borderRadius: '50%',
          background: '#FF3D5522', color: '#E23',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800,
        }}>×</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────
function Leaderboard({ theme, scope, setScope, period, setPeriod }) {
  const T = theme;
  const data = window.LEADERBOARD[scope] || window.LEADERBOARD.global;
  const scopes = [
    { id: 'global', label: 'Global', emoji: '🌍' },
    { id: 'country', label: 'Country', emoji: '🇸🇬' },
    { id: 'city', label: 'City', emoji: '🏙️' },
    { id: 'friends', label: 'Friends', emoji: '🤝' },
  ];
  const periods = ['Weekly', 'All-time'];

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, paddingTop: 50, paddingBottom: 100, overflowY: 'auto' }}>
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: T.text, letterSpacing: -0.8, lineHeight: 1 }}>
          Leaderboard
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Most 67s claimed</div>
      </div>

      {/* scope chips */}
      <div style={{ display: 'flex', gap: 6, padding: '6px 16px 10px', overflowX: 'auto' }}>
        {scopes.map((s) => {
          const active = scope === s.id;
          return (
            <button key={s.id} onClick={() => setScope(s.id)} style={{
              padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
              background: active ? T.primary : T.surface,
              color: active ? '#fff' : T.text,
              border: `1px solid ${active ? T.primary : T.border}`,
              fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
              fontFamily: window.TOKENS.fontBody,
              display: 'flex', alignItems: 'center', gap: 5,
            }}><span>{s.emoji}</span>{s.label}</button>
          );
        })}
      </div>

      {/* period segment */}
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 6 }}>
        {periods.map((p) => {
          const active = period === p;
          return (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer',
              background: active ? T.surfaceAlt : 'transparent',
              color: active ? T.text : T.textMuted,
              border: `1px solid ${active ? T.border : 'transparent'}`,
              fontSize: 12, fontWeight: 700,
              fontFamily: window.TOKENS.fontBody,
            }}>{p}</button>
          );
        })}
      </div>

      {/* top 3 podium */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 18, padding: '18px 10px 14px', position: 'relative', overflow: 'hidden',
        }}>
          {/* confetti bg */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.5,
            background: `radial-gradient(circle at 20% 30%, ${T.primary}22 0%, transparent 30%), radial-gradient(circle at 80% 70%, #FFB02022 0%, transparent 30%)`,
          }}/>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, position: 'relative' }}>
            {[data[1], data[0], data[2]].map((u, i) => {
              if (!u) return null;
              const medals = ['🥈', '🥇', '🥉'];
              const heights = [60, 84, 48];
              const idx = i === 1 ? 0 : i === 0 ? 1 : 2;
              return (
                <div key={u.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 22 }}>{medals[i]}</div>
                  <Avatar name={u.name} bg={u.avatar} size={i === 1 ? 52 : 42}/>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.text, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.flag} {u.name}
                  </div>
                  <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 16, color: T.primary, letterSpacing: -0.3 }}>{u.visited}</div>
                  <div style={{
                    width: 60, height: heights[i],
                    background: i === 1 ? `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)` : T.surfaceAlt,
                    borderRadius: '10px 10px 0 0',
                    color: i === 1 ? '#fff' : T.textMuted,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 6,
                    fontFamily: window.TOKENS.fontDisplay, fontSize: 18, letterSpacing: -0.5,
                  }}>{u.rank}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* remaining list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.slice(3).map((u) => (
          <div key={u.rank} style={{
            background: u.you ? T.primaryTint : T.surface, borderRadius: 14,
            border: `1px solid ${u.you ? T.primary : T.border}`,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 24, fontFamily: window.TOKENS.fontDisplay, fontSize: 16, color: T.textMuted, letterSpacing: -0.5, textAlign: 'center' }}>{u.rank}</div>
            <Avatar name={u.name} bg={u.avatar} size={36} you={u.you}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: window.TOKENS.fontBody }}>{u.flag} {u.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{u.delta} this week</div>
            </div>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 18, color: T.text, letterSpacing: -0.3 }}>{u.visited}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────
function Profile({ theme }) {
  const T = theme;
  const u = window.USER;
  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, paddingTop: 50, paddingBottom: 100, overflowY: 'auto' }}>
      {/* header with gradient */}
      <div style={{
        padding: '24px 16px 18px',
        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        {/* 67 deco */}
        <div style={{
          position: 'absolute', top: 4, right: -10,
          fontFamily: window.TOKENS.fontDisplay, fontSize: 140,
          color: 'rgba(255,255,255,0.12)', letterSpacing: -8, lineHeight: 1,
        }}>67</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: u.avatarBg, border: '3px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 26, letterSpacing: 0.5,
          }}>{u.initials}</div>
          <div>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 24, letterSpacing: -0.5, lineHeight: 1 }}>{u.name}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{u.handle} · {u.flag} {u.city}</div>
          </div>
        </div>
        <div style={{
          marginTop: 16, display: 'flex',
          background: 'rgba(255,255,255,0.15)', borderRadius: 14,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 24, letterSpacing: -0.5 }}>{u.totalVisited}</div>
            <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>Visited</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}/>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 24, letterSpacing: -0.5 }}>#{u.rank}</div>
            <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>Global</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}/>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 24, letterSpacing: -0.5 }}>🔥{u.streak}</div>
            <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>Streak</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ padding: '18px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>Badges</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{window.BADGES.filter((b) => b.earned).length} of {window.BADGES.length}</div>
        </div>
      </div>
      <div style={{
        padding: '0 16px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
      }}>
        {window.BADGES.map((b) => (
          <div key={b.id} style={{
            background: b.earned ? T.surface : T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 14, padding: '14px 8px',
            textAlign: 'center', opacity: b.earned ? 1 : 0.45,
            position: 'relative',
          }}>
            <div style={{
              fontSize: 28, marginBottom: 4,
              filter: b.earned ? 'none' : 'grayscale(1)',
            }}>{b.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>{b.name}</div>
          </div>
        ))}
      </div>

      {/* Rarity breakdown */}
      <div style={{ padding: '18px 16px 6px', fontSize: 16, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>
        Collection
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { r: 'legendary', owned: 2, total: 34 },
          { r: 'rare', owned: 8, total: 120 },
          { r: 'common', owned: 37, total: 380 },
        ].map((row) => {
          const rc = window.TOKENS.rarity[row.r];
          const pct = (row.owned / row.total) * 100;
          return (
            <div key={row.r} style={{
              background: T.surface, borderRadius: 12,
              border: `1px solid ${T.border}`, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: window.TOKENS.fontBody }}>{rc.label}</div>
                </div>
                <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 17, color: T.text }}>
                  {row.owned}<span style={{ color: T.textFaint }}>/{row.total}</span>
                </div>
              </div>
              <div style={{ height: 5, background: T.surfaceAlt, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: rc.color, borderRadius: 3 }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { MapScreen, SpotSheet, SpotsList, CheckInScreen, NavScreen, Leaderboard, Profile });
