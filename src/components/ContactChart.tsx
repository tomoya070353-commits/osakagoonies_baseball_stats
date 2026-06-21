"use client";

import type { PlayerStats } from "@/types";
import { motion } from "framer-motion";

export default function ContactChart({ player }: { player: PlayerStats }) {
  const total = player.grounders + player.flies + player.liners;
  const flyRate = total > 0 ? player.flies / total : 0;
  const groRate = total > 0 ? player.grounders / total : 0;
  const linRate = total > 0 ? player.liners / total : 0;

  const maxRate = Math.max(flyRate, groRate, linRate, 0.001);

  /* 各軌道の太さ・不透明度を率から計算 */
  const trailProps = (rate: number) => ({
    sw: rate < 0.01 ? 0.8 : 1.0 + (rate / maxRate) * 3.0,
    op: rate < 0.01 ? 0.12 : 0.35 + (rate / maxRate) * 0.60,
  });

  const fp = trailProps(flyRate);
  const lp = trailProps(linRate);
  const gp = trailProps(groRate);

  /* ── SVG 座標系 ── */
  const W = 310, H = 160;
  const ox = 48, oy = 138;
  const axisTop = 12;
  const axisRight = 290;

  const sx = ox + 14, sy = oy - 18;

  const flyEnd = { x: 225, y: 22 };
  const linEnd = { x: 225, y: 85 };
  const groEnd = { x: 225, y: 134 };

  const flyCtrl = { x: 120, y: 15 };
  const linCtrl = { x: 155, y: 96 };
  const groCtrl = { x: 155, y: 148 };

  const arrowFill = "rgba(30,58,95,0.15)";

  return (
    <div>
      <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">フライ・ゴロ比率</h2>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-4"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
          <defs>
            {/* 軌道のシャドウ効果 */}
            <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* ─── Y 軸 ─── */}
          <line
            x1={ox} y1={oy} x2={ox} y2={axisTop + 8}
            stroke="rgba(30,58,95,0.15)" strokeWidth="1.2"
          />
          <polygon
            points={`${ox},${axisTop} ${ox - 3},${axisTop + 8} ${ox + 3},${axisTop + 8}`}
            fill={arrowFill}
          />

          {/* ─── X 軸 ─── */}
          <line
            x1={ox} y1={oy} x2={axisRight - 8} y2={oy}
            stroke="rgba(30,58,95,0.15)" strokeWidth="1.2"
          />
          <polygon
            points={`${axisRight},${oy} ${axisRight - 8},${oy - 3} ${axisRight - 8},${oy + 3}`}
            fill={arrowFill}
          />

          {/* ─── 軌道ライン ─── */}

          {/* フライ（スカイブルー） */}
          <path
            d={`M${sx},${sy} Q${flyCtrl.x},${flyCtrl.y} ${flyEnd.x},${flyEnd.y}`}
            fill="none" stroke="#2b6cb0"
            strokeWidth={fp.sw} strokeOpacity={fp.op} strokeLinecap="round"
            filter="url(#lineShadow)"
          />

          {/* ライナー（ロイヤルレッド） */}
          <path
            d={`M${sx},${sy} Q${linCtrl.x},${linCtrl.y} ${linEnd.x},${linEnd.y}`}
            fill="none" stroke="#e53e3e"
            strokeWidth={lp.sw} strokeOpacity={lp.op} strokeLinecap="round"
            filter="url(#lineShadow)"
          />

          {/* ゴロ（スレートグレー） */}
          <path
            d={`M${sx},${sy} L${groEnd.x},${groEnd.y}`}
            fill="none" stroke="#4a5568"
            strokeWidth={gp.sw} strokeOpacity={gp.op} strokeLinecap="round"
            filter="url(#lineShadow)"
          />

          {/* 終点ドット */}
          {[
            { pos: flyEnd, color: "#2b6cb0", op: fp.op },
            { pos: linEnd, color: "#e53e3e", op: lp.op },
            { pos: groEnd, color: "#4a5568", op: gp.op },
          ].map(({ pos, color, op }, i) => (
            <circle key={i} cx={pos.x} cy={pos.y} r="3" fill={color} fillOpacity={op} stroke="#ffffff" strokeWidth="1" />
          ))}

          {/* ─── ラベル ─── */}
          {/* フライ */}
          <text x={flyEnd.x + 8} y={flyEnd.y + 4}
            fill="#2b6cb0" fontSize="10" fontWeight="800" fontFamily="sans-serif"
            fillOpacity={flyRate < 0.01 ? 0.35 : 1}>
            フライ {(flyRate * 100).toFixed(0)}%
          </text>

          {/* ライナー */}
          <text x={linEnd.x + 8} y={linEnd.y + 4}
            fill="#e53e3e" fontSize="10" fontWeight="800" fontFamily="sans-serif"
            fillOpacity={linRate < 0.01 ? 0.35 : 1}>
            ライナー {(linRate * 100).toFixed(0)}%
          </text>

          {/* ゴロ */}
          <text x={groEnd.x + 8} y={groEnd.y + 4}
            fill="#4a5568" fontSize="10" fontWeight="800" fontFamily="sans-serif"
            fillOpacity={groRate < 0.01 ? 0.35 : 1}>
            ゴロ {(groRate * 100).toFixed(0)}%
          </text>

        </svg>
      </motion.div>
    </div>
  );
}
