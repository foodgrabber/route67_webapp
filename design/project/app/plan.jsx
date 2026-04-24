/* global React, MapNUS, Icon, Pill, RarityChip */

// Plan-a-Route: pick start + destination, then adjust the inflation radius
// (detour budget) to see how many 67s fall within the fattened corridor.

window.PLAN_PLACES = [
  { id: 'p_here',    name: 'My location',        sub: 'Kent Ridge · live',     x: 0.40, y: 0.50, icon: '📍', live: true },
  { id: 'p_mrt',     name: 'Kent Ridge MRT',     sub: 'Circle Line',           x: 0.30, y: 0.52, icon: '🚇' },
  { id: 'p_utown',   name: 'UTown',              sub: 'NUS University Town',   x: 0.62, y: 0.28, icon: '🏛️' },
  { id: 'p_holland', name: 'Holland Village',    sub: 'Coffee + 67 rumors',    x: 0.78, y: 0.16, icon: '☕' },
  { id: 'p_clementi',name: 'Clementi Mall',      sub: '15 min walk',           x: 0.16, y: 0.20, icon: '🛍️' },
  { id: 'p_west',    name: 'West Coast Plaza',   sub: 'Legendary hotspot',     x: 0.08, y: 0.72, icon: '🌊' },
  { id: 'p_home',    name: 'Home (PGP)',         sub: 'Prince George\'s Park', x: 0.55, y: 0.38, icon: '🏠' },
  { id: 'p_sciencep',name: 'Science Park',       sub: 'Block 67 is here',      x: 0.60, y: 0.18, icon: '🔬' },
];

// Straight-corridor sampling: a point is "on-route" if its perpendicular distance
// from the start→end line (clamped to the segment) is within radiusKm.
function pointLineDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const cx = ax + t * dx, cy = ay + t * dy;
  return { d: Math.hypot(px - cx, py - cy), t };
}

function PlanRouteScreen({ theme, onCancel, onStart }) {
  const T = theme;
  const [startId, setStartId] = React.useState('p_here');
  const [endId, setEndId] = React.useState('p_holland');
  const [radiusKm, setRadiusKm] = React.useState(0.8); // inflation radius
  const [picking, setPicking] = React.useState(null);  // null | 'start' | 'end'
  const [includeLegendary, setIncludeLegendary] = React.useState(true);
  const [avoid, setAvoid] = React.useState('none'); // 'none' | 'common'

  const places = window.PLAN_PLACES;
  const spots = window.SPOTS;
  const start = places.find((p) => p.id === startId);
  const end   = places.find((p) => p.id === endId);

  // Full-map normalized width ≈ 4km, so radiusKm → pxRadius / W (normalized).
  const normRadius = radiusKm / 4;

  const hitSpots = React.useMemo(() => {
    if (!start || !end) return [];
    const out = [];
    for (const s of spots) {
      if (!includeLegendary && s.rarity === 'legendary') continue;
      if (avoid === 'common' && s.rarity === 'common') continue;
      const { d, t } = pointLineDist(s.x, s.y, start.x, start.y, end.x, end.y);
      if (d <= normRadius) out.push({ ...s, t, d });
    }
    out.sort((a, b) => a.t - b.t);
    return out;
  }, [start, end, normRadius, includeLegendary, avoid]);

  // Direct distance → km (map is 4km wide)
  const directDistKm = start && end ? Math.hypot((end.x - start.x) * 4, (end.y - start.y) * 4 * (1000/800)) : 0;
  // Rough detour: +~20% per unit of radius
  const detourKm = directDistKm + hitSpots.length * 0.12;
  const walkMin = Math.round(detourKm * 12);

  const xpTotal = hitSpots.reduce((a, s) => a + (s.rarity === 'legendary' ? 500 : s.rarity === 'rare' ? 150 : 50), 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: T.bg }}>
      {/* MAP with corridor */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <PlanMap theme={T} spots={spots} start={start} end={end} radiusKm={radiusKm} hits={hitSpots} dark={false}/>
      </div>

      {/* HEADER */}
      <div style={{
        position: 'absolute', top: 48, left: 12, right: 12, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onCancel} style={{
          width: 40, height: 40, borderRadius: 12,
          background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(10,58,31,0.08)',
        }}>{Icon.chevL(T.text)}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 22, color: T.text, letterSpacing: -0.6, lineHeight: 1 }}>
            Plan your hunt
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Pick A → B, inflate the corridor, collect 67s along the way</div>
        </div>
      </div>

      {/* A→B CARD */}
      <div style={{
        position: 'absolute', top: 100, left: 12, right: 12, zIndex: 10,
        background: T.surface, borderRadius: 16,
        border: `1px solid ${T.border}`, padding: 10,
        boxShadow: '0 8px 24px rgba(10,58,31,0.1)',
      }}>
        <PlacePicker theme={T} role="start" place={start} picking={picking === 'start'} onOpen={() => setPicking(picking === 'start' ? null : 'start')}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 10px' }}>
          <div style={{ width: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: T.textFaint }}/>)}
          </div>
          <button onClick={() => { setStartId(endId); setEndId(startId); }} style={{
            marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: 0.3,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>↑↓ Swap</button>
        </div>
        <PlacePicker theme={T} role="end" place={end} picking={picking === 'end'} onOpen={() => setPicking(picking === 'end' ? null : 'end')}/>

        {picking && (
          <div style={{
            marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 6,
            maxHeight: 130, overflowY: 'auto',
          }}>
            {places.map((p) => {
              const isCurrent = (picking === 'start' ? startId : endId) === p.id;
              return (
                <div key={p.id} onClick={() => {
                  if (picking === 'start') setStartId(p.id);
                  else setEndId(p.id);
                  setPicking(null);
                }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px',
                  borderRadius: 8, cursor: 'pointer',
                  background: isCurrent ? T.primaryTint : 'transparent',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, background: T.surfaceAlt,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{p.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.25 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{p.sub}</div>
                  </div>
                  {p.live && <Pill bg="#FF3D8A22" color="#FF3D8A">● Live</Pill>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM SHEET: inflation + preview */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10,
        background: T.surface, borderRadius: '22px 22px 0 0',
        padding: '10px 14px 16px',
        boxShadow: '0 -10px 40px rgba(10,58,31,0.15)',
        maxHeight: '58%', overflowY: 'auto',
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: T.border, margin: '0 auto 10px' }}/>

        {/* inflation radius */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' }}>Inflation radius</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: T.text, letterSpacing: -0.6, lineHeight: 1 }}>
                {radiusKm.toFixed(1)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>KM</span>
              <span style={{ fontSize: 11, color: T.textFaint, marginLeft: 4 }}>detour either side</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>67s hit</div>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: T.primary, letterSpacing: -0.6, lineHeight: 1, marginTop: 2 }}>
              {hitSpots.length}
            </div>
          </div>
        </div>

        <RadiusSlider value={radiusKm} onChange={setRadiusKm} theme={T}/>

        {/* preset chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[
            { v: 0.3, label: 'On-path' },
            { v: 0.8, label: 'Casual' },
            { v: 1.5, label: 'Detour' },
            { v: 2.5, label: 'Full hunt' },
          ].map((p) => {
            const active = Math.abs(radiusKm - p.v) < 0.1;
            return (
              <button key={p.v} onClick={() => setRadiusKm(p.v)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 9, cursor: 'pointer',
                background: active ? T.text : T.surfaceAlt,
                color: active ? T.surface : T.textMuted,
                border: 'none', fontSize: 11, fontWeight: 800, letterSpacing: 0.2,
                fontFamily: window.TOKENS.fontBody,
              }}>{p.label}</button>
            );
          })}
        </div>

        {/* rarity filter + include toggle */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <FilterChip theme={T} active={includeLegendary} onClick={() => setIncludeLegendary(!includeLegendary)}>
            ★ Legendaries
          </FilterChip>
          <FilterChip theme={T} active={avoid !== 'common'} onClick={() => setAvoid(avoid === 'common' ? 'none' : 'common')}>
            Skip commons
          </FilterChip>
        </div>

        {/* stat strip */}
        <div style={{
          marginTop: 12, display: 'flex',
          background: T.surfaceAlt, borderRadius: 12, overflow: 'hidden',
        }}>
          <StatCell theme={T} label="Direct" value={`${directDistKm.toFixed(1)} km`}/>
          <Divider T={T}/>
          <StatCell theme={T} label="With detours" value={`${detourKm.toFixed(1)} km`}/>
          <Divider T={T}/>
          <StatCell theme={T} label="Walk" value={`${walkMin} min`}/>
          <Divider T={T}/>
          <StatCell theme={T} label="XP" value={`+${xpTotal}`} accent/>
        </div>

        {/* preview chips of the first few spots */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {hitSpots.slice(0, 5).map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 9px 5px 5px', borderRadius: 999,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              fontSize: 11, fontWeight: 700, color: T.text,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: window.TOKENS.rarity[s.rarity].color + '33',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>{s.emoji}</span>
              {i + 1}. {s.name.replace(/^67 /, '')}
            </div>
          ))}
          {hitSpots.length > 5 && (
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>+{hitSpots.length - 5} more</div>
          )}
          {hitSpots.length === 0 && (
            <div style={{ fontSize: 12, color: T.textMuted, padding: '4px 0' }}>
              No 67s in this corridor. Inflate the radius to catch some.
            </div>
          )}
        </div>

        <button onClick={() => onStart(hitSpots)} disabled={hitSpots.length === 0} style={{
          marginTop: 12, width: '100%', height: 50, borderRadius: 14,
          background: hitSpots.length === 0 ? T.border : T.primary,
          color: '#fff', border: 'none', cursor: hitSpots.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: 15, fontWeight: 800, letterSpacing: 0.3,
          fontFamily: window.TOKENS.fontBody,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: hitSpots.length === 0 ? 'none' : `0 8px 24px ${T.primary}55`,
        }}>
          {Icon.nav('#fff')} Start this hunt · {hitSpots.length} stop{hitSpots.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

function PlacePicker({ theme, role, place, picking, onOpen }) {
  const T = theme;
  const isStart = role === 'start';
  return (
    <div onClick={onOpen} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
      borderRadius: 10, cursor: 'pointer',
      background: picking ? T.primaryTint : 'transparent',
      border: picking ? `1px solid ${T.primary}` : '1px solid transparent',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: isStart ? T.primary : T.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', flexShrink: 0, position: 'relative',
      }}>
        {isStart ? (
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff'}}/>
        ) : (
          <svg width="16" height="20" viewBox="0 0 16 20"><path d="M8 20s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" fill="#fff"/><circle cx="8" cy="8" r="3" fill={T.text}/></svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: T.textFaint, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {isStart ? 'From' : 'To'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.2, marginTop: 1 }}>
          {place?.name || 'Pick a place'}
        </div>
      </div>
      {Icon.chevR(T.textFaint)}
    </div>
  );
}

function RadiusSlider({ value, onChange, theme }) {
  const T = theme;
  const trackRef = React.useRef(null);
  const MIN = 0.2, MAX = 3;
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  const onDown = (e) => {
    const move = (ev) => {
      if (!trackRef.current) return;
      const r = trackRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const v = MIN + p * (MAX - MIN);
      onChange(Math.round(v * 10) / 10);
    };
    move(e);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div ref={trackRef} onPointerDown={onDown} style={{
      position: 'relative', marginTop: 12, height: 32, cursor: 'ew-resize',
    }}>
      {/* ticks */}
      <div style={{ position: 'absolute', inset: '10px 0', borderRadius: 6, background: T.surfaceAlt, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
          background: `linear-gradient(90deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
        }}/>
        {[0.25, 0.5, 0.75].map((p) => (
          <div key={p} style={{
            position: 'absolute', left: `${p * 100}%`, top: 3, bottom: 3, width: 1,
            background: T.border,
          }}/>
        ))}
      </div>
      {/* thumb */}
      <div style={{
        position: 'absolute', left: `calc(${pct}% - 14px)`, top: 1, width: 28, height: 28,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 0 3px ' + T.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color: T.text,
      }}>{value.toFixed(1)}</div>
    </div>
  );
}

function FilterChip({ theme, active, onClick, children }) {
  const T = theme;
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
      background: active ? T.text : T.surface,
      color: active ? T.surface : T.textMuted,
      border: `1px solid ${active ? T.text : T.border}`,
      fontSize: 11, fontWeight: 800, letterSpacing: 0.2,
      fontFamily: window.TOKENS.fontBody,
    }}>{children}</button>
  );
}

function StatCell({ theme, label, value, accent }) {
  const T = theme;
  return (
    <div style={{ flex: 1, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 16, color: accent ? T.primary : T.text, letterSpacing: -0.3, marginTop: 2 }}>{value}</div>
    </div>
  );
}
const Divider = ({ T }) => <div style={{ width: 1, background: T.border, margin: '8px 0' }}/>;

// ─────────────────────────────────────────────────────────────
// PLAN MAP — renders the stylized map + corridor ribbon + start/end pins
// ─────────────────────────────────────────────────────────────
function PlanMap({ theme, spots, start, end, radiusKm, hits, dark }) {
  const T = theme;
  const W = 800, H = 1000;
  const normRadius = (radiusKm / 4) * W;
  const hitIds = new Set(hits.map((h) => h.id));

  if (!start || !end) return <window.MapNUS theme={T} spots={spots} route={[]} showRoute={false} showRadius={false} showNumbers={false} dark={dark}/>;

  const sx = start.x * W, sy = start.y * H;
  const ex = end.x * W,   ey = end.y * H;
  // Perpendicular vector (unit)
  const dx = ex - sx, dy = ey - sy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  // Corridor quad corners
  const p1x = sx + nx * normRadius, p1y = sy + ny * normRadius;
  const p2x = ex + nx * normRadius, p2y = ey + ny * normRadius;
  const p3x = ex - nx * normRadius, p3y = ey - ny * normRadius;
  const p4x = sx - nx * normRadius, p4y = sy - ny * normRadius;
  // End caps (rounded)
  const corridorPath = `
    M ${p1x} ${p1y}
    L ${p2x} ${p2y}
    A ${normRadius} ${normRadius} 0 0 1 ${p3x} ${p3y}
    L ${p4x} ${p4y}
    A ${normRadius} ${normRadius} 0 0 1 ${p1x} ${p1y}
    Z
  `;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="planGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={T.border} strokeOpacity="0.25" strokeWidth="0.5"/>
        </pattern>
        <filter id="planShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25"/>
        </filter>
      </defs>
      {/* land */}
      <rect width={W} height={H} fill={T.mapLand}/>
      <rect width={W} height={H} fill="url(#planGrid)"/>
      {/* water + park (reuse shapes) */}
      <path d={`M 0 820 Q 120 790 220 810 T 420 830 Q 460 870 420 920 L 420 ${H} L 0 ${H} Z`} fill={T.mapWater}/>
      <path d={`M 680 0 Q 740 40 760 100 Q 780 150 760 200 Q 740 240 700 230 Q 720 120 680 60 Z`} fill={T.mapWater}/>
      <path d={`M 240 560 Q 280 520 360 540 Q 430 560 470 620 Q 480 700 420 720 Q 320 730 260 680 Q 220 620 240 560 Z`} fill={T.mapPark}/>
      <path d={`M 540 120 Q 620 100 680 140 Q 700 200 640 240 Q 560 240 540 180 Z`} fill={T.mapPark}/>

      {/* faint road grid */}
      <g stroke={T.mapRoadMajor} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M 0 600 Q 200 580 400 590 T 800 600"/>
        <path d="M 100 0 Q 130 300 200 500 T 260 1000"/>
        <path d="M 500 0 L 520 400 Q 530 500 580 600 L 620 1000"/>
      </g>

      {/* CORRIDOR */}
      <path d={corridorPath} fill={T.primary} fillOpacity="0.13" stroke={T.primary} strokeOpacity="0.4" strokeWidth="2" strokeDasharray="8 6"/>

      {/* centerline route */}
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={T.primary} strokeOpacity="0.2" strokeWidth="16" strokeLinecap="round"/>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={T.primary} strokeWidth="5" strokeLinecap="round"/>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#fff" strokeOpacity="0.75" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round"/>
      </g>

      {/* spot markers — dimmed if not in corridor */}
      {spots.map((s) => {
        const cx = s.x * W, cy = s.y * H;
        const inHit = hitIds.has(s.id);
        const rc = window.TOKENS.rarity[s.rarity].color;
        const size = inHit ? (s.rarity === 'legendary' ? 30 : 26) : 18;
        return (
          <g key={s.id} transform={`translate(${cx} ${cy})`} opacity={inHit ? 1 : 0.3}>
            <path
              d={`M 0 ${-size * 0.15} C ${-size * 0.9} ${-size * 0.15} ${-size * 0.9} ${-size * 1.6} 0 ${-size * 1.6} C ${size * 0.9} ${-size * 1.6} ${size * 0.9} ${-size * 0.15} 0 ${-size * 0.15} Z`}
              fill={rc} filter={inHit ? 'url(#planShadow)' : 'none'}
            />
            <circle cx="0" cy={-size * 0.9} r={size * 0.55} fill="#fff"/>
            <text x="0" y={-size * 0.9 + size * 0.18} textAnchor="middle" fontSize={size * 0.85}>{s.emoji}</text>
          </g>
        );
      })}

      {/* route numbers on hit spots in traversal order */}
      {hits.map((s, i) => {
        const cx = s.x * W, cy = s.y * H;
        return (
          <g key={`num-${s.id}`} transform={`translate(${cx + 18} ${cy - 44})`}>
            <circle r="12" fill={T.primary} stroke="#fff" strokeWidth="2.5"/>
            <text y="4.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily={window.TOKENS.fontBody}>{i + 1}</text>
          </g>
        );
      })}

      {/* START pin */}
      <g transform={`translate(${sx} ${sy})`}>
        <circle r="24" fill={T.primary} fillOpacity="0.15"/>
        <circle r="14" fill={T.primary} stroke="#fff" strokeWidth="4"/>
        <text y={-22} textAnchor="middle" fontSize="13" fontWeight="900" fill={T.text} fontFamily={window.TOKENS.fontBody}>A · START</text>
      </g>
      {/* END pin */}
      <g transform={`translate(${ex} ${ey - 8})`}>
        <path d={`M 0 8 C -22 8 -22 -26 0 -26 C 22 -26 22 8 0 8 Z`} fill={T.text} filter="url(#planShadow)"/>
        <circle cx="0" cy="-11" r="7" fill="#fff"/>
        <text y="-7" textAnchor="middle" fontSize="10" fontWeight="900" fill={T.text} fontFamily={window.TOKENS.fontBody}>B</text>
        <text y={18} textAnchor="middle" fontSize="13" fontWeight="900" fill={T.text} fontFamily={window.TOKENS.fontBody}>END</text>
      </g>
    </svg>
  );
}

Object.assign(window, { PlanRouteScreen, RadiusSlider, FilterChip, StatCell });
