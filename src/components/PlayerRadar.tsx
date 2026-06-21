"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { PlayerStats } from "@/types";

interface PlayerRadarProps {
  player: PlayerStats;
}

/* ── A〜F グレード変換 ───────────────────────────── */
interface GradeTheme {
  grade: string;
  color: string;
  gradient: string;
  bg: string;
}

function toGrade(score: number): GradeTheme {
  if (score >= 80) return { grade: "A", color: "#1e3a5f", gradient: "from-[#1e3a5f] to-[#2c5282]", bg: "rgba(30,58,95,0.04)" };
  if (score >= 60) return { grade: "B", color: "#2c5282", gradient: "from-[#2c5282] to-[#319795]", bg: "rgba(44,82,130,0.04)" };
  if (score >= 40) return { grade: "C", color: "#319795", gradient: "from-[#319795] to-[#4fd1c5]", bg: "rgba(49,151,149,0.04)" };
  if (score >= 20) return { grade: "D", color: "#b7791f", gradient: "from-[#b7791f] to-[#ecc94b]", bg: "rgba(183,121,31,0.04)" };
  if (score >= 1) return { grade: "E", color: "#dd6b20", gradient: "from-[#dd6b20] to-[#f6ad55]", bg: "rgba(221,107,32,0.04)" };
  return { grade: "F", color: "#e53e3e", gradient: "from-[#e53e3e] to-[#feb2b2]", bg: "rgba(229,62,62,0.04)" };
}

/* 弾道（1〜4）→ 表示用 */
const TRAJ_LABELS: Record<number, { label: string; grad: string; text: string; bg: string }> = {
  1: { label: "ゴロ打者", grad: "from-slate-400 to-slate-500", text: "#64748b", bg: "rgba(100,116,139,0.06)" },
  2: { label: "中間弾道", grad: "from-[#319795] to-teal-400", text: "#319795", bg: "rgba(49,151,149,0.06)" },
  3: { label: "フライ打者", grad: "from-[#2c5282] to-[#319795]", text: "#2c5282", bg: "rgba(44,82,130,0.06)" },
  4: { label: "大型アーク", grad: "from-indigo-600 to-[#1e3a5f]", text: "#4f46e5", bg: "rgba(79,70,229,0.06)" },
};

/* ── メインコンポーネント ─────────────────────────── */
export default function PlayerRadar({ player }: PlayerRadarProps) {
  const stats = [
    { label: "ミート", score: player.meet },
    { label: "パワー", score: player.power },
    { label: "走力", score: player.speed },
    { label: "選球眼", score: player.eye },
    { label: "勝負強さ", score: player.clutch },
  ];

  const radarData = stats.map((s) => ({
    subject: s.label,
    value: s.score,
    fullMark: 100,
  }));

  const trajInfo = TRAJ_LABELS[player.trajectory] ?? { label: "—", grad: "from-slate-300 to-slate-400", text: "#94a3b8", bg: "rgba(148,163,184,0.05)" };

  return (
    <div>
      <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">
        Player Radar
      </h2>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-4 overflow-hidden"
      >
        <div className="flex gap-4 items-center">

          {/* ── 左: ステータス評価テーブル ── */}
          <div className="flex flex-col gap-2 w-[48%] shrink-0">

            {/* 弾道（数値表示） */}
            <div className="flex items-center justify-between rounded-2xl px-3 py-2 border border-slate-100/50"
              style={{ background: trajInfo.bg }}>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">弾道</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: trajInfo.text }}>{trajInfo.label}</span>
                <span className={`font-black text-xs w-6 h-6 rounded-lg flex items-center justify-center text-white bg-gradient-to-r ${trajInfo.grad} shadow-sm`}>
                  {player.trajectory}
                </span>
              </div>
            </div>

            {/* ミート〜勝負強さ（A〜F グレード） */}
            {stats.map((s) => {
              const g = toGrade(s.score);
              return (
                <div key={s.label}
                  className="flex items-center justify-between rounded-2xl px-3 py-2 border border-slate-100/30"
                  style={{ background: g.bg }}>
                  <span className="text-slate-500 text-xs font-bold">{s.label}</span>
                  <div className="flex items-center gap-2">
                    {/* スコアバー */}
                    <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${g.gradient}`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    {/* グレードバッジ */}
                    <span
                      className="font-black text-sm w-6.5 h-6.5 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm"
                      style={{ 
                        backgroundImage: `linear-gradient(135deg, ${g.color}, ${g.color}dd)`,
                        boxShadow: `0 2px 6px ${g.color}30`
                      }}>
                      {g.grade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 右: レーダーチャート ── */}
          <div className="flex-1 h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <defs>
                  {/* レーダーグラデーション */}
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#319795" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(30,58,95,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name={player.name}
                  dataKey="value"
                  stroke="#319795"
                  fill="url(#radarGrad)"
                  strokeWidth={2}
                  dot={{ fill: "#319795", stroke: "#ffffff", strokeWidth: 1.5, r: 3.5 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
