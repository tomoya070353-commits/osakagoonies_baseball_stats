"use client";

import type { PlayerStats } from "@/types";

const toRad = (d: number) => (d * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.cos(toRad(deg)),
  y: cy + r * Math.sin(toRad(deg)),
});

function sector(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const s = pt(cx, cy, r, a1);
  const e = pt(cx, cy, r, a2);
  return `M${cx},${cy} L${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 0,1 ${e.x.toFixed(2)},${e.y.toFixed(2)} Z`;
}

function annularSector(
  cx: number, cy: number,
  rInner: number, rOuter: number,
  a1: number, a2: number
): string {
  const s1 = pt(cx, cy, rInner, a1);
  const e1 = pt(cx, cy, rInner, a2);
  const s2 = pt(cx, cy, rOuter, a1);
  const e2 = pt(cx, cy, rOuter, a2);
  return (
    `M${s1.x.toFixed(2)},${s1.y.toFixed(2)} ` +
    `A${rInner},${rInner} 0 0,1 ${e1.x.toFixed(2)},${e1.y.toFixed(2)} ` +
    `L${e2.x.toFixed(2)},${e2.y.toFixed(2)} ` +
    `A${rOuter},${rOuter} 0 0,0 ${s2.x.toFixed(2)},${s2.y.toFixed(2)} Z`
  );
}

export default function DirectionChart({ player }: { player: PlayerStats }) {
  const { pullHits, centerHits, oppositeHits } = player;
  const total = pullHits + centerHits + oppositeHits;
  const pullRate    = total > 0 ? pullHits    / total : 0;
  const centerRate  = total > 0 ? centerHits  / total : 0;
  const oppositeRate = total > 0 ? oppositeHits / total : 0;

  // SVG layout
  const cx = 140, cy = 212;
  const rOut = 168; // outfield wall radius
  const rInfield = 60; // infield circle radius

  // Field opens from 218° (3B foul line) to 322° (1B foul line) — 104° total
  // Split into 3 zones: Pull (left), Center, Opposite (right)
  const A_LEFT_FOUL   = 218;
  const A_LC_BOUNDARY = 252;
  const A_CR_BOUNDARY = 288;
  const A_RIGHT_FOUL  = 322;

  // 緑系統（rate高=濃い緑、rate低=薄い緑）
  const zoneGreen = (rate: number) => {
    // rate 0→#4ade80(薄緑)  rate 1→#14532d(濃緑)
    const h = 142;
    const s = 55 + rate * 30;          // 55〜85%
    const l = 65 - rate * 40;          // 65〜25%
    return `hsl(${h},${s.toFixed()}%,${l.toFixed()}%)`;
  };

  const ZONES = [
    { label: "レフト",   rate: pullRate,     count: pullHits,     a1: A_LEFT_FOUL,   a2: A_LC_BOUNDARY },
    { label: "センター", rate: centerRate,   count: centerHits,   a1: A_LC_BOUNDARY, a2: A_CR_BOUNDARY },
    { label: "ライト",   rate: oppositeRate, count: oppositeHits, a1: A_CR_BOUNDARY, a2: A_RIGHT_FOUL  },
  ];

  // ゾーンカラー（各ゾーンの率に応じた緑色）
  const zoneColors = ZONES.map(z => zoneGreen(z.rate));

  // Foul poles
  const leftPole  = pt(cx, cy, rOut, A_LEFT_FOUL);
  const rightPole = pt(cx, cy, rOut, A_RIGHT_FOUL);

  // Diamond bases
  const baseR = 48;
  const home   = { x: cx, y: cy };
  const first  = pt(cx, cy, baseR, 313);
  const second = pt(cx, cy, 60, 270);
  const third  = pt(cx, cy, baseR, 227);
  const pitcher = pt(cx, cy, 36, 270);

  // Zone label positions (mid-angle, ~60% radius)
  const labelR = 115;
  const lp = [
    pt(cx, cy, labelR, (A_LEFT_FOUL   + A_LC_BOUNDARY) / 2),
    pt(cx, cy, labelR, (A_LC_BOUNDARY + A_CR_BOUNDARY) / 2),
    pt(cx, cy, labelR, (A_CR_BOUNDARY + A_RIGHT_FOUL)  / 2),
  ];

  const BASE_SIZE = 7;

  return (
    <div>
      <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">打球方向</h2>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
        <svg viewBox="0 0 280 210" className="w-full">
          {/* Sky background */}
          <rect width="280" height="210" fill="#0c1a12" rx="8" />

          {/* Outfield base (dark grass fan) */}
          <path
            d={`M${cx},${cy} L${leftPole.x.toFixed(1)},${leftPole.y.toFixed(1)} A${rOut},${rOut} 0 0,1 ${rightPole.x.toFixed(1)},${rightPole.y.toFixed(1)} Z`}
            fill="#162b1c"
          />

          {/* Zone color overlays (outer portion = outfield zone) */}
          {ZONES.map((z, i) => (
            <path
              key={z.label}
              d={annularSector(cx, cy, rInfield + 4, rOut, z.a1, z.a2)}
              fill={zoneColors[i]}
              fillOpacity={0.15 + z.rate * 0.80}
            />
          ))}

          {/* Infield dirt circle */}
          <circle cx={cx} cy={cy} r={rInfield + 4} fill="#251a10" />

          {/* Infield grass */}
          <circle cx={cx} cy={cy} r={rInfield} fill="#1c3824" />

          {/* Foul lines */}
          <line x1={cx} y1={cy} x2={leftPole.x.toFixed(1)}  y2={leftPole.y.toFixed(1)}  stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <line x1={cx} y1={cy} x2={rightPole.x.toFixed(1)} y2={rightPole.y.toFixed(1)} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

          {/* Outfield wall arc */}
          <path
            d={`M${leftPole.x.toFixed(1)},${leftPole.y.toFixed(1)} A${rOut},${rOut} 0 0,1 ${rightPole.x.toFixed(1)},${rightPole.y.toFixed(1)}`}
            fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="2"
          />

          {/* Zone dividers (dashed) */}
          {[A_LC_BOUNDARY, A_CR_BOUNDARY].map((deg) => {
            const p = pt(cx, cy, rOut, deg);
            return (
              <line
                key={deg}
                x1={cx} y1={cy}
                x2={p.x.toFixed(1)} y2={p.y.toFixed(1)}
                stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="5,4"
              />
            );
          })}

          {/* Infield dirt ring (between infield and outfield) */}
          <path
            d={`M${cx},${cy - rInfield} A${rInfield},${rInfield} 0 1,1 ${cx - 0.01},${cy - rInfield}`}
            fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
          />

          {/* Infield arc (light line matching infield boundary) */}
          <path
            d={sector(cx, cy, rInfield + 4, A_LEFT_FOUL, A_RIGHT_FOUL)}
            fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0"
          />

          {/* Pitcher mound */}
          <circle
            cx={pitcher.x.toFixed(1)} cy={pitcher.y.toFixed(1)} r="5"
            fill="#2e2316" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6"
          />

          {/* Diamond base lines */}
          <polygon
            points={`${home.x},${home.y} ${first.x.toFixed(1)},${first.y.toFixed(1)} ${second.x.toFixed(1)},${second.y.toFixed(1)} ${third.x.toFixed(1)},${third.y.toFixed(1)}`}
            fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1"
          />

          {/* Bases */}
          {[first, second, third].map((b, i) => (
            <rect
              key={i}
              x={(b.x - BASE_SIZE / 2).toFixed(1)}
              y={(b.y - BASE_SIZE / 2).toFixed(1)}
              width={BASE_SIZE} height={BASE_SIZE}
              fill="#e2e8f0" rx="1.5"
              transform={`rotate(45,${b.x.toFixed(1)},${b.y.toFixed(1)})`}
            />
          ))}

          {/* Home plate */}
          <polygon
            points={`${home.x},${home.y - 6} ${home.x + 5},${home.y - 2} ${home.x + 5},${home.y + 4} ${home.x - 5},${home.y + 4} ${home.x - 5},${home.y - 2}`}
            fill="#e2e8f0"
          />

          {/* Zone labels */}
          {ZONES.map((z, i) => (
            <g key={z.label}>
              <text
                x={lp[i].x.toFixed(1)}
                y={(lp[i].y - 7).toFixed(1)}
                textAnchor="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="8"
                fontFamily="sans-serif"
              >
                {z.label}
              </text>
              <text
                x={lp[i].x.toFixed(1)}
                y={(lp[i].y + 5).toFixed(1)}
                textAnchor="middle"
                fill={zoneColors[i]}
                fontSize="12"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {total > 0 ? `${(z.rate * 100).toFixed(0)}%` : "—"}
              </text>
            </g>
          ))}
        </svg>

        {/* Counts legend */}
        {total > 0 ? (
          <div className="flex justify-between px-1 mt-1">
            {ZONES.map((z, i) => (
              <div key={z.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zoneColors[i] }} />
                <span className="text-white/40 text-[10px]">{z.label} {z.count}本</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/30 text-xs mt-2">打球方向データなし</p>
        )}
      </div>
    </div>
  );
}
