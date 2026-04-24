/* global React, Icon, Pill, RarityChip */
// Radius-hunt mode: user stands in one place, we sweep a circle around them
// and plot a loop through every 67 inside. The bigger the radius, the more spots.

function RadiusHuntScreen({ theme, onCancel, onStart }) {
  const T = theme;
  const [radiusKm, setRadiusKm] = React.useState(2.0);
  const [includeLegendary, setIncludeLegendary] = React.useState(true);
  const [avoid, setAvoid] = React.useState('none'); // 'none' | 'common'
  const [optimize, setOptimize] = React.useState('loop'); // 'loop' | 'oneway' | 'greedy'

  const spots = window.SPOTS;
  const me = { x: 0.40, y: 0.50 }; // user's position on the normalized map

  // Map is ~4km wide; radius in normalized space
  const normRadius = radiusKm / 4;

  const inCircle = React.useMemo(() => {
    const out = [];
    for (const s of spots) {
      if (!includeLegendary && s.rarity === 'legendary') continue;
      if (avoid === 'common' && s.rarity === 'common') continue;
      const d = Math.hypot(s.x - me.x, s.y - me.y);
      if (d <= normRadius) out.push({ ...s, d });
    }
    // sort by angle to form a nice sweep
    out.sort((a, b) => Math.atan2(a.y - me.y, a.x - me.x) - Math.atan2(b.y - me.y, b.x - me.x));
    return out;
  }, [normRadius, includeLegendary, avoid]);

  // Rough loop length: sum of nearest-neighbor hops (already angle-sorted ≈ TSP heuristic)
  const loopKm = React.useMemo(() => {
    if (inCircle.length === 0) return 0;
    let total = Math.hypot(inCircle[0].x - me.x, inCircle[0].y - me.y) * 4;
    for (let i = 0; i < inCircle.length - 1; i++) {
      total += Math.hypot(inCircle[i + 1].x - inCircle[i].x, inCircle[i + 1].y - inCircle[i].y) * 4;
    }
    if (optimize === 'loop') {
      total += Math.hypot(inCircle[inCircle.length - 1].x - me.x, inCircle[inCircle.length - 1].y - me.y) * 4;
    }
    return total;
  }, [inCircle, optimize]);

  const walkMin = Math.round(loopKm * 12);
  const xpTotal = inCircle.reduce((a, s) => a + (s.rarity === 'legendary' ? 500 : s.rarity === 'rare' ? 150 : 50), 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: T.bg }}>
      {/* MAP */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <RadiusMap theme={T} spots={spots} me={me} radiusKm={radiusKm} hits={inCircle} optimize={optimize}/>
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
            67 Lockdown
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Lock a radius around you · sweep every 67 inside</div>
        </div>
        <div style={{
          background: '#FF3D8A', color: '#fff', padding: '5px 10px', borderRadius: 999,
          fontSize: 10, fontWeight: 900, letterSpacing: 0.5, whiteSpace: 'nowrap', flexShrink: 0,
        }}>RADIUS MODE</div>
      </div>

      {/* BOTTOM SHEET */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10,
        background: T.surface, borderRadius: '22px 22px 0 0',
        padding: '10px 14px 16px',
        boxShadow: '0 -10px 40px rgba(10,58,31,0.15)',
        maxHeight: '62%', overflowY: 'auto',
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: T.border, margin: '0 auto 10px' }}/>

        {/* radius + count */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' }}>Hunt radius</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: T.text, letterSpacing: -0.6, lineHeight: 1 }}>
                {radiusKm.toFixed(1)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>KM</span>
              <span style={{ fontSize: 11, color: T.textFaint, marginLeft: 4 }}>around you</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textFaint, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>67s locked</div>
            <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 30, color: T.primary, letterSpacing: -0.6, lineHeight: 1, marginTop: 2 }}>
              {inCircle.length}
            </div>
          </div>
        </div>

        <window.RadiusSlider value={radiusKm} onChange={setRadiusKm} theme={T}/>

        {/* preset chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[
            { v: 0.5, label: 'Micro' },
            { v: 1.0, label: 'Block' },
            { v: 2.0, label: 'District' },
            { v: 3.0, label: 'Island' },
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

        {/* optimize strategy */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: T.textFaint, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>Routing</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'loop', label: 'Return loop', sub: 'back to start' },
              { id: 'oneway', label: 'One-way', sub: 'end anywhere' },
              { id: 'greedy', label: 'Greedy', sub: 'nearest first' },
            ].map((o) => {
              const active = optimize === o.id;
              return (
                <button key={o.id} onClick={() => setOptimize(o.id)} style={{
                  flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
                  background: active ? T.primary : T.surfaceAlt,
                  color: active ? '#fff' : T.text,
                  border: 'none', fontFamily: window.TOKENS.fontBody, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.2 }}>{o.label}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.75, marginTop: 1 }}>{o.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* rarity filter */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <window.FilterChip theme={T} active={includeLegendary} onClick={() => setIncludeLegendary(!includeLegendary)}>
            ★ Legendaries
          </window.FilterChip>
          <window.FilterChip theme={T} active={avoid !== 'common'} onClick={() => setAvoid(avoid === 'common' ? 'none' : 'common')}>
            Skip commons
          </window.FilterChip>
        </div>

        {/* stat strip */}
        <div style={{
          marginTop: 12, display: 'flex',
          background: T.surfaceAlt, borderRadius: 12, overflow: 'hidden',
        }}>
          <window.StatCell theme={T} label="Loop" value={`${loopKm.toFixed(1)} km`}/>
          <div style={{ width: 1, background: T.border, margin: '8px 0' }}/>
          <window.StatCell theme={T} label="Walk" value={`${walkMin} min`}/>
          <div style={{ width: 1, background: T.border, margin: '8px 0' }}/>
          <window.StatCell theme={T} label="Stops" value={`${inCircle.length}`}/>
          <div style={{ width: 1, background: T.border, margin: '8px 0' }}/>
          <window.StatCell theme={T} label="XP" value={`+${xpTotal}`} accent/>
        </div>

        {/* order chips */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {inCircle.slice(0, 5).map((s, i) => (
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
          {inCircle.length > 5 && (
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>+{inCircle.length - 5} more</div>
          )}
          {inCircle.length === 0 && (
            <div style={{ fontSize: 12, color: T.textMuted, padding: '4px 0' }}>
              No 67s in this radius. Zoom out, champ.
            </div>
          )}
        </div>

        <button onClick={() => onStart(inCircle)} disabled={inCircle.length === 0} style={{
          marginTop: 12, width: '100%', height: 50, borderRadius: 14,
          background: inCircle.length === 0 ? T.border : '#FF3D8A',
          color: '#fff', border: 'none', cursor: inCircle.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: 15, fontWeight: 800, letterSpacing: 0.3,
          fontFamily: window.TOKENS.fontBody,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: inCircle.length === 0 ? 'none' : `0 8px 24px #FF3D8A55`,
        }}>
          {Icon.nav('#fff')} Start lockdown · {inCircle.length} stop{inCircle.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

function RadiusMap({ theme, spots, me, radiusKm, hits, optimize }) {
  const T = theme;
  const W = 800, H = 1000;
  const normRadius = (radiusKm / 4) * W;
  const hitIds = new Set(hits.map((h) => h.id));
  const mx = me.x * W, my = me.y * H;

  // build path points in order
  const orderedPts = hits.map((s) => ({ x: s.x * W, y: s.y * H }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="radGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={T.border} strokeOpacity="0.25" strokeWidth="0.5"/>
        </pattern>
        <radialGradient id="radiusGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF3D8A" stopOpacity="0.05"/>
          <stop offset="70%" stopColor="#FF3D8A" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#FF3D8A" stopOpacity="0.3"/>
        </radialGradient>
        <filter id="radShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25"/>
        </filter>
      </defs>
      <rect width={W} height={H} fill={T.mapLand}/>
      <rect width={W} height={H} fill="url(#radGrid)"/>
      <path d={`M 0 820 Q 120 790 220 810 T 420 830 Q 460 870 420 920 L 420 ${H} L 0 ${H} Z`} fill={T.mapWater}/>
      <path d={`M 680 0 Q 740 40 760 100 Q 780 150 760 200 Q 740 240 700 230 Q 720 120 680 60 Z`} fill={T.mapWater}/>
      <path d={`M 240 560 Q 280 520 360 540 Q 430 560 470 620 Q 480 700 420 720 Q 320 730 260 680 Q 220 620 240 560 Z`} fill={T.mapPark}/>
      <path d={`M 540 120 Q 620 100 680 140 Q 700 200 640 240 Q 560 240 540 180 Z`} fill={T.mapPark}/>

      <g stroke={T.mapRoadMajor} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M 0 600 Q 200 580 400 590 T 800 600"/>
        <path d="M 100 0 Q 130 300 200 500 T 260 1000"/>
        <path d="M 500 0 L 520 400 Q 530 500 580 600 L 620 1000"/>
      </g>

      {/* RADIUS CIRCLE */}
      <circle cx={mx} cy={my} r={normRadius} fill="url(#radiusGlow)" stroke="#FF3D8A" strokeOpacity="0.6" strokeWidth="2.5" strokeDasharray="10 6"/>
      {/* radius label */}
      <g transform={`translate(${mx + normRadius * 0.707} ${my - normRadius * 0.707})`}>
        <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#FF3D8A"/>
        <text y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff" fontFamily={window.TOKENS.fontBody}>{radiusKm.toFixed(1)}km</text>
      </g>

      {/* LOOP PATH */}
      {orderedPts.length > 0 && (
        <g>
          {/* path: me → pt0 → pt1 → ... → (me if loop) */}
          <path
            d={(() => {
              let d = `M ${mx} ${my} L ${orderedPts[0].x} ${orderedPts[0].y}`;
              for (let i = 1; i < orderedPts.length; i++) {
                d += ` L ${orderedPts[i].x} ${orderedPts[i].y}`;
              }
              if (optimize === 'loop') d += ` L ${mx} ${my}`;
              return d;
            })()}
            fill="none" stroke="#FF3D8A" strokeOpacity="0.2" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d={(() => {
              let d = `M ${mx} ${my} L ${orderedPts[0].x} ${orderedPts[0].y}`;
              for (let i = 1; i < orderedPts.length; i++) {
                d += ` L ${orderedPts[i].x} ${orderedPts[i].y}`;
              }
              if (optimize === 'loop') d += ` L ${mx} ${my}`;
              return d;
            })()}
            fill="none" stroke="#FF3D8A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d={(() => {
              let d = `M ${mx} ${my} L ${orderedPts[0].x} ${orderedPts[0].y}`;
              for (let i = 1; i < orderedPts.length; i++) {
                d += ` L ${orderedPts[i].x} ${orderedPts[i].y}`;
              }
              if (optimize === 'loop') d += ` L ${mx} ${my}`;
              return d;
            })()}
            fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round"
          />
        </g>
      )}

      {/* spot markers */}
      {spots.map((s) => {
        const cx = s.x * W, cy = s.y * H;
        const inHit = hitIds.has(s.id);
        const rc = window.TOKENS.rarity[s.rarity].color;
        const size = inHit ? (s.rarity === 'legendary' ? 30 : 26) : 18;
        return (
          <g key={s.id} transform={`translate(${cx} ${cy})`} opacity={inHit ? 1 : 0.28}>
            <path
              d={`M 0 ${-size * 0.15} C ${-size * 0.9} ${-size * 0.15} ${-size * 0.9} ${-size * 1.6} 0 ${-size * 1.6} C ${size * 0.9} ${-size * 1.6} ${size * 0.9} ${-size * 0.15} 0 ${-size * 0.15} Z`}
              fill={rc} filter={inHit ? 'url(#radShadow)' : 'none'}
            />
            <circle cx="0" cy={-size * 0.9} r={size * 0.55} fill="#fff"/>
            <text x="0" y={-size * 0.9 + size * 0.18} textAnchor="middle" fontSize={size * 0.85}>{s.emoji}</text>
          </g>
        );
      })}

      {/* route numbers */}
      {hits.map((s, i) => {
        const cx = s.x * W, cy = s.y * H;
        return (
          <g key={`num-${s.id}`} transform={`translate(${cx + 18} ${cy - 44})`}>
            <circle r="12" fill="#FF3D8A" stroke="#fff" strokeWidth="2.5"/>
            <text y="4.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily={window.TOKENS.fontBody}>{i + 1}</text>
          </g>
        );
      })}

      {/* ME pin */}
      <g transform={`translate(${mx} ${my})`}>
        <circle r="30" fill="#2A7FFF" fillOpacity="0.15">
          <animate attributeName="r" values="30;44;30" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="fill-opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="16" fill="#2A7FFF" stroke="#fff" strokeWidth="4"/>
        <circle r="6" fill="#fff"/>
        <text y={-28} textAnchor="middle" fontSize="12" fontWeight="900" fill={T.text} fontFamily={window.TOKENS.fontBody}>YOU ARE HERE</text>
      </g>
    </svg>
  );
}

// Export helpers that were local to plan.jsx so this file can share them
Object.assign(window, { RadiusHuntScreen, RadiusMap });
