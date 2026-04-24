/* global React */
// Stylized map of NUS / Kent Ridge area.
// Hand-authored SVG — no tiles. Uses theme tokens.
// Renders: background, water, parks, campus blocks, road network, radius circle,
// route polyline, and spot markers. Interactive: tap a marker to select.

function MapNUS({
  theme,
  spots = [],
  selectedId = null,
  onSelect = () => {},
  route = [],            // ordered spot ids
  showRoute = true,
  showRadius = true,
  showNumbers = true,
  showHeatmap = false,
  userPos = { x: 0.40, y: 0.50 },
  radiusKm = 2,
  dark = false,
  zoom = 1,
}) {
  const W = 800, H = 1000;
  const T = theme;
  // 2km radius — normalized to our pretend-grid. Full map width ~= 4km, so radius = ~0.25 of width.
  const radiusPx = (radiusKm / 4) * W * zoom;

  const spotAt = (id) => spots.find((s) => s.id === id);
  const toX = (nx) => nx * W;
  const toY = (ny) => ny * H;

  const routePoints = route
    .map((id) => spotAt(id))
    .filter(Boolean)
    .map((s) => [toX(s.x), toY(s.y)]);

  // Close the loop back to start so users see a loop
  const routePath = routePoints.length
    ? [
        `M ${toX(userPos.x)} ${toY(userPos.y)}`,
        ...routePoints.map((p) => `L ${p[0]} ${p[1]}`),
        `L ${toX(userPos.x)} ${toY(userPos.y)}`,
      ].join(' ')
    : '';

  const rarityColor = (r) => window.TOKENS.rarity[r].color;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={T.border} strokeOpacity="0.25" strokeWidth="0.5"/>
        </pattern>
        <radialGradient id="heatGlow">
          <stop offset="0%"  stopColor="#FF3D8A" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#FF3D8A" stopOpacity="0"/>
        </radialGradient>
        <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25"/>
        </filter>
        <filter id="legendaryGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* LAND */}
      <rect width={W} height={H} fill={T.mapLand}/>
      <rect width={W} height={H} fill="url(#mapGrid)"/>

      {/* WATER — Pandan Reservoir-ish shape bottom-left & coast top */}
      <path
        d={`M 0 820 Q 120 790 220 810 T 420 830 Q 460 870 420 920 L 420 ${H} L 0 ${H} Z`}
        fill={T.mapWater}
      />
      <path
        d={`M 680 0 Q 740 40 760 100 Q 780 150 760 200 Q 740 240 700 230 Q 720 120 680 60 Z`}
        fill={T.mapWater}
      />

      {/* PARKS — Kent Ridge Park area */}
      <path d={`M 240 560 Q 280 520 360 540 Q 430 560 470 620 Q 480 700 420 720 Q 320 730 260 680 Q 220 620 240 560 Z`} fill={T.mapPark}/>
      <path d={`M 60 260 Q 100 230 180 240 Q 240 260 250 320 Q 240 380 180 380 Q 100 380 70 340 Z`} fill={T.mapPark}/>
      <path d={`M 540 120 Q 620 100 680 140 Q 700 200 640 240 Q 560 240 540 180 Z`} fill={T.mapPark}/>

      {/* CAMPUS BLOCKS (buildings) */}
      {[
        [300, 380, 60, 40], [370, 380, 50, 45], [430, 380, 70, 38],
        [320, 430, 48, 36], [380, 430, 56, 40], [448, 430, 52, 42],
        [352, 470, 44, 32], [404, 470, 42, 34], [456, 468, 46, 40],
        [290, 445, 24, 20], [260, 400, 22, 24], [510, 400, 28, 28],
        [510, 440, 32, 34], [360, 510, 50, 30], [416, 510, 48, 30],
        [480, 490, 36, 40], [420, 560, 52, 30], [484, 560, 46, 30],
        [480, 250, 36, 30], [524, 258, 38, 30], [468, 300, 44, 34],
        [520, 300, 40, 30], [580, 300, 48, 32],
        [200, 500, 40, 30], [246, 510, 34, 24], [150, 460, 30, 30],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={T.mapBuilding}/>
      ))}

      {/* ROADS */}
      {/* Major roads */}
      <g stroke={T.mapRoadMajor} strokeWidth="14" fill="none" strokeLinecap="round">
        <path d="M 0 600 Q 200 580 400 590 T 800 600"/>
        <path d="M 100 0 Q 130 300 200 500 T 260 1000"/>
        <path d="M 500 0 L 520 400 Q 530 500 580 600 L 620 1000"/>
        <path d="M 0 300 L 800 260"/>
      </g>
      <g stroke="#C8D7CB" strokeWidth="14.8" fill="none" strokeLinecap="round" strokeOpacity={dark ? 0.15 : 0}>
        <path d="M 0 600 Q 200 580 400 590 T 800 600"/>
        <path d="M 100 0 Q 130 300 200 500 T 260 1000"/>
      </g>
      {/* Minor roads */}
      <g stroke={T.mapRoad} strokeWidth="6" fill="none" strokeLinecap="round">
        <path d="M 250 400 L 580 420"/>
        <path d="M 280 450 L 560 470"/>
        <path d="M 310 500 L 540 510"/>
        <path d="M 350 380 L 340 560"/>
        <path d="M 430 360 L 440 580"/>
        <path d="M 160 260 L 160 500"/>
        <path d="M 480 200 L 660 230"/>
        <path d="M 120 700 L 500 720"/>
        <path d="M 580 380 L 680 760"/>
      </g>

      {/* ROAD LABELS */}
      <g fontFamily={window.TOKENS.fontBody} fontSize="11" fill={T.mapLabel} fontWeight="500" letterSpacing="0.5">
        <text x="640" y="585" transform="rotate(-4, 640, 585)">CLEMENTI RD</text>
        <text x="215" y="375" transform="rotate(85, 215, 375)">PASIR PANJANG</text>
        <text x="530" y="390" transform="rotate(87, 530, 390)">LOWER KENT RIDGE</text>
        <text x="320" y="295" transform="rotate(-1, 320, 295)">AYE EXPRESSWAY</text>
        <text x="380" y="650" fontSize="13" fontWeight="600" fill={T.textMuted}>KENT RIDGE PARK</text>
        <text x="100" y="320" fontSize="12" fontWeight="600" fill={T.textMuted}>WEST COAST</text>
        <text x="550" y="180" fontSize="12" fontWeight="600" fill={T.textMuted}>SCIENCE PARK</text>
      </g>

      {/* HEATMAP blobs (density) */}
      {showHeatmap && spots.map((s) => (
        <circle key={`h-${s.id}`} cx={toX(s.x)} cy={toY(s.y)} r="80" fill="url(#heatGlow)"/>
      ))}

      {/* RADIUS CIRCLE */}
      {showRadius && (
        <g>
          <circle
            cx={toX(userPos.x)} cy={toY(userPos.y)} r={radiusPx}
            fill={T.primary} fillOpacity="0.06"
            stroke={T.radius} strokeOpacity="0.5" strokeWidth="2" strokeDasharray="6 6"
          />
          <text
            x={toX(userPos.x) + radiusPx * 0.7}
            y={toY(userPos.y) - radiusPx * 0.7 - 6}
            fontFamily={window.TOKENS.fontBody} fontSize="12" fontWeight="700"
            fill={T.primary} textAnchor="middle"
          >
            {radiusKm}km RADIUS
          </text>
        </g>
      )}

      {/* ROUTE */}
      {showRoute && routePath && (
        <g>
          <path d={routePath} fill="none" stroke={T.primary} strokeOpacity="0.18" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={routePath} fill="none" stroke={T.primary} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={routePath} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 8"/>
        </g>
      )}

      {/* SPOT MARKERS */}
      {spots.map((s) => {
        const cx = toX(s.x), cy = toY(s.y);
        const isSel = s.id === selectedId;
        const rc = rarityColor(s.rarity);
        const onRoute = route.includes(s.id);
        const routeIdx = onRoute ? route.indexOf(s.id) + 1 : null;
        const size = isSel ? 38 : s.rarity === 'legendary' ? 32 : s.rarity === 'rare' ? 28 : 24;
        return (
          <g key={s.id} transform={`translate(${cx} ${cy})`} style={{ cursor: 'pointer' }} onClick={() => onSelect(s.id)}>
            {s.rarity === 'legendary' && (
              <circle r={size + 10} fill={rc} fillOpacity="0.25" filter="url(#legendaryGlow)"/>
            )}
            {isSel && (
              <circle r={size + 12} fill="none" stroke={T.primary} strokeWidth="3" strokeDasharray="4 4" opacity="0.9">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
              </circle>
            )}
            {/* pin tear */}
            <path
              d={`M 0 ${-size * 0.15} C ${-size * 0.9} ${-size * 0.15} ${-size * 0.9} ${-size * 1.6} 0 ${-size * 1.6} C ${size * 0.9} ${-size * 1.6} ${size * 0.9} ${-size * 0.15} 0 ${-size * 0.15} Z`}
              fill={rc} filter="url(#pinShadow)"
            />
            <circle cx="0" cy={-size * 0.9} r={size * 0.55} fill="#fff"/>
            <text x="0" y={-size * 0.9 + size * 0.18} textAnchor="middle" fontSize={size * 0.85}>{s.emoji}</text>

            {/* route number pip */}
            {showNumbers && routeIdx !== null && (
              <g transform={`translate(${size * 0.7} ${-size * 1.7})`}>
                <circle r="11" fill={T.primary} stroke="#fff" strokeWidth="2"/>
                <text y="4" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily={window.TOKENS.fontBody}>
                  {routeIdx}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* USER POS */}
      <g transform={`translate(${toX(userPos.x)} ${toY(userPos.y)})`}>
        <circle r="26" fill={T.primary} fillOpacity="0.15">
          <animate attributeName="r" from="18" to="40" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="fill-opacity" from="0.25" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="10" fill="#fff" stroke={T.primary} strokeWidth="3"/>
        <circle r="5" fill={T.primary}/>
      </g>
    </svg>
  );
}

window.MapNUS = MapNUS;
