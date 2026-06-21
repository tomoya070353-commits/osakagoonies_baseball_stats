"use client";

import type { PlayerStats } from "@/types";
import { motion } from "framer-motion";

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
  const pullRate = total > 0 ? pullHits / total : 0;
  const centerRate = total > 0 ? centerHits / total : 0;
  const oppositeRate = total > 0 ? oppositeHits / total : 0;

  // SVG layout
  const cx = 140, cy = 212;
  const rOut = 168;
  const rInfield = 60;

  const A_LEFT_FOUL = 218;
  const A_LC_BOUNDARY = 252;
  const A_CR_BOUNDARY = 288;
  const A_RIGHT_FOUL = 322;

  // グリーン系グラデーション（rate高=濃い緑、rate低=薄い緑）
  const zoneNavy = (rate: number) => {
    const h = 142;
    const s = 50 + rate * 35;
    const l = 62 - rate * 38;
    return `hsl(${h},${s.toFixed()}%,${l.toFixed()}%)`;
  };

  const ZONES = [
    { label: "レフト", rate: pullRate, count: pullHits, a1: A_LEFT_FOUL, a2: A_LC_BOUNDARY },
    { label: "センター", rate: centerRate, count: centerHits, a1: A_LC_BOUNDARY, a2: A_CR_BOUNDARY },
    { label: "ライト", rate: oppositeRate, count: oppositeHits, a1: A_CR_BOUNDARY, a2: A_RIGHT_FOUL },
  ];

  const zoneColors = ZONES.map(z => zoneNavy(z.rate));

  const leftPole = pt(cx, cy, rOut, A_LEFT_FOUL);
  const rightPole = pt(cx, cy, rOut, A_RIGHT_FOUL);

  const baseR = 48;
  const home = { x: cx, y: cy };
  const first = pt(cx, cy, baseR, 313);
  const second = pt(cx, cy, 60, 270);
  const third = pt(cx, cy, baseR, 227);
  const pitcher = pt(cx, cy, 36, 270);

  const labelR = 115;
  const lp = [
    pt(cx, cy, labelR, (A_LEFT_FOUL + A_LC_BOUNDARY) / 2),
    pt(cx, cy, labelR, (A_LC_BOUNDARY + A_CR_BOUNDARY) / 2),
    pt(cx, cy, labelR, (A_CR_BOUNDARY + A_RIGHT_FOUL) / 2),
  ];

  const BASE_SIZE = 7;

  return (
    <div>
      <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">打球方向</h2>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-4"
      >
        <svg viewBox="0 0 280 210" className="w-full">
          {/* 背景（極めて薄いグレーブルー） */}
          <rect width="280" height="210" fill="#f8fafc" rx="16" />

          {/* 外野ベース（超淡い芝生グリーン） */}
          <path
            d={`M${cx},${cy} L${leftPole.x.toFixed(1)},${leftPole.y.toFixed(1)} A${rOut},${rOut} 0 0,1 ${rightPole.x.toFixed(1)},${rightPole.y.toFixed(1)} Z`}
            fill="#f1f5f9"
          />

          {/* ゾーンカラーオーバーレイ */}
          {ZONES.map((z, i) => (
            <path
              key={z.label}
              d={annularSector(cx, cy, rInfield + 4, rOut, z.a1, z.a2)}
              fill="#319795"
              fillOpacity={0.06 + z.rate * 0.70}
            />
          ))}

          {/* 内野土 (より上品なサンドベージュ) */}
          <circle cx={cx} cy={cy} r={rInfield + 4} fill="#f7f3eb" />

          {/* 内野草 (淡いティールグリーン) */}
          <circle cx={cx} cy={cy} r={rInfield} fill="#e6f4f1" />

          {/* ファウルライン */}
          <line x1={cx} y1={cy} x2={leftPole.x.toFixed(1)} y2={leftPole.y.toFixed(1)} stroke="rgba(30,58,95,0.12)" strokeWidth="1" />
          <line x1={cx} y1={cy} x2={rightPole.x.toFixed(1)} y2={rightPole.y.toFixed(1)} stroke="rgba(30,58,95,0.12)" strokeWidth="1" />

          {/* 外野フェンス弧 */}
          <path
            d={`M${leftPole.x.toFixed(1)},${leftPole.y.toFixed(1)} A${rOut},${rOut} 0 0,1 ${rightPole.x.toFixed(1)},${rightPole.y.toFixed(1)}`}
            fill="none" stroke="rgba(30,58,95,0.15)" strokeWidth="1.5"
          />

          {/* ゾーン仕切り */}
          {[A_LC_BOUNDARY, A_CR_BOUNDARY].map((deg) => {
            const p = pt(cx, cy, rOut, deg);
            return (
              <line
                key={deg}
                x1={cx} y1={cy}
                x2={p.x.toFixed(1)} y2={p.y.toFixed(1)}
                stroke="rgba(30,58,95,0.08)" strokeWidth="1" strokeDasharray="4,4"
              />
            );
          })}

          {/* 内野サークル境界 */}
          <path
            d={`M${cx},${cy - rInfield} A${rInfield},${rInfield} 0 1,1 ${cx - 0.01},${cy - rInfield}`}
            fill="none" stroke="rgba(30,58,95,0.08)" strokeWidth="1"
          />

          {/* ピッチャーマウンド */}
          <circle
            cx={pitcher.x.toFixed(1)} cy={pitcher.y.toFixed(1)} r="4.5"
            fill="#e2e8f0" stroke="rgba(30,58,95,0.15)" strokeWidth="0.5"
          />

          {/* ダイヤモンドライン */}
          <polygon
            points={`${home.x},${home.y} ${first.x.toFixed(1)},${first.y.toFixed(1)} ${second.x.toFixed(1)},${second.y.toFixed(1)} ${third.x.toFixed(1)},${third.y.toFixed(1)}`}
            fill="none" stroke="rgba(30,58,95,0.18)" strokeWidth="0.8"
          />

          {/* ベース */}
          {[first, second, third].map((b, i) => (
            <rect
              key={i}
              x={(b.x - BASE_SIZE / 2).toFixed(1)}
              y={(b.y - BASE_SIZE / 2).toFixed(1)}
              width={BASE_SIZE} height={BASE_SIZE}
              fill="#ffffff" rx="1"
              stroke="rgba(30,58,95,0.15)" strokeWidth="0.5"
              transform={`rotate(45,${b.x.toFixed(1)},${b.y.toFixed(1)})`}
            />
          ))}

          {/* ホームプレート */}
          <polygon
            points={`${home.x},${home.y - 5} ${home.x + 4},${home.y - 2} ${home.x + 4},${home.y + 3} ${home.x - 4},${home.y + 3} ${home.x - 4},${home.y - 2}`}
            fill="#ffffff" stroke="rgba(30,58,95,0.15)" strokeWidth="0.5"
          />

          {/* ゾーンラベル */}
          {ZONES.map((z, i) => {
            const isHighest = total > 0 && z.rate === Math.max(pullRate, centerRate, oppositeRate);
            return (
              <g key={z.label}>
                <text
                  x={lp[i].x.toFixed(1)}
                  y={(lp[i].y - 6).toFixed(1)}
                  textAnchor="middle"
                  fill="rgba(30,58,95,0.5)"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  {z.label}
                </text>
                <text
                  x={lp[i].x.toFixed(1)}
                  y={(lp[i].y + 6).toFixed(1)}
                  textAnchor="middle"
                  fill={isHighest ? "#1e3a5f" : "#319795"}
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="sans-serif"
                >
                  {total > 0 ? `${(z.rate * 100).toFixed(0)}%` : "—"}
                </text>
              </g>
            );
          })}
        </svg>

        {/* カウント凡例 */}
        {total > 0 ? (
          <div className="flex justify-between px-1 mt-3.5 border-t border-slate-100 pt-2.5">
            {ZONES.map((z, i) => (
              <div key={z.label} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#319795", opacity: 0.15 + z.rate * 0.75 }} />
                <span className="text-slate-500 text-[10px] font-bold">{z.label} <span className="text-[#1e3a5f] font-black">{z.count}本</span></span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-300 text-xs mt-3">打球方向データなし</p>
        )}
      </motion.div>
    </div>
  );
}
